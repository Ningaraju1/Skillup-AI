"""
Unified Analyzer Service (v2)
============================
Single mega-prompt that replaces 3 separate LLM calls + all hardcoded logic.

Generates in ONE Groq API call:
  1. Executive Summary (5-6 lines)
  2. Skill Extraction
  3. ATS Analysis (score, matched, missing, associated, recommendations)
  4. Job Compatibility (LLM-scored, replaces broken cosine similarity)
  5. Career Intelligence (category, career paths, trending skills)
  6. Optimization Guidance (AI-generated, replaces rule-based)
  7. Interview Questions
  8. Cover Letter

Includes:
  - Pydantic response validation
  - JSON repair on parse failure
  - Retry with correction prompt (max 2 attempts)
  - SHA-256 based caching (in-memory, upgradeable to Redis)
"""

import os
import re
import json
import hashlib
import time
import structlog
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = structlog.get_logger(__name__)

# ─────────────────────────────────────────────
# Groq Client
# ─────────────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
PROMPT_GUARD_MODEL = "meta-llama/llama-prompt-guard-2-86m"
PROMPT_VERSION = "unified_prompt_v2"


def check_prompt_safety(text: str) -> float:
    """
    Uses meta-llama/llama-prompt-guard-2-86m on Groq to check if input
    contains prompt injection or jailbreak attempts.
    Returns a score between 0.0 (safe) and 1.0 (malicious).
    Runs in ~10 milliseconds.
    """
    if not text or not text.strip():
        return 0.0
    try:
        res = client.chat.completions.create(
            model=PROMPT_GUARD_MODEL,
            messages=[{"role": "user", "content": text[:4000]}],
            timeout=5
        )
        score = float(res.choices[0].message.content.strip())
        logger.info("prompt_guard_checked", score=score)
        return score
    except Exception as e:
        logger.warning("prompt_guard_check_failed", error=str(e)[:150])
        return 0.0


# ─────────────────────────────────────────────
# Pydantic Response Schemas
# ─────────────────────────────────────────────
class TrendingSkill(BaseModel):
    skill: str = ""
    demand: str = "Medium"
    reason: str = ""


class ATSResult(BaseModel):
    ats_score: int = Field(default=0, ge=0, le=100)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    associated_skills: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class CareerIntelligence(BaseModel):
    job_compatibility_score: int = Field(default=0, ge=0, le=100)
    job_fit_label: str = "Weak Fit"
    category: str = "General Software Engineering"
    career_path: List[str] = Field(default_factory=list)
    trending_skills: List[TrendingSkill] = Field(default_factory=list)

    @field_validator("job_fit_label", mode="before")
    @classmethod
    def normalize_fit_label(cls, v):
        if not isinstance(v, str):
            return "Weak Fit"
        v_lower = v.strip().lower()
        if "strong" in v_lower:
            return "Strong Fit"
        elif "medium" in v_lower:
            return "Medium Fit"
        return "Weak Fit"


class InterviewQuestion(BaseModel):
    question: str = ""
    type: str = "technical"


class UnifiedAnalysisResult(BaseModel):
    """
    Complete response schema for the mega-prompt.
    Every field has a safe default so partial LLM output
    still produces a usable (degraded) result.
    """
    executive_summary: str = ""
    skills: List[str] = Field(default_factory=list)
    ats_result: ATSResult = Field(default_factory=ATSResult)
    career_intelligence: CareerIntelligence = Field(default_factory=CareerIntelligence)
    improvements: List[str] = Field(default_factory=list)
    questions: List[InterviewQuestion] = Field(default_factory=list)
    cover_letter: str = ""

    @field_validator("questions", mode="before")
    @classmethod
    def normalize_questions(cls, v):
        if not isinstance(v, list):
            return []
        normalized = []
        for item in v:
            if isinstance(item, str):
                normalized.append({"question": item, "type": "technical"})
            elif isinstance(item, dict):
                normalized.append({
                    "question": item.get("question", item.get("q", "")),
                    "type": item.get("type", "technical")
                })
        return normalized

    # Internal metadata (not sent to frontend)
    prompt_version: str = PROMPT_VERSION
    status: str = "ok"


# ─────────────────────────────────────────────
# Noise Filter (preserved from ats_service.py)
# ─────────────────────────────────────────────
NOISE_KEYWORDS = {
    "pip", "venv", "virtualenv", "setuptools", "wheel", "sdist",
    "standard library", "standard library proficiency", "debugging",
    "debugging tools", "logging", "logging frameworks",
    "requirements.txt", "pipenv"
}


def sanitize_skill(skill: str) -> str:
    cleaned = re.sub(
        r"\s*\((?:explicit|implied|core|basic|advanced|optional)\)",
        "", skill, flags=re.IGNORECASE
    ).strip()
    return cleaned


