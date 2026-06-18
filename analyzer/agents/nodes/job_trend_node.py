from analyzer.services.job_trends import analyze_skill_demand


def job_trend_node(state):
    skills = state.get("skills", [])

    trend_analysis = analyze_skill_demand(skills)

    return {
        "job_trends": trend_analysis
    }