from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any

from analyzer.agents.nodes.skill_node import skill_node
from analyzer.agents.nodes.ats_node import ats_node
from analyzer.agents.nodes.improvement_node import improvement_node
from analyzer.agents.nodes.interview_node import interview_node

from analyzer.agents.nodes.career_memory_node import career_memory_node
from analyzer.agents.nodes.job_trend_node import job_trend_node


# -------------------------
# FINAL STATE (CAREER COPILOT)
# -------------------------
class CareerState(TypedDict):
    user_id: str

    resume_text: str
    job_description: str

    skills: List[str]
    ats_result: Dict[str, Any]
    improvements: List[str]
    questions: List[Dict[str, str]]

    job_trends: Dict[str, int]
    memory_updated: bool


# -------------------------
# GRAPH BUILDER
# -------------------------
def build_career_graph():

    workflow = StateGraph(CareerState)

    # Core AI pipeline
    workflow.add_node("skill_extractor", skill_node)
    workflow.add_node("ats_analyzer", ats_node)
    workflow.add_node("improvement_generator", improvement_node)
    workflow.add_node("interview_generator", interview_node)

    # NEW AI LAYERS
    workflow.add_node("job_trend_analyzer", job_trend_node)
    workflow.add_node("career_memory", career_memory_node)

    # Entry
    workflow.set_entry_point("skill_extractor")

    # FLOW (ENHANCED COPILOT PIPELINE)
    workflow.add_edge("skill_extractor", "ats_analyzer")
    workflow.add_edge("ats_analyzer", "improvement_generator")
    workflow.add_edge("improvement_generator", "job_trend_analyzer")
    workflow.add_edge("job_trend_analyzer", "interview_generator")
    workflow.add_edge("interview_generator", "career_memory")
    workflow.add_edge("career_memory", END)

    return workflow.compile()