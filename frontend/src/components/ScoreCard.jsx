import React from 'react';
import { Target, Award, ShieldCheck } from 'lucide-react';

function ScoreCard({ atsScore, careerScore, fitLabel }) {
  // Determine color theme based on fit label
  const getFitStyle = (label) => {
    switch (label?.toLowerCase()) {
      case 'strong fit':
        return {
          color: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
          text: 'Strong Match'
        };
      case 'medium fit':
        return {
          color: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
          text: 'Good Match'
        };
      default:
        return {
          color: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)',
          text: 'Needs Improvement'
        };
    }
  };

  const fitStyle = getFitStyle(fitLabel);
  const roundedAts = Math.round(atsScore || 0);
  const roundedCareer = Math.round(careerScore || 0);

  // SVG parameters for radial progress circle
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetAts = circumference - (roundedAts / 100) * circumference;
  const strokeDashoffsetCareer = circumference - (roundedCareer / 100) * circumference;

  return (
    <div className="grid-2 animate-fade-in" style={{ marginBottom: '24px' }}>
      
      {/* ATS Score Card */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle 
              cx="60" cy="60" r={radius} 
              fill="transparent" 
              stroke="var(--bg-tertiary)" 
              strokeWidth="10" 
            />
            <circle 
              cx="60" cy="60" r={radius} 
              fill="transparent" 
              stroke="url(#atsGrad)" 
              strokeWidth="10" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffsetAts}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
            <defs>
              <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{roundedAts}%</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>ATS</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Target size={18} style={{ color: '#818cf8' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>ATS Optimization</h3>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '12px' }}>
            Measures your resume text against keyword structure, parsing efficiency, and pattern layout requirements.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: roundedAts >= 80 ? 'var(--color-success)' : 'var(--text-secondary)' }}>
            <ShieldCheck size={14} />
            <span>{roundedAts >= 80 ? 'Optimized for parsing engines' : 'Add missing keywords to raise score'}</span>
          </div>
        </div>
      </div>

      {/* Career Fit Score Card */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle 
              cx="60" cy="60" r={radius} 
              fill="transparent" 
              stroke="var(--bg-tertiary)" 
              strokeWidth="10" 
            />
            <circle 
              cx="60" cy="60" r={radius} 
              fill="transparent" 
              stroke="url(#careerGrad)" 
              strokeWidth="10" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffsetCareer}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
            <defs>
              <linearGradient id="careerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{roundedCareer}%</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>FIT</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Award size={18} style={{ color: '#c084fc' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Job Compatibility</h3>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '12px' }}>
            Measures cosine similarity between your resume profile semantic embedding and the target job description.
          </p>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: fitStyle.color,
            backgroundColor: fitStyle.bg
          }}>
            {fitStyle.text}
          </span>
        </div>
      </div>

    </div>
  );
}

export default ScoreCard;
