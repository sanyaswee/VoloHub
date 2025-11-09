try:
    import google.generativeai as genai
except Exception:
    genai = None

import os
from django.conf import settings
import json
import re

# --- Configure the Gemini Client ---
# Only attempt to configure if the environment indicates Django settings are set up
if genai is not None:
    try:
        if os.environ.get('DJANGO_SETTINGS_MODULE'):
            api_key = getattr(settings, 'GEMINI_API_KEY', None)
            if api_key:
                genai.configure(api_key=api_key)
    except Exception:
        # If configure fails, we'll proceed with a fallback model that raises on use
        genai = None

# Provide a fallback genai namespace and model when the package is unavailable
if genai is None:
    class _DummyGenAI:
        class types:
            class GenerationConfig:
                def __init__(self, **kwargs):
                    # Accept any config but do nothing
                    pass

        @staticmethod
        def GenerativeModel(name):
            class _DummyModel:
                def generate_content(self, *args, **kwargs):
                    # Always raise so callers fall back to heuristic behavior
                    raise RuntimeError("generativeai package not installed or configured")
            return _DummyModel()

    genai = _DummyGenAI()

# Initialize the model (real or dummy)
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception:
    # Ensure model variable exists even if generation fails
    class _DummyModel:
        def generate_content(self, *args, **kwargs):
            raise RuntimeError("generativeai model unavailable")
    model = _DummyModel()


def analyze_project_with_gemini(project_data):
    """
    Uses Google Gemini to analyze a serialized project object.
    Returns structured analysis with summary, missing_points, and suggestions.
    """

    # The prompt is largely the same, but we don't need to specify the
    # system role separately.
    prompt = f"""
    You are an expert project analyst.
    Analyze the following project data and return a JSON object with:
    - summary: short description of what the project is about
    - missing_points: list of key elements the project is missing
    - suggestions: list of practical improvement ideas
    - updated_description_suggestion: a revised project description incorporating improvements

    Project data:
    {json.dumps(project_data, indent=2)}
    """

    # Configure the model to return JSON and set the temperature
    generation_config = genai.types.GenerationConfig(
        response_mime_type="application/json",
        temperature=0.7
    )

    try:
        # Call the Gemini API
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        # The response.text will contain the JSON string
        content = response.text.strip()
        analysis_result = json.loads(content)

    except json.JSONDecodeError:
        # Fallback if model didn't return valid JSON despite the request
        analysis_result = {
            "summary": "Error: Could not parse valid JSON analysis from AI.",
            "missing_points": [],
            "suggestions": [],
            "updated_description_suggestion": ""
        }
    except Exception as e:
        # Handle other potential API errors (e.g., safety blocks, auth issues)
        print(f"Error calling Gemini API: {e}")
        analysis_result = {
            "summary": f"Error: API call failed. {e}",
            "missing_points": [],
            "suggestions": []
        }

    return analysis_result


