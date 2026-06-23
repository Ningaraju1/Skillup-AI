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
# CLEAN JSON FUNCTION
# -----------------------------
def clean_json(text: str):
    """
    Converts LLM output into valid Python dict.
    Removes markdown and handles parsing safely.
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
# ATS SCORE FUNCTION
# -----------------------------
def calculate_ats_score(resume_text, job_description):

    prompt = f"""
You are an expert ATS (Applicant Tracking System) evaluator.

TASK:
Compare the resume with the job description and evaluate how well they match.

RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text
- Be strict, realistic, and highly selective.
- "matched_skills" MUST ONLY contain technical skills from the Resume that are directly relevant, required, or mentioned in the Job Description. DO NOT include general web development or unrelated skills (such as React, Django, HTML, CSS, JS, SQL) in "matched_skills" if the Job Description focuses on a completely different domain (like LLMs, AI, machine learning, data science, etc.) unless the job description explicitly requires them.
- "missing_skills" MUST contain the core technologies, skills, or conceptual frameworks mentioned or implied by the Job Description that are missing from the Resume.

OUTPUT FORMAT:
{{
    "ats_score": 0-100,
    "matched_skills": [],
    "missing_skills": [],
    "recommendations": []
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
        temperature=0.2
    )

    raw_output = response.choices[0].message.content

    return clean_json(raw_output)