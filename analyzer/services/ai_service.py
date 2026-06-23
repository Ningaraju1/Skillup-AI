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


# -----------------------------
# INTERVIEW ANSWER EVALUATOR
# -----------------------------
def evaluate_interview_answer(question: str, user_answer: str, question_type: str):
    prompt = f"""
You are an expert tech recruiter and interview coach.

Evaluate the user's response to the following interview question:
Question Type: {question_type}
Question: {question}
User's Answer: {user_answer}

Provide constructive feedback in VALID JSON. Do not include markdown, backticks, or explanations outside the JSON.

OUTPUT FORMAT:
{{
    "score": 0-100,
    "strengths": ["what they did well (short points)"],
    "improvements": ["what they could improve (short points)"],
    "model_answer": "a model answer or a rewritten version of their answer showing how they could answer it perfectly"
}}
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