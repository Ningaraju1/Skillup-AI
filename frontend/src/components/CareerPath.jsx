import React from 'react';
import { Compass, Lightbulb, TrendingUp, Cpu, Award } from 'lucide-react';

function CareerPath({ category, paths = [], trendingSkills = [], improvements = [] }) {
  const catColor = '#a855f7'; // Accent theme

  return (
    <div className="grid-2 animate-fade-in" style={{ marginBottom: '24px' }}>
      
      {/* Target Careers & Tech Stack Alignment */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Compass size={20} style={{ color: catColor }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Career Positioning & Job Alignment</h3>
        </div>

        {/* Dynamic Category & Stack Positioning */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Profile Positioning relative to Job Description
          </span>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            color: catColor, 
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            lineHeight: '1.4'
          }}>
            <TrendingUp size={18} style={{ flexShrink: 0 }} />
            {category || 'General Software Engineering & Technical Fit'}
          </div>
        </div>

        {/* Recommended Role Pathways */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Tailored Role Pathways for Target Tech Stack
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {paths && paths.length > 0 ? (
              paths.map((path, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    borderLeft: `3px solid ${catColor}`,
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{path}</span>
                  <Award size={14} style={{ opacity: 0.6, color: catColor }} />
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>No direct pathway recommendations.</div>
            )}
          </div>
        </div>

        {/* Trending Tech Stack Requirements */}
        {trendingSkills && trendingSkills.length > 0 && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
              Target Tech Stack Skills to Master
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {trendingSkills.map((item, idx) => (
                <span 
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Cpu size={12} />
                  {typeof item === 'string' ? item : `${item.skill} (${item.demand || 'High'})`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Improvement Advice */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Lightbulb size={20} style={{ color: '#eab308' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Optimization Guidance</h3>
        </div>

        <p style={{ fontSize: '0.875rem', marginBottom: '20px' }}>
          Action items identified by the copilot to elevate your resume compatibility for this target category.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {improvements && improvements.length > 0 ? (
            improvements.map((imp, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(234, 179, 8, 0.1)',
                  color: '#eab308',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  marginTop: '2px',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{imp}</span>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✓ No improvements needed! Your profile matches perfectly.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default CareerPath;