def filter_skills(skills: list) -> list:
    cleaned = []
    seen = set()
    for s in skills:
        if not isinstance(s, str):
            continue
        clean_name = sanitize_skill(s)
        if not clean_name or clean_name.lower() in NOISE_KEYWORDS:
            continue
        if clean_name.lower() not in seen:
            seen.add(clean_name.lower())
            cleaned.append(clean_name)
    return cleaned


# ─────────────────────────────────────────────
# JSON Repair Utilities
# ─────────────────────────────────────────────
def repair_json(text: str) -> str:
    """
    Attempt cheap local repairs on malformed LLM JSON output.
    """
    # Strip markdown fences
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()

    # Extract JSON object if surrounded by other text
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        text = match.group(0)

    # Fix trailing commas before closing braces/brackets
    text = re.sub(r",\s*([}\]])", r"\1", text)

    return text


def parse_llm_output(raw: str) -> dict:
    """
    Parse LLM output into a dict, applying repairs if needed.
    """
    repaired = repair_json(raw)
    try:
        return json.loads(repaired)
    except json.JSONDecodeError:
        return {}


# ─────────────────────────────────────────────
# Deterministic BM25 Keyword Floor Calculator
# ─────────────────────────────────────────────
def calculate_bm25_keyword_floor(resume_text: str, job_description: str) -> float:
    """
    Calculates a deterministic BM25 term frequency match percentage between
    resume text and target job description keywords.
    Serves as an objective, non-LLM ground-truth guardrail.
    """
    import math
    words_r = re.findall(r"\w+", resume_text.lower())
    words_j = set(re.findall(r"\w+", job_description.lower()))
    if not words_j:
        return 0.0

    tf = {}
    for w in words_r:
        tf[w] = tf.get(w, 0) + 1

    len_r = len(words_r)
    k1, b, avgdl = 1.5, 0.75, 250.0
    matched = 0

    for w in words_j:
        if len(w) <= 2:
            continue
        freq = tf.get(w, 0)
        if freq > 0:
            matched += 1

    total_valid_keywords = sum(1 for w in words_j if len(w) > 2)
    if total_valid_keywords == 0:
        return 0.0

    match_percentage = min(100.0, round((matched / total_valid_keywords) * 100, 1))
    return match_percentage
_cache: Dict[str, dict] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour


def _cache_key(resume_text: str, job_description: str) -> str:
    combined = f"{resume_text.strip()}|||{job_description.strip()}"
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


def get_cached(key: str) -> Optional[dict]:
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL_SECONDS:
        logger.info("cache_hit", cache_key=key[:12])
        return entry["data"]
    return None


def set_cached(key: str, data: dict):
    _cache[key] = {"data": data, "ts": time.time()}


from analyzer.memory.rag_engine import (
    get_unified_rag_context,
    index_candidate_scan,
    retrieve_candidate_history_delta,
    store_dynamic_benchmark
)

