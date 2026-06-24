from analyzer.services.ats_service import calculate_ats_score


def ats_node(state):
    result = calculate_ats_score(
        state.get("resume_text", ""),
        state.get("job_description", "")
    )
    if not isinstance(result, dict):
        result = {}
    return {
        "ats_result": {
            "ats_score": result.get("ats_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "associated_skills": result.get("associated_skills", []),
            "recommendations": result.get("recommendations", [])
        }
    }