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
# TRIVIAL / NOISE SKILLS FILTER
# -----------------------------
NOISE_KEYWORDS = {
    "pip", "venv", "virtualenv", "setuptools", "wheel", "sdist",
    "standard library", "standard library proficiency", "debugging", "debugging tools",
    "logging", "logging frameworks", "requirements.txt", "pipenv"
}


def sanitize_skill(skill: str) -> str:
    """Clean parentheses and extra tags like (explicit), (implied)"""
    cleaned = re.sub(r"\s*\((?:explicit|implied|core|basic|advanced|optional)\)", "", skill, flags=re.IGNORECASE).strip()
    return cleaned


def filter_skills(skills: list) -> list:
    cleaned = []
    seen = set()
    for s in skills:
        if not isinstance(s, str):
            continue
        clean_name = sanitize_skill(s)
        if not clean_name:
            continue
        if clean_name.lower() in NOISE_KEYWORDS:
            continue
        if clean_name.lower() not in seen:
            seen.add(clean_name.lower())
            cleaned.append(clean_name)
    return cleaned


# -----------------------------
# CLEAN JSON FUNCTION
# -----------------------------
def clean_json(text: str):
    """
    Converts LLM output into valid Python dict.
    Removes markdown and handles parsing safely.
    """
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    text = text.strip()

    # Extract JSON substring if surrounded by other text
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        text = match.group(0)

    try:
        data = json.loads(text)
        if isinstance(data, dict):
            if "matched_skills" in data and isinstance(data["matched_skills"], list):
                data["matched_skills"] = filter_skills(data["matched_skills"])
            if "missing_skills" in data and isinstance(data["missing_skills"], list):
                data["missing_skills"] = filter_skills(data["missing_skills"])
            if "associated_skills" in data and isinstance(data["associated_skills"], list):
                data["associated_skills"] = filter_skills(data["associated_skills"])
        return data
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
You are an elite ATS (Applicant Tracking System) recruiter and technical auditor.

TASK:
Compare the candidate's resume with the job description to calculate ATS compatibility, identify matched skills, missing essential skills, and actionable recommendations.

CRITICAL GUIDELINES FOR SKILLS:
- Use standard, clean industry names (e.g., "Docker", "PostgreSQL", "Celery", "Redis", "Django REST Framework", "PyTorch", "Kubernetes", "CI/CD").
- NEVER include trivial or generic developer utilities (e.g., do NOT include "pip", "venv", "virtualenv", "setuptools", "Standard Library", "wheel", "debugging tools", "logging frameworks", "requirements.txt").
- NEVER add parenthetical tags like "(explicit)", "(implied)", "(basic)" to skill names.
- "matched_skills": Technical skills present in the resume that are directly relevant to the target role/job description.
- "missing_skills": The top 5 to 10 high-value technologies, frameworks, and architecture concepts expected for the role that are absent from the resume.
- "associated_skills": The standard technical stack skills for this role profile.
- "recommendations": Concrete, high-impact bullet points to improve the resume for this role.

OUTPUT FORMAT:
{{
    "ats_score": 0-100,
    "matched_skills": ["Clean Skill Name"],
    "missing_skills": ["Clean Skill Name"],
    "associated_skills": ["Clean Skill Name"],
    "recommendations": ["Actionable recommendation"]
}}

Resume:
{resume_text}

Job Description:
{job_description}
"""

    model_name = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": "You are a professional ATS system. Always return clean valid JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2
    )

    raw_output = response.choices[0].message.content

    return clean_json(raw_output)