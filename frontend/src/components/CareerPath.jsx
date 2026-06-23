import React from 'react';
import { Compass, Lightbulb, TrendingUp, HelpCircle } from 'lucide-react';

function CareerPath({ category, paths = [], improvements = [] }) {
  const getCategoryDisplay = (cat) => {
    const map = {
      'ai_ml': 'Artificial Intelligence & Machine Learning',
      'data_science': 'Data Science & Analytics',
      'software_testing': 'Software Testing & QA',
      'backend': 'Backend Engineering',
      'frontend': 'Frontend Engineering',
      'cloud_devops': 'Cloud Architecture & DevOps',
      'system_design': 'Systems Architecture & Engineering'
    };
    return map[cat] || cat || 'General Software Engineering';
  };

  const getCategoryColor = (cat) => {
    const map = {
      'ai_ml': '#a855f7', // Purple
      'data_science': '#3b82f6', // Blue
      'software_testing': '#06b6d4', // Teal
      'backend': '#10b981', // Green
      'frontend': '#ec4899', // Pink
      'cloud_devops': '#f59e0b', // Amber
      'system_design': '#6366f1' // Indigo
    };
    return map[cat] || '#8b5cf6';
  };

  const catColor = getCategoryColor(category);

  return (
    <div className="grid-2 animate-fade-in" style={{ marginBottom: '24px' }}>
      
      {/* Target Careers */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Compass size={20} style={{ color: catColor }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Career Positioning</h3>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Primary Expertise Category
          </span>
          <div style={{ 
            fontSize: '1.15rem', 
            fontWeight: '700', 
            color: catColor, 
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={16} />
            {getCategoryDisplay(category)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Recommended Career Pathways
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
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
                    fontWeight: '600'
                  }}
                >
                  {path}
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>No direct pathway recommendations.</div>
            )}
          </div>
        </div>
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
