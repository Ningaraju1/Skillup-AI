from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Resume
from .services.pdf_parser import extract_text

from analyzer.agents.langgraph_flow import build_graph
from analyzer.memory.embedding import get_embedding
from analyzer.memory.vector_store import store_resume_embedding

import math
import re


# -------------------------
# COSINE SIMILARITY ENGINE (V9)
# -------------------------
def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    return dot / (norm_a * norm_b + 1e-9)


# -------------------------
# SKILL CATEGORY ENGINE (V9)
# -------------------------
def detect_category(skills: list):

    skill_text = " ".join([s.lower() for s in skills])

    if any(x in skill_text for x in ["pytorch", "tensorflow", "nlp", "llm", "transformer", "opencv"]):
        return "ai_ml"

    if any(x in skill_text for x in ["pandas", "numpy", "sql", "power bi", "excel", "tableau"]):
        return "data_science"

    if any(x in skill_text for x in ["testing", "qa", "selenium", "cypress", "playwright", "junit", "testng", "sdet", "postman", "jmeter"]):
        return "software_testing"

    if any(x in skill_text for x in ["django", "fastapi", "node", "api", "springboot", "spring boot", "mern", "mean", "spring framework", "hibernate", "jpa", "express", "express.js"]) or bool(re.search(r'\bjava\b', skill_text)):
        return "backend"

    if any(x in skill_text for x in ["react", "html", "css", "javascript", "nextjs", "next.js", "wordpress", "angular", "angularjs"]):
        return "frontend"

    if any(x in skill_text for x in ["aws", "docker", "kubernetes", "ci/cd", "gcp", "azure"]):
        return "cloud_devops"

    return "system_design"


# -------------------------
# CAREER PATH ENGINE (YOUR LOGIC PRESERVED + EXPANDED)
# -------------------------
def generate_career_path(category: str):

    if category == "ai_ml":
        return ["AI Engineer", "Machine Learning Engineer", "Data Scientist"]

    elif category == "data_science":
        return ["Data Analyst", "Data Scientist", "Business Analyst"]

    elif category == "software_testing":
        return ["QA Engineer", "Software Development Engineer in Test (SDET)", "Automation Test Engineer"]

    elif category == "backend":
        return ["Backend Developer", "Full Stack Developer", "API Engineer"]

    elif category == "frontend":
        return ["Frontend Developer", "React Developer", "UI Engineer"]

    elif category == "cloud_devops":
        return ["DevOps Engineer", "Cloud Engineer", "Platform Engineer"]

    elif category == "system_design":
        return ["Software Engineer", "System Architect", "Backend Engineer"]

    return ["Software Engineer"]


# -------------------------
# CAREER INTELLIGENCE ENGINE (V9)
# -------------------------
def compute_intelligence(resume_emb, job_emb, skills):

    similarity = cosine_similarity(resume_emb, job_emb)

    career_score = round(similarity * 100, 2)
    skill_gap_score = round(100 - career_score, 2)

    if career_score >= 75:
        label = "Strong Fit"
    elif career_score >= 50:
        label = "Medium Fit"
    else:
        label = "Weak Fit"

    category = detect_category(skills)
    career_path = generate_career_path(category)

    return career_score, skill_gap_score, label, category, career_path


# -------------------------
# API VIEW (V9 SAAS CORE)
# -------------------------
class ResumeUploadView(APIView):

    def post(self, request):

        file = request.FILES.get("resume")
        job_description = request.data.get("job_description")

        if not file or not job_description:
            return Response(
                {"error": "resume and job_description required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # SAVE RESUME
        # -------------------------
        resume = Resume.objects.create(resume_file=file)

        # -------------------------
        # EXTRACT TEXT
        # -------------------------
        resume_text = extract_text(resume.resume_file.path)

        # -------------------------
        # LANGGRAPH PIPELINE
        # -------------------------
        graph = build_graph()

        result = graph.invoke({
            "resume_text": resume_text,
            "job_description": job_description,
            "skills": [],
            "ats_result": {},
            "improvements": [],
            "questions": []
        })

        # -------------------------
        # SAFE EXTRACTION
        # -------------------------
        skills = result.get("skills", []) or []
        ats_result = result.get("ats_result") or {}

        improvements = result.get("improvements", []) or []
        questions = result.get("questions", []) or []

        # -------------------------
        # EMBEDDINGS
        # -------------------------
        resume_emb = get_embedding(resume_text)
        job_emb = get_embedding(job_description)

        career_score, skill_gap_score, job_fit_label, category, career_path = compute_intelligence(
            resume_emb,
            job_emb,
            skills
        )

        # -------------------------
        # SAVE DB
        # -------------------------
        resume.skills = skills
        resume.ats_score = ats_result.get("ats_score", 0)
        resume.improvements = improvements
        resume.save()

        # -------------------------
        # VECTOR STORE (V9 MEMORY LAYER)
        # -------------------------
        store_resume_embedding(
            resume_id=resume.id,
            embedding=resume_emb,
            ats_result=ats_result,
            career_score=career_score,
            skill_gap_score=skill_gap_score,
            job_fit_label=job_fit_label,
            career_direction=career_path
        )

        # -------------------------
        # RESPONSE (V9 SAAS OUTPUT)
        # -------------------------
        return Response({
            "resume_id": resume.id,

            "skills": skills,
            "ats_result": ats_result,

            "career_intelligence": {
                "career_score": career_score,
                "skill_gap_score": skill_gap_score,
                "job_fit_label": job_fit_label,
                "category": category,
                "career_path": career_path
            },

            "improvements": improvements,
            "questions": questions
        }, status=status.HTTP_200_OK)