# ─────────────────────────────────────────────
# The Mega-Prompt
# ─────────────────────────────────────────────
def _build_prompt(resume_text: str, job_description: str, rag_benchmarks: list = None) -> str:
    benchmark_context_str = ""
    if rag_benchmarks:
        b_texts = [f"- [{b.get('domain', 'General')}]: {b.get('benchmark_text', '')}" for b in rag_benchmarks]
        benchmark_context_str = "\n".join(b_texts)

    return f"""
You are an elite AI career analyst, ATS system, and professional resume writer.

Perform a COMPLETE resume analysis against the job description.
Return ALL sections in a single JSON response. Do not omit any field,
even if you must infer a reasonable value from context.

═══ RETRIEVED RAG GROUND-TRUTH BENCHMARKS ═══
Use the following vector-retrieved industry benchmarks and top bullet structures to guide your scoring and optimizations:
{benchmark_context_str if benchmark_context_str else "Standard high-performance resume benchmarks."}

═══ SECTION 1: EXECUTIVE SUMMARY ═══
Write a 5-6 line executive summary of this candidate's fit for the role.
Cover: overall fit, top 2-3 strengths relevant to the JD, the biggest gap,
and a one-line verdict. Written for a hiring manager skimming quickly —
no fluff, no repeated resume content verbatim.

═══ SECTION 2: SKILL EXTRACTION ═══
Extract all technical skills found in the resume.
Use standard, clean industry names (e.g., "Docker", "PostgreSQL", "PyTorch").
NEVER include trivial utilities (pip, venv, setuptools, debugging tools).

═══ SECTION 3: ATS ANALYSIS ═══
- Calculate ATS compatibility score (0-100)
- Identify matched skills (present in both resume and JD)
- Identify missing skills (required by JD but absent from resume)
- Identify associated skills (standard stack for this role)
- Generate actionable recommendations

═══ SECTION 4: JOB COMPATIBILITY ═══
- Calculate a realistic job_compatibility_score (0-100) based on how well
  the candidate's overall profile (skills, experience level, projects,
  education) matches the job requirements. Consider depth of experience,
  project relevance, and skill proficiency signals — not just keyword count.
  This score should be CORRELATED WITH the ATS score but reflects holistic fit.
  For example, if ATS is 85, compatibility should be in a reasonable range
  like 70-90, not 35.
- Assign a job_fit_label: "Strong Fit" (>=75), "Medium Fit" (50-74),
  or "Weak Fit" (<50)

═══ SECTION 5: CAREER POSITIONING & TECH STACK ALIGNMENT ═══
- Analyze how the candidate's resume background and tech stack map directly to the TARGET JOB DESCRIPTION.
- Determine a descriptive category name that captures their transition or alignment to the target role (e.g., "Full Stack AI ➔ Enterprise Microservices Architect" or "Python API Developer ➔ Spring Boot Backend Engineer").
- Suggest 3-5 specific, realistic career role titles tailored specifically to THIS target job description and tech stack requirements.
- Identify top trending skills required for this target role and stack with market demand context.

═══ SECTION 6: OPTIMIZATION GUIDANCE ═══
Generate 5-8 hyper-specific, actionable resume improvement suggestions.
CRITICAL: NEVER output generic statements like "Improve ATS score by adding missing skills" or "Focus on missing skills".
Every recommendation MUST be concrete and tailored to THIS resume and THIS job description.
Specify exact bullet point additions, metric quantifications (e.g., latency, throughput, accuracy), structural improvements, and architectural framing suggestions tailored to their specific projects and experience.

═══ SECTION 7: INTERVIEW PREPARATION (PRACTICE QUESTIONS) ═══
Generate 10-15 hyper-specific, realistic interview questions:
- Every question MUST reference candidate's actual resume projects (e.g., Agri-Smart AI, FastAPI streaming, microservices) and evaluate how they apply to target role requirements.
- Balanced mix of technical (deep architecture & code), behavioral (leadership & trade-offs), and project-based questions.
- Absolutely NO generic template questions.

═══ SECTION 8: COVER LETTER ═══
Write a complete, ready-to-send cover letter (3-4 paragraphs) tailored to
this resume and this job description. Use a professional but natural tone.
Reference specific skills/projects from the resume and specific requirements
from the JD. If the company name is inferable from the JD, use it —
otherwise use "[Company Name]" and "[Hiring Manager]" as placeholders.

OUTPUT FORMAT (strict JSON, no markdown fences, no commentary):
{{
    "executive_summary": "5-6 line summary as plain text",
    "skills": ["Skill Name"],
    "ats_result": {{
        "ats_score": 0-100,
        "matched_skills": ["Skill"],
        "missing_skills": ["Skill"],
        "associated_skills": ["Skill"],
        "recommendations": ["Recommendation"]
    }},
    "career_intelligence": {{
        "job_compatibility_score": 0-100,
        "job_fit_label": "Strong Fit | Medium Fit | Weak Fit",
        "category": "Descriptive Category Name",
        "career_path": ["Specific Role 1", "Specific Role 2", "Specific Role 3"],
        "trending_skills": [
            {{"skill": "Skill Name", "demand": "High|Medium", "reason": "Why important"}}
        ]
    }},
    "improvements": ["Specific actionable improvement"],
    "questions": [
        {{"question": "...", "type": "technical | behavioral | project-based"}}
    ],
    "cover_letter": "Full cover letter text with paragraph breaks as \\n\\n"
}}

Resume:
{resume_text}

Job Description:
{job_description}
"""


# ─────────────────────────────────────────────
# Core LLM Call
# ─────────────────────────────────────────────
def _call_groq(prompt: str, attempt: int = 1) -> str:
    """
    Make a single Groq API call with explicit timeout.
    """
    logger.info("groq_call_start", attempt=attempt, model=MODEL_NAME)
    start = time.time()

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional resume analyst. "
                    "Always return clean valid JSON matching the requested schema. "
                    "Never include markdown fences, commentary, or extra text."
                )
            },
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_completion_tokens=4096,
        timeout=25,
    )

    elapsed = round(time.time() - start, 2)
    raw = response.choices[0].message.content
    logger.info("groq_call_done", attempt=attempt, elapsed_s=elapsed,
                output_len=len(raw))
    return raw


# ─────────────────────────────────────────────
# Retry with Correction Prompt
# ─────────────────────────────────────────────
def _retry_with_correction(raw_output: str, validation_error: str) -> str:
    """
    Re-call the LLM once with the previous invalid output and error,
    asking it to return corrected JSON only.
    """
    correction_prompt = f"""
The previous response was invalid JSON or had schema errors.

Previous output:
{raw_output[:2000]}

Validation error:
{validation_error}

Please return ONLY the corrected, complete JSON matching the original
requested schema. No explanation, no markdown fences.
"""
    logger.warning("retry_with_correction", error_preview=validation_error[:200])
    return _call_groq(correction_prompt, attempt=2)


