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
    Cleans LLM output and converts it into valid Python dict.
    Removes markdown and fixes parsing issues.
    """

    # Remove markdown formatting
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
# IMPROVEMENT AGENT
# -----------------------------
def generate_improvements(resume_text, ats_result, job_description):

    prompt = f"""
You are a professional career coach and resume expert.

TASK:
Analyze the resume, ATS result, and job description and suggest improvements.

RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text
- Be specific and actionable

OUTPUT FORMAT:
{{
    "improvements": [
        "..."
    ]
}}

Resume:
{resume_text}

ATS Result:
{ats_result}

Job Description:
{job_description}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    raw_output = response.choices[0].message.content

    return clean_json(raw_output)