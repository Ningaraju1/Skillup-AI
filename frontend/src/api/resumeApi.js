const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

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
    // Prevent duplicate entries by ID
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

export const uploadResume = async (file, jobDescription) => {
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

  const result = await response.json();

  // Map result to a historical record
  const newReport = {
    id: result.resume_id,
    timestamp: new Date().toISOString(),
    fileName: file.name,
    jobDescription: jobDescription,
    skills: result.skills || [],
    ats_result: result.ats_result || {
      ats_score: 0,
      matched_skills: [],
      missing_skills: [],
      recommendations: []
    },
    career_intelligence: result.career_intelligence || {
      career_score: 0,
      skill_gap_score: 100,
      job_fit_label: 'Weak Fit',
      category: 'system_design',
      career_path: ['Software Engineer']
    },
    improvements: result.improvements || [],
    questions: result.questions || []
  };

  saveReport(newReport);
  return newReport;
};
