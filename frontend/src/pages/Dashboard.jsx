import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReports, deleteReport } from '../api/resumeApi';
import { 
  FileText, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  UserCheck 
} from 'lucide-react';

function Dashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(getReports());
  }, []);

  const handleDelete = (id, e) => {
    e.preventDefault(); // Prevent navigating if wrapped
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updated = deleteReport(id);
      setReports(updated);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Compute aggregate stats
  const totalScans = reports.length;
  
  const avgAts = totalScans > 0 
    ? Math.round(reports.reduce((acc, r) => acc + (r.ats_result?.ats_score || 0), 0) / totalScans) 
    : 0;

  const avgFit = totalScans > 0 
    ? Math.round(reports.reduce((acc, r) => acc + (r.career_intelligence?.career_score || 0), 0) / totalScans) 
    : 0;

  // Distribution of categories
  const categories = reports.reduce((acc, r) => {
    const cat = r.career_intelligence?.category || 'system_design';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const getCategoryLabel = (cat) => {
    const map = {
      'ai_ml': 'AI / ML',
      'data_science': 'Data Science',
      'backend': 'Backend',
      'frontend': 'Frontend',
      'cloud_devops': 'DevOps',
      'system_design': 'System Design'
    };
    return map[cat] || cat;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1>Talent Engine Dashboard</h1>
        <p>Overview of scanned resume intelligence and career match benchmarks.</p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        
        {/* Total Scanned */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Total Audits
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '2px' }}>{totalScans}</div>
          </div>
        </div>

        {/* Avg ATS */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Average ATS Score
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '2px' }}>{avgAts}%</div>
          </div>
        </div>

        {/* Avg Job Fit */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Avg Compatibility
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '2px' }}>{avgFit}%</div>
          </div>
        </div>

      </div>

      {/* Main Section */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Scan History</h3>
          <Link to="/upload" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            New Scan <ArrowRight size={16} />
          </Link>
        </div>

        {reports.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Resume File</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Expertise Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>ATS Score</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Career Fit</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Audited On</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr 
                    key={report.id}
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      transition: 'background-color 0.2s',
                      fontSize: '0.9rem'
                    }}
                    className="history-row"
                  >
                    <td style={{ padding: '16px' }}>
                      <Link 
                        to={`/report/${report.id}`}
                        style={{ 
                          color: 'var(--text-primary)', 
                          fontWeight: '600', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
                        {report.fileName}
                      </Link>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--accent-secondary)'
                      }}>
                        {getCategoryLabel(report.career_intelligence?.category)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '700' }}>
                      {report.ats_result?.ats_score}%
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        color: report.career_intelligence?.job_fit_label === 'Strong Fit' ? 'var(--color-success)' :
                               report.career_intelligence?.job_fit_label === 'Medium Fit' ? 'var(--color-warning)' : 'var(--color-danger)',
                        fontWeight: '700'
                      }}>
                        {report.career_intelligence?.career_score}% ({report.career_intelligence?.job_fit_label})
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} />
                        {formatDate(report.timestamp)}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link 
                          to={`/report/${report.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                        >
                          View Report
                        </Link>
                        <button 
                          onClick={(e) => handleDelete(report.id, e)}
                          className="btn btn-secondary"
                          style={{ 
                            padding: '6px', 
                            borderRadius: '6px', 
                            color: 'var(--color-danger)',
                            borderColor: 'rgba(239, 68, 68, 0.15)'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto',
              color: 'var(--text-muted)'
            }}>
              <Layers size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No resumes scanned yet</h4>
            <p style={{ maxWidth: '400px', margin: '0 auto 24px auto', fontSize: '0.875rem' }}>
              Upload your resume and enter a target job description to run real-time AI compliance matching.
            </p>
            <Link to="/upload" className="btn btn-primary">
              Run First Analysis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
