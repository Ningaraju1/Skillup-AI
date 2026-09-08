/**
 * Resume API Service (v2)
 * ========================
 * - Supports both sync and async (polling) upload flows
 * - Stores executive_summary and cover_letter in reports
 * - Polls /status/<job_id>/ when backend returns 202 Accepted
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ─── Local Storage Helpers ───

export const getReports = () => {
  try {
    const reports = localStorage.getItem('resume_reports');
    return reports ? JSON.parse(reports) : [];
  } catch (error) {
    console.error('Error reading reports from localStorage:', error);
    return [];
  }
};

export const getReportById = (id) => {
  const reports = getReports();
  return reports.find(r => String(r.id) === String(id)) || null;
};

export const saveReport = (report) => {
  try {
    const reports = getReports();
    const filtered = reports.filter(r => String(r.id) !== String(report.id));
    const updated = [report, ...filtered];
    localStorage.setItem('resume_reports', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving report to localStorage:', error);
    return [];
  }
};

export const deleteReport = (id) => {
  try {
    const reports = getReports();
    const updated = reports.filter(r => String(r.id) !== String(id));
    localStorage.setItem('resume_reports', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error deleting report:', error);
    return getReports();
  }
};


// ─── Poll for async result ───

const pollForResult = async (jobId, maxAttempts = 60, intervalMs = 2000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${API_BASE_URL}/api/resume/status/${jobId}/`);
    if (!response.ok) {
      throw new Error(`Status check failed with ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'processing') {
      // Still processing — wait and poll again
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      continue;
    }

    if (data.status === 'error') {
      throw new Error(data.error || 'Analysis failed on the server');
    }

    // Done (status: "ok" or "degraded")
    return data;
  }

  throw new Error('Analysis timed out. Please try again.');
};


// ─── Upload Resume ───

export const uploadResume = async (file, jobDescription, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('job_description', jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/resume/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${response.status}`);
  }

  let result = await response.json();

  // If backend returned 202 (async mode), poll for result
  if (response.status === 202 && result.job_id) {
    if (onProgress) onProgress('analyzing');
    result = await pollForResult(result.job_id);
  }

  // Map result to a historical report record
  const newReport = {
    id: result.resume_id || result.job_id || Date.now(),
    timestamp: new Date().toISOString(),
    fileName: file.name,
    jobDescription: jobDescription,
    status: result.status || 'ok',

    // New in v2
    executive_summary: result.executive_summary || '',

    skills: result.skills || [],
    ats_result: {
      ats_score: result.ats_result?.ats_score || 0,
      matched_skills: result.ats_result?.matched_skills || [],
      missing_skills: result.ats_result?.missing_skills || [],
      associated_skills: result.ats_result?.associated_skills || [],
      recommendations: result.ats_result?.recommendations || []
    },
    career_intelligence: result.career_intelligence || {
      career_score: 0,
      skill_gap_score: 100,
      job_fit_label: 'Weak Fit',
      category: 'General',
      career_path: ['Software Engineer']
    },
    improvements: result.improvements || [],
    questions: result.questions || [],

    // New in v2
    cover_letter: result.cover_letter || '',
    rag_metadata: result.rag_metadata || {},
  };

  saveReport(newReport);
  return newReport;
};


// ─── Evaluate Interview Answer (unchanged) ───

export const evaluateAnswer = async (question, answer, type) => {
  const response = await fetch(`${API_BASE_URL}/api/resume/evaluate-answer/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, answer, type }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Evaluation failed with status ${response.status}`);
  }

  return await response.json();
};
