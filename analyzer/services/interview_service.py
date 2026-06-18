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
    Removes markdown and ensures safe JSON parsing.
    """

    # Remove markdown wrappers
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
# INTERVIEW QUESTION AGENT
# -----------------------------
def generate_interview_questions(resume_text, job_description):

    prompt = f"""
You are an expert technical interviewer.

TASK:
Generate 10–15 realistic interview questions based on the resume and job description.

RULES:
- Mix of technical, project-based, and behavioral questions
- Must be specific to resume skills and projects
- No generic questions
- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text

OUTPUT FORMAT:
{{
    "questions": [
        {{
            "question": "...",
            "type": "technical | behavioral | project-based"
        }}
    ]
}}

Resume:
{resume_text}

Job Description:
{job_description}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    raw_output = response.choices[0].message.content

    return clean_json(raw_output)