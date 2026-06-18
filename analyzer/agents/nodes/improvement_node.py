def improvement_node(state):
    ats_result = state.get("ats_result", {})

    ats_score = ats_result.get("ats_score", 0)
    matched_skills = ats_result.get("matched_skills", [])
    missing_skills = ats_result.get("missing_skills", [])

    resume_text = state.get("resume_text", "")

    improvements = []

    if ats_score < 85:
        improvements.append("Improve ATS score by adding missing skills")

    if missing_skills:
        improvements.append(f"Focus on: {', '.join(missing_skills)}")

    return {
        "improvements": improvements
    }