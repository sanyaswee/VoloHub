import google.generativeai as genai
from django.conf import settings
import json
import re

# --- Configure the Gemini Client ---
# This line assumes your API key is stored in settings.GEMINI_API_KEY
# You only need to run this configuration once, typically in your app's setup.
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
except AttributeError:
    # Handle case where the setting might be missing
    print("Warning: settings.GEMINI_API_KEY is not defined.")
    # You might want to raise an ImproperlyConfigured exception here

# --- Initialize the Model ---
# We'll initialize the model here to be reused.
# 'gemini-1.5-flash-latest' is a good, fast alternative to 'gpt-4o-mini'.
# You could also use 'gemini-1.5-pro-latest' for higher-quality analysis.
model = genai.GenerativeModel('gemini-2.5-flash')


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

    return ranked_projects
