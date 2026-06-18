import chromadb
import json
from typing import List, Any, Dict

# -------------------------
# CHROMA CLIENT (SaaS READY)
# -------------------------
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="resumes")


# -------------------------
# SAFE SERIALIZER
# -------------------------
def _to_json(value: Any) -> str:
    if value is None:
        return "[]"
    try:
        return json.dumps(value)
    except Exception:
        return "[]"


# -------------------------
# SAFE FLOAT
# -------------------------
def _safe_float(value: Any) -> float:
    try:
        return float(value)
    except Exception:
        return 0.0


# -------------------------
# MAIN V9 STORAGE ENGINE
# -------------------------
def store_resume_embedding(
    resume_id: int,
    embedding: List[float],
    ats_result: Dict[str, Any],
    career_score: float = 0.0,
    skill_gap_score: float = 0.0,
    job_fit_label: str = "Unknown",
    career_direction: List[str] = None,
):
    """
    V9 SaaS Memory Layer:
    - ATS intelligence
    - Career scoring
    - Job fit classification
    - Career path storage
    """

    ats_score = _safe_float(ats_result.get("ats_score", 0))

    matched_skills = ats_result.get("matched_skills", [])
    missing_skills = ats_result.get("missing_skills", [])
    recommendations = ats_result.get("recommendations", [])

    collection.add(
        ids=[str(resume_id)],
        embeddings=[embedding],
        metadatas=[{
            "resume_id": str(resume_id),
            "ats_score": ats_score,

            "career_score": _safe_float(career_score),
            "skill_gap_score": _safe_float(skill_gap_score),
            "job_fit_label": job_fit_label,

            "career_direction": _to_json(career_direction or []),

            "matched_skills": _to_json(matched_skills),
            "missing_skills": _to_json(missing_skills),
            "recommendations": _to_json(recommendations),
        }]
    )