def rank_projects_on_interests(projects, interests):
    """
    Ranks a list of projects based on how well they match the user's interests.
    Uses Gemini to score each project and returns a sorted list.
    Each returned item is a dict: {"project": <serialized project dict>, "score": <int>, "match_explanation": <str>}
    """

    ranked_projects = []

    # Precompute interest keywords for heuristic fallback
    def tokenize(s):
        return [t for t in re.split(r"[^a-zA-Z0-9]+", s.lower()) if t]

    interest_tokens = tokenize(interests or "")
    # Remove very short tokens
    interest_tokens = [t for t in interest_tokens if len(t) > 2]

    for project in projects:
        prompt = f"""
        You are an expert project recommender.
        Given the user's interests: {interests}
        Rate how well this project matches those interests on a scale of 1 to 10.
        Return only the numeric score.

        Project data:
        {json.dumps(project, indent=2)}
        """

        generation_config = genai.types.GenerationConfig(
            response_mime_type="text/plain",
            temperature=0.5
        )

        try:
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )

            score_text = response.text.strip()
            score = int(score_text)

        except Exception as e:
            # If parsing or API fails, fall back to score 0
            print(f"Error calling Gemini API for ranking: {e}")
            score = 0

        # Request a brief explanation for why this project fits the interests
        explanation = ""
        try:
            explain_prompt = f"""
            You are a concise recommender assistant.
            Given the user's interests: {interests}
            and the project data below, provide a very short (max 30 words) justification explaining why this project matches the user's interests.

            Project data:
            {json.dumps(project, indent=2)}
            """
            explain_config = genai.types.GenerationConfig(
                response_mime_type="text/plain",
                temperature=0.5,
                max_output_tokens=60
            )
            explain_resp = model.generate_content(explain_prompt, generation_config=explain_config)
            explanation = explain_resp.text.strip().replace('\n', ' ')
            # Truncate to 200 chars just in case
            if len(explanation) > 200:
                explanation = explanation[:197] + '...'
        except Exception as e:
            print(f"Error calling Gemini API for explanation: {e}")
            explanation = ""

        # Heuristic fallback: if explanation is empty, generate a short deterministic justification
        if not explanation:
            # Collect matches between interest tokens and project fields
            matches = []
            combined_fields = " ".join(
                str(project.get(k, "") or "") for k in ("name", "description", "city", "location")
            ).lower()
            for tok in interest_tokens:
                if tok in combined_fields and tok not in matches:
                    matches.append(tok)

            if matches:
                # Use up to 5 tokens in the explanation
                explanation = f"Matches interests: mentions {', '.join(matches[:5])}."
            else:
                # Fallback to a generic but informative sentence using project metadata
                # Prefer city or status when present
                city = project.get('city') or ''
                status = project.get('status') or ''
                if city:
                    explanation = f"Relevant to interests and located in {city}."
                elif status:
                    explanation = f"Relevant project in status '{status}'."
                else:
                    explanation = "Relevant to the requested interests."

        # Final deterministic fallback: if explanation is still empty (very rare), use project name/description
        if not explanation:
            name = project.get('name') or 'this project'
            desc = (project.get('description') or '').strip()
            if desc:
                short = desc if len(desc) <= 100 else desc[:97] + '...'
                explanation = f"{name}: {short}"
            else:
                explanation = f"{name}: relevant to the requested interests."

        # Ensure explanation is concise (max ~200 chars)
        if len(explanation) > 200:
            explanation = explanation[:197] + '...'

        ranked_projects.append({"project": project, "score": score, "match_explanation": explanation})

    # Sort projects by score in descending order
    ranked_projects.sort(key=lambda x: x.get('score', 0), reverse=True)

    # Build an overall summary. Try to ask the model for a concise summary; if unavailable, create a heuristic summary.
    overall_summary = ""
    try:
        # Prepare a compact prompt describing top projects and interests
        top_projects_brief = json.dumps([{"id": p["project"].get('id'), "name": p["project"].get('name'), "score": p["score"]} for p in ranked_projects[:5]])
        summary_prompt = f"""
        You are an expert summarizer.
        Given the user's interests: {interests}
        And the top ranked projects (id, name, score): {top_projects_brief}
        Produce a 1-2 sentence summary describing why these projects match the user's interests and any common themes or recommendations. Keep it under 40 words.
        Return plain text only.
        """
        summary_config = genai.types.GenerationConfig(response_mime_type="text/plain", temperature=0.5, max_output_tokens=80)
        try:
            summary_resp = model.generate_content(summary_prompt, generation_config=summary_config)
            overall_summary = summary_resp.text.strip().replace('\n', ' ')
            if len(overall_summary) > 240:
                overall_summary = overall_summary[:237] + '...'
        except Exception:
            overall_summary = ''
    except Exception:
        overall_summary = ''

    if not overall_summary:
        # Heuristic summary: top tokens and top project names
        # Count token frequencies across projects
        token_counts = {}
        for project_entry in ranked_projects:
            proj = project_entry.get('project', {})
            combined = ' '.join(str(proj.get(k, '') or '') for k in ("name", "description", "city", "location")).lower()
            for tok in interest_tokens:
                if tok in combined:
                    token_counts[tok] = token_counts.get(tok, 0) + 1

        top_tokens = sorted(token_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_tokens_list = [t for (t, _) in top_tokens]
        top_names = [p.get('project', {}).get('name') or f"project_{p.get('project', {}).get('id')}" for p in ranked_projects[:3]]
        if top_tokens_list:
            overall_summary = f"Top themes: {', '.join(top_tokens_list)}. Top projects: {', '.join(top_names)}."
        else:
            overall_summary = f"Top projects: {', '.join(top_names)}."

    # Return structured result with summary
    return {"ranked_projects": ranked_projects, "summary": overall_summary}
