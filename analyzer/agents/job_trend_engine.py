# V7 - Advanced Job Trend Intelligence Engine

from typing import Dict, List


# -------------------------
# EXPANDED REAL-WORLD TRENDING SKILLS (2025+ MARKET)
# -------------------------
TRENDING_SKILLS = {

    # ---------------- AI / ML CORE ----------------
    "ai_ml": [
        "Machine Learning",
        "Deep Learning",
        "Neural Networks",
        "NLP",
        "Computer Vision",
        "Transformers",
        "LLMs",
        "Generative AI",
        "Prompt Engineering",
        "Reinforcement Learning",
        "PyTorch",
        "TensorFlow",
        "Scikit-learn"
    ],

    # ---------------- DATA SCIENCE ----------------
    "data_science": [
        "Data Science",
        "Data Analysis",
        "Pandas",
        "NumPy",
        "Matplotlib",
        "Seaborn",
        "Statistics",
        "Probability",
        "Feature Engineering",
        "EDA",
        "Data Cleaning",
        "Data Visualization"
    ],

    # ---------------- BIG DATA ----------------
    "big_data": [
        "Apache Spark",
        "Hadoop",
        "Kafka",
        "Databricks",
        "ETL Pipelines",
        "Data Warehousing"
    ],

    # ---------------- CLOUD / DEVOPS ----------------
    "cloud_devops": [
        "AWS",
        "Azure",
        "GCP",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "Terraform",
        "Linux",
        "Microservices"
    ],

    # ---------------- BACKEND / FULL STACK ----------------
    "backend": [
        "Python",
        "Django",
        "FastAPI",
        "Flask",
        "Node.js",
        "REST API",
        "GraphQL",
        "MySQL",
        "PostgreSQL",
        "MongoDB"
    ],

    # ---------------- FRONTEND ----------------
    "frontend": [
        "React",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "HTML",
        "CSS",
        "Redux",
        "Tailwind CSS"
    ],

    # ---------------- SYSTEM DESIGN ----------------
    "system_design": [
        "System Design",
        "Scalability",
        "Load Balancing",
        "Caching",
        "Redis",
        "Message Queues",
        "Low Level Design",
        "High Level Design"
    ]
}


# -------------------------
# MAIN ANALYSIS ENGINE
# -------------------------
def analyze_trends(resume_skills: List[str]) -> Dict:

    resume_set = set([s.lower().strip() for s in resume_skills])

    result = {
        "matched_categories": {},
        "missing_high_demand_skills": [],
        "overall_strength_area": None,
        "career_direction": []
    }

    category_scores = {}

    # -------------------------
    # CATEGORY MATCHING
    # -------------------------
    for category, skills in TRENDING_SKILLS.items():

        matched = []
        missing = []

        for skill in skills:
            if skill.lower() in resume_set:
                matched.append(skill)
            else:
                missing.append(skill)

        category_scores[category] = len(matched) / len(skills)

        result["matched_categories"][category] = {
            "matched": matched,
            "missing": missing[:5]
        }

        result["missing_high_demand_skills"].extend(missing[:3])

    # -------------------------
    # DETERMINE STRONGEST AREA
    # -------------------------
    best_category = max(category_scores, key=category_scores.get)
    result["overall_strength_area"] = best_category

    # -------------------------
    # CAREER PATH GENERATION
    # -------------------------
    if best_category == "ai_ml":
        result["career_direction"] = [
            "AI Engineer",
            "Machine Learning Engineer",
            "Data Scientist"
        ]

    elif best_category == "data_science":
        result["career_direction"] = [
            "Data Analyst",
            "Data Scientist",
            "Business Analyst"
        ]

    elif best_category == "backend":
        result["career_direction"] = [
            "Backend Developer",
            "Full Stack Developer",
            "API Engineer"
        ]

    elif best_category == "frontend":
        result["career_direction"] = [
            "Frontend Developer",
            "React Developer",
            "UI Engineer"
        ]

    elif best_category == "cloud_devops":
        result["career_direction"] = [
            "DevOps Engineer",
            "Cloud Engineer",
            "Platform Engineer"
        ]

    elif best_category == "system_design":
        result["career_direction"] = [
            "Software Engineer",
            "System Architect",
            "Backend Engineer"
        ]

    return result