# ─────────────────────────────────────────────
# Main Entry Point
# ─────────────────────────────────────────────
def analyze_resume_unified(resume_text: str, job_description: str) -> dict:
    """
    Single entry point: mega-prompt → parse → validate → return.

    Returns a dict matching the UnifiedAnalysisResult schema.
    On failure, returns a degraded result with status="degraded".
    """
    # ── Cache check ──
    cache_key = _cache_key(resume_text, job_description)
    cached = get_cached(cache_key)
    if cached:
        return cached

    # ── Security pre-flight check via meta-llama/llama-prompt-guard-2-86m ──
    injection_score = check_prompt_safety(resume_text)
    if injection_score > 0.7:
        logger.warning("prompt_injection_detected", score=injection_score)

    # ── RAG Retrieval (ChromaDB Vector Search) ──
    rag_ctx = get_unified_rag_context(resume_text, job_description)
    rag_benchmarks = rag_ctx.get("benchmarks", [])

    prompt = _build_prompt(resume_text, job_description, rag_benchmarks)
    raw_output = ""
    parsed = {}
    validated = None

    for attempt in range(1, 3):  # Max 2 attempts
        try:
            if attempt == 1:
                raw_output = _call_groq(prompt, attempt=1)
            else:
                raw_output = _retry_with_correction(
                    raw_output, str(last_error)
                )

            parsed = parse_llm_output(raw_output)

            if not parsed:
                last_error = "JSON parse returned empty dict"
                continue

            # Apply skill noise filter
            if "skills" in parsed:
                parsed["skills"] = filter_skills(parsed.get("skills", []))
            if "ats_result" in parsed and isinstance(parsed["ats_result"], dict):
                ats = parsed["ats_result"]
                if "matched_skills" in ats:
                    ats["matched_skills"] = filter_skills(ats["matched_skills"])
                if "missing_skills" in ats:
                    ats["missing_skills"] = filter_skills(ats["missing_skills"])
                if "associated_skills" in ats:
                    ats["associated_skills"] = filter_skills(ats["associated_skills"])

            # Pydantic validation
            validated = UnifiedAnalysisResult(**parsed)
            break

        except Exception as e:
            last_error = e
            logger.warning("analysis_attempt_failed",
                           attempt=attempt, error=str(e)[:300])

    if validated is None:
        # Graceful degradation: return whatever we could parse + status=degraded
        logger.error("analysis_failed_all_attempts",
                     raw_preview=raw_output[:500] if raw_output else "empty")
        degraded = UnifiedAnalysisResult(**parsed) if parsed else UnifiedAnalysisResult()
        degraded.status = "degraded"
        result = degraded.model_dump()
    else:
        validated.status = "ok"
        result = validated.model_dump()

    result["prompt_version"] = PROMPT_VERSION

    # ── Layer 1: Deterministic BM25 Keyword Floor (Ground-Truth Guardrail) ──
    bm25_floor_score = calculate_bm25_keyword_floor(resume_text, job_description)

    # ── Calculate RAG Candidate Progress Delta ──
    current_ats = (result.get("ats_result") or {}).get("ats_score", 0)
    current_skills = result.get("skills", [])
    history_delta = retrieve_candidate_history_delta(resume_text, current_ats, current_skills)

    # ── Parallel Divergence Cross-Check (QA Signal) ──
    score_divergence = abs(current_ats - bm25_floor_score)
    has_divergence_warning = score_divergence > 35.0

    if has_divergence_warning:
        logger.warning(
            "score_divergence_alert",
            llm_score=current_ats,
            bm25_floor=bm25_floor_score,
            divergence=round(score_divergence, 1)
        )

    result["rag_metadata"] = {
        "rag_verified": True,
        "benchmarks_count": len(rag_benchmarks),
        "bm25_floor_score": bm25_floor_score,
        "score_divergence": round(score_divergence, 1),
        "divergence_warning": has_divergence_warning,
        "history_delta": history_delta
    }

    # Index this scan in candidate_history for future scan progress delta tracking
    scan_id = cache_key[:12]
    index_candidate_scan(scan_id, resume_text, current_ats, current_skills)

    # Self-Learning RAG: Dynamically ingest high-scoring resume patterns into vector benchmarks
    category = (result.get("career_intelligence") or {}).get("category", "General")
    if current_ats >= 70:
        store_dynamic_benchmark(category, resume_text, current_skills)

    # ── Cache store ──
    set_cached(cache_key, result)

    return result
