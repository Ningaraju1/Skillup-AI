import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Search, Filter } from 'lucide-react';

function SkillRadar({ matchedSkills = [], missingSkills = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, matched, missing

  const hasMatched = matchedSkills && matchedSkills.length > 0;
  const hasMissing = missingSkills && missingSkills.length > 0;

  const filteredMatched = (matchedSkills || []).filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMissing = (missingSkills || []).filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '28px', marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '20px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>Skill Breakdown & Gap Analysis</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Comparison of technical core skills detected in your resume against job requirements.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input 
              type="text" 
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '180px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
            />
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-glass)' }}>
            <button 
              onClick={() => setFilterType('all')}
              style={{
                border: 'none',
                background: filterType === 'all' ? 'var(--bg-glass)' : 'transparent',
                color: filterType === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All ({matchedSkills.length + missingSkills.length})
            </button>
            <button 
              onClick={() => setFilterType('matched')}
              style={{
                border: 'none',
                background: filterType === 'matched' ? 'var(--bg-glass)' : 'transparent',
                color: filterType === 'matched' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Matched ({matchedSkills.length})
            </button>
            <button 
              onClick={() => setFilterType('missing')}
              style={{
                border: 'none',
                background: filterType === 'missing' ? 'var(--bg-glass)' : 'transparent',
                color: filterType === 'missing' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Missing ({missingSkills.length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Matched Skills */}
        {(filterType === 'all' || filterType === 'matched') && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.02)',
            border: '1px solid rgba(16, 185, 129, 0.08)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-success)' }}>
                Matched Skills ({filteredMatched.length})
              </h4>
            </div>
            {filteredMatched.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {filteredMatched.map((skill, index) => (
                  <span 
                    key={index}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      transition: 'transform 0.15s, border-color 0.15s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                {searchTerm ? 'No matching skills found' : 'No matching skills detected.'}
              </p>
            )}
          </div>
        )}

        {/* Missing Skills */}
        {(filterType === 'all' || filterType === 'missing') && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.02)',
            border: '1px solid rgba(245, 158, 11, 0.08)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-warning)' }}>
                Missing Keywords / Gaps ({filteredMissing.length})
              </h4>
            </div>
            {filteredMissing.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {filteredMissing.map((skill, index) => (
                  <span 
                    key={index}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      color: '#fde047',
                      transition: 'transform 0.15s, border-color 0.15s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                {searchTerm ? 'No matching skills found' : 'Perfect alignment! No missing skills identified.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillRadar;
