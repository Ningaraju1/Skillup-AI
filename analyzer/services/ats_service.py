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
- **IMPLICIT ECOSYSTEM EXPANSION**: If the target Job Description is very short, a single technology, a framework name, or a brief role (e.g., "django", "llm", "react", "python developer"), you MUST first implicitly expand it to its standard professional stack and associated tools, concepts, and skills (for example: if 'django' is provided, expand it to include 'Django REST Framework', 'RESTful APIs', 'Python', 'Databases/PostgreSQL/MySQL/SQLite', 'ORM', 'Celery', 'Redis', etc.; if 'llm' is provided, expand it to include 'Large Language Models', 'NLP', 'PyTorch/TensorFlow', 'LangChain', 'LlamaIndex', 'Vector Databases (Chroma/Pinecone/Milvus)', 'RAG', etc.).
- "matched_skills" MUST ONLY contain technical skills from the Resume that are directly relevant, required, mentioned, or implicitly associated with the Job Description (including its expanded ecosystem/associated skills if the input is short/minimal). DO NOT include general web development or unrelated skills (such as React, Django, HTML, CSS, JS, SQL) in "matched_skills" if the Job Description focuses on a completely different domain (like LLMs, AI, machine learning, data science, etc.) unless the job description explicitly requires them.
- "missing_skills" MUST contain the core technologies, skills, or conceptual frameworks mentioned in or associated/implied by the Job Description (including its expanded ecosystem/associated skills if the input is short/minimal) that are missing from the Resume.
- Ensure the `ats_score` and `recommendations` are calculated based on the comparison of the resume to this full expanded ecosystem.

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