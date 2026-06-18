import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReportById } from '../api/resumeApi';
import ScoreCard from '../components/ScoreCard';
import SkillRadar from '../components/SkillRadar';
import CareerPath from '../components/CareerPath';
import QuestionPanel from '../components/QuestionPanel';
import { ArrowLeft, FileText, Calendar, Sparkles, AlertCircle } from 'lucide-react';

function ResumeReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const data = getReportById(id);
    setReport(data);
    setLoading(false);
  }, [id]);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }} className="animate-fade-in">
        <div className="rotating-icon" style={{
          width: '40px', height: '40px', border: '3px solid var(--border-glass)',
          borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
          margin: '0 auto 20px auto', animation: 'spin 1s linear infinite'
        }}></div>
        <h3>Loading compliance report details...</h3>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass-card animate-fade-in" style={{ padding: '48px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <AlertCircle size={48} style={{ color: 'var(--color-danger)', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Report Not Found</h2>
        <p style={{ marginBottom: '24px' }}>
          We could not find the resume analysis report corresponding to ID "{id}".
        </p>
        <Link to="/" className="btn btn-primary">
          Run New Scan
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back navigation link */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          to="/" 
          style={{ 
            color: 'var(--text-secondary)', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to New Scan
        </Link>
      </div>

      {/* Header Panel */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
            color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>{report.fileName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                Audited on {formatDate(report.timestamp)}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: '600' }}>
                <Sparkles size={14} />
                SaaS Real-Time Audit
              </span>
            </div>
          </div>
        </div>

        <div>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)'
          }}>
            ID: #{report.id}
          </span>
        </div>
      </div>

      {/* 1. Score Cards */}
      <ScoreCard 
        atsScore={report.ats_result?.ats_score}
        careerScore={report.career_intelligence?.career_score}
        fitLabel={report.career_intelligence?.job_fit_label}
      />

      {/* 2. Skill breakdown */}
      <SkillRadar 
        matchedSkills={report.ats_result?.matched_skills}
        missingSkills={report.ats_result?.missing_skills}
      />

      {/* 3. Career pathways and actionable optimizations */}
      <CareerPath 
        category={report.career_intelligence?.category}
        paths={report.career_intelligence?.career_path}
        improvements={report.improvements}
      />

      {/* 4. Interview Coaching Questions */}
      <QuestionPanel 
        questions={report.questions}
      />

    </div>
  );
}

export default ResumeReport;
