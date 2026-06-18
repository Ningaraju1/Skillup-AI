import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../api/resumeApi';
import { UploadCloud, FileText, AlertCircle, Sparkles, RefreshCw, Layers } from 'lucide-react';

function Upload() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanningStage, setScanningStage] = useState(0); // 0: upload, 1: parsing, 2: compliance, 3: mock prep
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Only PDF, DOCX, and DOC resumes are supported.');
      setFile(null);
      return;
    }

    // Limit to 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription.trim()) {
      setError('Please upload a resume and provide a job description.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setScanningStage(1); // Starting parsing phase

    // Create a fake timeline animation for scanning steps to look highly engaging
    const timer1 = setTimeout(() => setScanningStage(2), 2000); // compliance matching
    const timer2 = setTimeout(() => setScanningStage(3), 4500); // interview generation

    try {
      const report = await uploadResume(file, jobDescription);
      
      // Complete stages and navigate
      clearTimeout(timer1);
      clearTimeout(timer2);
      
      setScanningStage(3);
      setTimeout(() => {
        setIsAnalyzing(false);
        navigate(`/report/${report.id}`);
      }, 1500);

    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
      setError(err.message || 'An error occurred during resume analysis. Please verify the Groq API key.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Sparkles size={32} style={{ color: 'var(--accent-primary)', fill: 'rgba(99, 102, 241, 0.2)' }} />
          SkillUp AI
        </h1>
        <p>Where Ambition Meets Intelligence.</p>
      </div>

      {isAnalyzing ? (
        /* Scanned Progress Panel */
        <div className="glass-card animate-fade-in" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '32px' }}>
            <div className="pulse-ring" style={{
              position: 'absolute',
              top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
              border: '2px solid var(--accent-primary)',
              borderRadius: '50%',
              animation: 'pulse 1.8s infinite'
            }}></div>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <RefreshCw size={36} className="rotating-icon" style={{ animation: 'spin 2s linear infinite' }} />
            </div>
          </div>

          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Analyzing Resume Intelligence</h3>
          <p style={{ marginBottom: '32px', maxWidth: '450px', margin: '0 auto 32px auto' }}>
            Our LangGraph agents are processing your CV against the job requirements...
          </p>

          {/* Progress Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px', margin: '0 auto', textAlign: 'left' }}>
            
            {/* Step 1: Text extraction */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: scanningStage >= 1 ? 1 : 0.4 }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: scanningStage === 1 ? 'var(--accent-primary)' : scanningStage > 1 ? 'var(--color-success)' : 'var(--text-muted)'
              }}></span>
              <span style={{ fontSize: '0.925rem', fontWeight: scanningStage === 1 ? '700' : '500' }}>
                {scanningStage > 1 ? '✓ Extracted text from PDF' : 'Extracting text and keywords...'}
              </span>
            </div>

            {/* Step 2: Semantic Alignment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: scanningStage >= 2 ? 1 : 0.4 }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: scanningStage === 2 ? 'var(--accent-secondary)' : scanningStage > 2 ? 'var(--color-success)' : 'var(--text-muted)'
              }}></span>
              <span style={{ fontSize: '0.925rem', fontWeight: scanningStage === 2 ? '700' : '500' }}>
                {scanningStage > 2 ? '✓ Computed ATS matching score' : 'Matching semantic profile with job guidelines...'}
              </span>
            </div>

            {/* Step 3: Interview coaching */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: scanningStage >= 3 ? 1 : 0.4 }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: scanningStage === 3 ? 'var(--color-success)' : 'var(--text-muted)'
              }}></span>
              <span style={{ fontSize: '0.925rem', fontWeight: scanningStage === 3 ? '700' : '500' }}>
                {scanningStage === 3 ? 'Generating practice questions...' : 'Preparing mock interview coaching...'}
              </span>
            </div>

          </div>

          {/* Spin Keyframes */}
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes pulse { 
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.15); opacity: 0; }
              100% { transform: scale(0.95); opacity: 0; }
            }
          `}</style>
        </div>
      ) : (
        /* Input Form Panel */
        <form onSubmit={handleAnalyze} className="glass-card animate-fade-in" style={{ padding: '32px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              marginBottom: '24px',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Resume Dropzone */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>
              Upload Resume (PDF, DOCX, DOC)
            </label>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc"
              style={{ display: 'none' }}
            />
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              style={{
                border: '2px dashed var(--border-glass)',
                borderRadius: '12px',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)';
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <UploadCloud size={24} />
              </div>
              
              {file ? (
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
                    {file.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    Drag & drop resume here, or <span style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>browse files</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Supports PDF, DOCX, or DOC formats up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description Textarea */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>
              Target Job Description
            </label>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description requirements, skills, guidelines, or responsibilities here..."
              rows="8"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s',
                lineHeight: '1.5'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!file || !jobDescription.trim()}
              style={{ width: '100%', padding: '14px 28px' }}
            >
              <Sparkles size={18} /> Run Compliance Intelligence Match
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Upload;
