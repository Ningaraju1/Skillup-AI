from analyzer.services.ai_service import extract_skills


def skill_node(state):
    result = extract_skills(state.get("resume_text", ""))
    skills = []
    if isinstance(result, dict):
        skills = result.get("skills", [])
    elif isinstance(result, list):
        skills = result
    return {
        "skills": skills
    }