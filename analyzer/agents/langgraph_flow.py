from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

from analyzer.agents.nodes.unified_node import unified_analysis_node


# -------------------------
# STATE (V2 UNIFIED)
# -------------------------
class ResumeState(TypedDict, total=False):
    resume_text: str
    job_description: str

    # NEW: Executive summary (5-6 lines)
    executive_summary: str

    # Core analysis outputs
    skills: List[str]
    ats_result: Dict[str, Any]

    # NEW: LLM-generated career intelligence (replaces hardcoded)
    career_intelligence: Dict[str, Any]

    improvements: List[str]
    questions: List[Dict[str, str]]

    # NEW: Tailored cover letter
    cover_letter: str

    # NEW: Pipeline status ("ok" | "degraded" | "error")
    status: str


# -------------------------
# GRAPH BUILDER (V2 — SINGLE NODE)
# -------------------------
def build_graph():
    workflow = StateGraph(ResumeState)

    # ONE node replaces the previous 4-node chain
    workflow.add_node("unified_analyzer", unified_analysis_node)

    workflow.set_entry_point("unified_analyzer")
    workflow.add_edge("unified_analyzer", END)

    return workflow.compile()