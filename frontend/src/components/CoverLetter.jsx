import React, { useState } from 'react';
import { Mail, Copy, Check, Download } from 'lucide-react';

function CoverLetter({ coverLetter }) {
  const [copied, setCopied] = useState(false);

  if (!coverLetter) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover_letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '28px', marginBottom: '24px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Mail size={18} style={{ color: '#10b981' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Generated Cover Letter</h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-glass)',
              background: copied ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
              color: copied ? '#10b981' : 'var(--text-primary)',
              fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-glass)',
              background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
              fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
      }}>
        <p style={{
          fontSize: '0.9rem',
          lineHeight: '1.8',
          color: 'var(--text-secondary)',
          margin: 0,
          whiteSpace: 'pre-line',
          fontFamily: "'Outfit', sans-serif",
        }}>
          {coverLetter}
        </p>
      </div>
    </div>
  );
}

export default CoverLetter;
