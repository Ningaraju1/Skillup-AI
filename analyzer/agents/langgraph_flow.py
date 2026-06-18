from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

from analyzer.agents.nodes.skill_node import skill_node
from analyzer.agents.nodes.ats_node import ats_node
from analyzer.agents.nodes.improvement_node import improvement_node
from analyzer.agents.nodes.interview_node import interview_node


# -------------------------
# STATE (V8.1 FULL STRUCTURE)
# -------------------------
class ResumeState(TypedDict, total=False):
    resume_text: str
    job_description: str

    # NEVER REMOVE SKILLS
    skills: List[str]

    ats_result: Dict[str, Any]

    improvements: List[str]

    questions: List[Dict[str, str]]

    # NEW: CAREER INTELLIGENCE OUTPUT
    career_direction: List[str]


# -------------------------
# GRAPH BUILDER
# -------------------------
def build_graph():
    workflow = StateGraph(ResumeState)

    workflow.add_node("skill_extractor", skill_node)
    workflow.add_node("ats_analyzer", ats_node)
    workflow.add_node("improvement_generator", improvement_node)
    workflow.add_node("interview_generator", interview_node)

    workflow.set_entry_point("skill_extractor")

    workflow.add_edge("skill_extractor", "ats_analyzer")
    workflow.add_edge("ats_analyzer", "improvement_generator")
    workflow.add_edge("improvement_generator", "interview_generator")
    workflow.add_edge("interview_generator", END)

    return workflow.compile()