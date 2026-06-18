# MOCK JOB TREND ENGINE (upgrade later with scraping / APIs)

TREND_DB = {
    "python": 95,
    "django": 80,
    "react": 90,
    "machine learning": 98,
    "cloud": 85,
    "sql": 88,
    "java": 70,
}


def get_job_trend_score(skill: str) -> int:
    return TREND_DB.get(skill.lower(), 50)


def analyze_skill_demand(skills: list):
    return {
        skill: get_job_trend_score(skill)
        for skill in skills
    }