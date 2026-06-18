import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# -----------------------------
# CLEAN JSON HELPER
# -----------------------------
def clean_json(text: str):
    """
    Removes markdown formatting and converts LLM output into valid JSON.
    """

    # Remove ```json and ```
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)

    text = text.strip()

    try:
        return json.loads(text)
    except Exception:
        return {
            "error": "Invalid JSON from model",
            "raw_output": text
        }


# -----------------------------
# MAIN FUNCTION
# -----------------------------
def extract_skills(resume_text: str):

    prompt = f"""
You are an expert resume analyzer.

TASK:
Extract ONLY technical skills from the resume.

RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No backticks
- No extra text

OUTPUT FORMAT:
{{
    "skills": []
}}

Resume:
{resume_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    raw_output = response.choices[0].message.content

    return clean_json(raw_output)