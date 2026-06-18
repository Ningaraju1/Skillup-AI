import json

CAREER_MEMORY = {}


def save_career_memory(user_id: str, data: dict):
    """
    Stores evolving career profile for reasoning
    """
    if user_id not in CAREER_MEMORY:
        CAREER_MEMORY[user_id] = {
            "resume_versions": [],
            "skill_growth": [],
            "job_history": [],
            "ats_history": []
        }

    CAREER_MEMORY[user_id]["resume_versions"].append(data)


def get_career_memory(user_id: str):
    return CAREER_MEMORY.get(user_id, {})


def update_skill_growth(user_id: str, skills: list):
    memory = CAREER_MEMORY.setdefault(user_id, {
        "resume_versions": [],
        "skill_growth": [],
        "job_history": [],
        "ats_history": []
    })

    memory["skill_growth"].append(skills)