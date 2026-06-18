import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, User, Briefcase, CheckCircle } from 'lucide-react';

function QuestionPanel({ questions = [] }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleAnswerChange = (idx, value) => {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const submitAnswer = (idx) => {
    setSubmittedAnswers(prev => ({ ...prev, [idx]: true }));
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical':
        return <BookOpen size={16} style={{ color: '#818cf8' }} />;
      case 'project-based':
        return <Briefcase size={16} style={{ color: '#ec4899' }} />;
      case 'behavioral':
        return <User size={16} style={{ color: '#10b981' }} />;
      default:
        return <HelpCircle size={16} style={{ color: '#9ca3af' }} />;
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical':
        return { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)' };
      case 'project-based':
        return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
      case 'behavioral':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      default:
        return { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)' };
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '16px'
      }}>
        <HelpCircle size={22} style={{ color: 'var(--accent-secondary)' }} />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Practice Interview Questions</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Tailored mock interview questions generated based on your background and target job description.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {questions && questions.length > 0 ? (
          questions.map((q, idx) => {
            const isOpen = openIndex === idx;
            const badge = getTypeBadgeStyle(q.type);
            const isSubmitted = submittedAnswers[idx];

            return (
              <div 
                key={idx}
                style={{
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* Header */}
                <div 
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      Q{idx + 1}
                    </span>
                    <span style={{ fontSize: '0.925rem', fontWeight: '500', lineHeight: '1.4' }}>
                      {q.question}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: badge.color,
                      backgroundColor: badge.bg
                    }}>
                      {getTypeIcon(q.type)}
                      {q.type}
                    </span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Body (Practice Area) */}
                {isOpen && (
                  <div style={{
                    padding: '0 20px 20px 20px',
                    borderTop: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                        Your Draft Answer:
                      </label>
                      
                      {!isSubmitted ? (
                        <div>
                          <textarea 
                            value={answers[idx] || ''}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            placeholder="Type your response here..."
                            rows="4"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-glass)',
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.9rem',
                              fontFamily: 'inherit',
                              outline: 'none',
                              resize: 'vertical',
                              marginBottom: '12px'
                            }}
                          />
                          <button 
                            onClick={() => submitAnswer(idx)}
                            disabled={!answers[idx]?.trim()}
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px' }}
                          >
                            Save Answer
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          padding: '16px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.15)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-success)', fontWeight: '600', fontSize: '0.85rem' }}>
                            <CheckCircle size={16} />
                            <span>Saved Response</span>
                          </div>
                          <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                            {answers[idx]}
                          </p>
                          <button 
                            onClick={() => setSubmittedAnswers(prev => ({ ...prev, [idx]: false }))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              textDecoration: 'underline',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              marginTop: '10px',
                              padding: 0
                            }}
                          >
                            Edit Response
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ fontStyle: 'italic', fontSize: '0.9rem', padding: '12px', textAlign: 'center' }}>
            No interview questions generated.
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionPanel;
