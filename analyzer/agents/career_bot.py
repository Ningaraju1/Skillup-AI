from typing import Dict, Any


class CareerCopilotBot:

    def generate_report(self, skills, ats_result, career_intel):
        """
        This is your "AI BOT BRAIN"
        (rule-based + deterministic, no OpenAI needed)
        """

        score = career_intel["career_score"]
        label = career_intel["job_fit_label"]
        gap = career_intel["skill_gap_score"]

        missing = ats_result.get("missing_skills", [])
        matched = ats_result.get("matched_skills", [])

        # -------------------------
        # BOT RESPONSE LOGIC
        # -------------------------
        if label == "Strong Fit":
            advice = "You are job-ready. Focus on refining system design & interview prep."
        elif label == "Medium Fit":
            advice = "You are close. Improve missing skills and strengthen projects."
        else:
            advice = "You need foundational upgrades before applying aggressively."

        # -------------------------
        # CAREER INSIGHT ENGINE
        # -------------------------
        insight = {
            "summary": f"Your resume match score is {score}%, which is a {label}.",
            "strengths": matched[:5],
            "weaknesses": missing[:5],
            "career_advice": advice,
            "gap_analysis": f"You are missing {len(missing)} key skills impacting ATS ranking.",
            "next_steps": [
                "Improve missing technical skills",
                "Add stronger project descriptions",
                "Optimize resume keywords for ATS",
                "Practice interview questions"
            ]
        }

        return insight