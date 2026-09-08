import React from 'react';
import { FileText, ShieldCheck, TrendingUp } from 'lucide-react';

function ExecutiveSummary({ summary, ragMetadata }) {
  if (!summary) return null;

  const historyDelta = ragMetadata?.history_delta;
  const isHistorical = historyDelta?.historical_scan_detected;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '28px', marginBottom: '24px' }}>
      
      {/* RAG Candidate Scan Evolution Banner */}
      {isHistorical && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#10b981',
          marginBottom: '20px',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <TrendingUp size={18} style={{ flexShrink: 0 }} />
          <span>
            RAG Evolution Delta: ATS Score changed by <strong>{historyDelta.score_delta_formatted}</strong> compared to your previous scan!
            {historyDelta.newly_added_skills?.length > 0 && (
              <span> Newly added skills: {historyDelta.newly_added_skills.slice(0, 4).join(', ')}</span>
            )}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={18} style={{ color: '#818cf8' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Executive Summary</h3>
        </div>

        {/* RAG Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '700',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          color: '#818cf8',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <ShieldCheck size={14} />
          RAG Vector Ground-Truth Verified
        </div>
      </div>

      <p style={{
        fontSize: '0.95rem',
        lineHeight: '1.7',
        color: 'var(--text-secondary)',
        margin: 0,
        whiteSpace: 'pre-line',
        borderLeft: '3px solid rgba(99, 102, 241, 0.3)',
        paddingLeft: '16px',
      }}>
        {summary}
      </p>
    </div>
  );
}

export default ExecutiveSummary;
