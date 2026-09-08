"""
SkillUp AI — Views (v2 Synchronous)
=====================================
All resume intelligence is generated via the unified mega-prompt in ~3-5 seconds.
Direct synchronous execution — zero Celery or Redis dependencies required.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Resume
from .services.pdf_parser import extract_text

from analyzer.agents.langgraph_flow import build_graph
from analyzer.memory.embedding import get_embedding
from analyzer.memory.vector_store import store_resume_embedding
from analyzer.services.ai_service import evaluate_interview_answer

import structlog

logger = structlog.get_logger(__name__)


# ─────────────────────────────────────────────
# Helper: Run unified pipeline inline
# ─────────────────────────────────────────────
def _run_pipeline_sync(resume_text: str, job_description: str) -> dict:
    """
    Runs the LangGraph unified pipeline inline.
    Executes Groq mega-prompt, Pydantic validation, and noise filtering.
    """
    graph = build_graph()
    return graph.invoke({
        "resume_text": resume_text,
        "job_description": job_description,
        "skills": [],
        "ats_result": {},
        "career_intelligence": {},
        "improvements": [],
        "questions": [],
        "executive_summary": "",
        "cover_letter": "",
        "status": "processing",
    })


# ─────────────────────────────────────────────
# Helper: Build API response from pipeline result
# ─────────────────────────────────────────────
def _build_response(result: dict, resume_id: int) -> dict:
    """
    Extracts and structures the unified pipeline result
    into the API response format the frontend expects.
    """
    skills = result.get("skills", []) or []
    ats_result = result.get("ats_result") or {}
    career_intel = result.get("career_intelligence") or {}
    improvements = result.get("improvements", []) or []
    questions = result.get("questions", []) or []
    executive_summary = result.get("executive_summary", "") or ""
    cover_letter = result.get("cover_letter", "") or ""
    pipeline_status = result.get("status", "ok")

    return {
        "resume_id": resume_id,
        "status": pipeline_status,
        "executive_summary": executive_summary,
        "skills": skills,
        "ats_result": ats_result,
        "career_intelligence": {
            "career_score": career_intel.get("career_score",
                            career_intel.get("job_compatibility_score", 0)),
            "skill_gap_score": career_intel.get("skill_gap_score",
                               round(100 - career_intel.get("career_score",
                               career_intel.get("job_compatibility_score", 0)), 2)),
            "job_fit_label": career_intel.get("job_fit_label", "Weak Fit"),
            "category": career_intel.get("category", "General"),
            "career_path": career_intel.get("career_path", []),
            "trending_skills": career_intel.get("trending_skills", []),
        },
        "improvements": improvements,
        "questions": questions,
        "cover_letter": cover_letter,
        "rag_metadata": result.get("rag_metadata", {}),
    }


# ─────────────────────────────────────────────
# UPLOAD VIEW
# ─────────────────────────────────────────────
class ResumeUploadView(APIView):

    def post(self, request):
        file = request.FILES.get("resume")
        job_description = request.data.get("job_description")

        if not file or not job_description:
            return Response(
                {"error": "resume and job_description required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Save resume file
            resume = Resume.objects.create(resume_file=file)

            # Extract text from uploaded file
            resume_text = extract_text(resume.resume_file.path)

            # ── Direct Synchronous Execution ──
            result = _run_pipeline_sync(resume_text, job_description)

            # Extract fields for DB storage
            skills = result.get("skills", []) or []
            ats_result = result.get("ats_result") or {}
            improvements = result.get("improvements", []) or []
            career_intel = result.get("career_intelligence") or {}

            # Save to DB
            resume.skills = skills
            resume.ats_score = ats_result.get("ats_score", 0)
            resume.improvements = improvements
            resume.save()

            # Vector store (non-critical background indexing)
            try:
                resume_emb = get_embedding(resume_text)
                career_score = career_intel.get("career_score",
                               career_intel.get("job_compatibility_score", 0))
                store_resume_embedding(
                    resume_id=resume.id,
                    embedding=resume_emb,
                    ats_result=ats_result,
                    career_score=career_score,
                    skill_gap_score=round(100 - career_score, 2),
                    job_fit_label=career_intel.get("job_fit_label", "Unknown"),
                    career_direction=career_intel.get("career_path", [])
                )
            except Exception:
                pass  # Vector store is non-critical

            return Response(
                _build_response(result, resume.id),
                status=status.HTTP_200_OK
            )

        except Exception as e:
            import traceback
            traceback.print_exc()
            logger.error("upload_failed", error=str(e)[:300])
            return Response(
                {"error": f"Resume analysis failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────
# STATUS VIEW (Legacy compatibility)
# ─────────────────────────────────────────────
class ResumeStatusView(APIView):
    """Legacy endpoint returning completed status for backwards compatibility."""

    def get(self, request, job_id):
        return Response({"status": "ok", "job_id": job_id}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# INTERVIEW EVALUATE VIEW
# ─────────────────────────────────────────────
class InterviewAnswerEvaluateView(APIView):

    def post(self, request):
        question = request.data.get("question")
        answer = request.data.get("answer")
        q_type = request.data.get("type", "General")

        if not question or not answer:
            return Response(
                {"error": "question and answer required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            feedback = evaluate_interview_answer(question, answer, q_type)
            return Response(feedback, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Answer evaluation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────
# RESUME LIST VIEW
# ─────────────────────────────────────────────
class ResumeListView(APIView):

    def get(self, request):
        action = request.query_params.get("action")
        if action == "clear":
            count, _ = Resume.objects.all().delete()
            return Response(
                {"message": f"Successfully deleted {count} records from database"},
                status=status.HTTP_200_OK
            )

        resumes = Resume.objects.all().order_by("-uploaded_at")
        data = []
        for r in resumes:
            data.append({
                "id": r.id,
                "uploaded_at": r.uploaded_at.isoformat(),
                "resume_file": r.resume_file.url if r.resume_file else None,
                "skills": r.skills,
                "ats_score": r.ats_score,
                "improvements": r.improvements
            })
        return Response(data, status=status.HTTP_200_OK)