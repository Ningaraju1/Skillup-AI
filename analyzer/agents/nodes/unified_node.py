"""
Unified LangGraph Node (v2)
===========================
Single node that replaces the 4-node chain
(skill_node → ats_node → improvement_node → interview_node).

Calls the unified analyzer service and populates all state fields
in a single pass.
"""

from analyzer.services.unified_analyzer_service import analyze_resume_unified


def unified_analysis_node(state: dict) -> dict:
    """
    LangGraph node that performs the complete resume analysis
    in a single LLM call via the unified analyzer service.
    """
    resume_text = state.get("resume_text", "")
    job_description = state.get("job_description", "")

    result = analyze_resume_unified(resume_text, job_description)

    # Map the unified result to the LangGraph state fields
    career_intel = result.get("career_intelligence", {})

    return {
        "executive_summary": result.get("executive_summary", ""),
        "skills": result.get("skills", []),
        "ats_result": result.get("ats_result", {}),
        "career_intelligence": {
            "career_score": career_intel.get("job_compatibility_score", 0),
            "skill_gap_score": round(100 - career_intel.get("job_compatibility_score", 0), 2),
            "job_fit_label": career_intel.get("job_fit_label", "Weak Fit"),
            "category": career_intel.get("category", "General"),
            "career_path": career_intel.get("career_path", []),
            "trending_skills": career_intel.get("trending_skills", []),
        },
        "improvements": result.get("improvements", []),
        "questions": result.get("questions", []),
        "cover_letter": result.get("cover_letter", ""),
        "status": result.get("status", "ok"),
    }
