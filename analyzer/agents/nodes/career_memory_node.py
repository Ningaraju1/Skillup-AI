from analyzer.memory.career_store import save_career_memory


def career_memory_node(state):
    user_id = state.get("user_id", "default")

    save_career_memory(user_id, {
        "skills": state.get("skills", []),
        "ats_result": state.get("ats_result", {}),
        "improvements": state.get("improvements", [])
    })

    return {
        "memory_updated": True
    }