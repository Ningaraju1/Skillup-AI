from analyzer.services.interview_service import generate_interview_questions


def interview_node(state):
    result = generate_interview_questions(
        state.get("resume_text", ""),
        state.get("job_description", "")
    )
    questions = []
    if isinstance(result, dict):
        questions = result.get("questions", [])
    elif isinstance(result, list):
        questions = result
    return {
        "questions": questions
    }