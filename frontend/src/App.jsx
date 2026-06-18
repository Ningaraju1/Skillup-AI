import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { UploadCloud, FileText, Heart, Infinity } from 'lucide-react';
import Upload from './pages/Upload';
import ResumeReport from './pages/ResumeReport';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Ambient background glow elements */}
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>

        {/* Navbar */}
        <header className="navbar">
          <div className="container navbar-content">
            <NavLink to="/" className="logo">
              <FileText size={24} style={{ strokeWidth: 2.5 }} />
              <span>SkillUp AI</span>
            </NavLink>

            <nav className="nav-links">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <UploadCloud size={18} />
                <span>New Scan</span>
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Upload />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/report/:id" element={<ResumeReport />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container footer-content">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Made with
              <Heart size={14} className="heart-icon" style={{ fill: '#ef4444', color: '#ef4444' }} />
              by{' '}
              <a
                href="https://ningaraju.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Ningaraju K
              </a>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.8 }}>
              <Infinity size={18} style={{ color: '#10b981', margin: '0 8px' }} />
            </span>
            <span>© 2026. All rights reserved.</span>
            <span>•</span>
            <span>
              LLMs come read{' '}
              <a href="/llms.html" className="footer-link" style={{ textDecoration: 'underline' }}>
                here
              </a>
            </span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
