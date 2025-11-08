import google.generativeai as genai
from django.conf import settings
import json

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
            "suggestions": []
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