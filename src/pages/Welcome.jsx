import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, FolderOpen, Zap, Sparkles } from 'lucide-react';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      const role = user?.role?.replace('ROLE_', '') || 'USER';
      navigate(role === 'ADMIN' ? '/admin/documents' : '/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="welcome-container">
      <nav className="welcome-nav">
        <div className="welcome-logo">
          <Bot size={28} color="#60a5fa" />
          AI Student Hub
        </div>
        <div className="welcome-nav-links">
          {isAuthenticated ? (
            <button className="btn-primary-glow" onClick={handleGetStarted}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button className="btn-glass" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-primary-glow" onClick={() => navigate('/register')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      <main className="welcome-main">
        <div className="badge">
          <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          The Future of Learning is Here
        </div>
        
        <h1 className="hero-title">
          <span className="text-gradient">Supercharge Your Study with </span>
          <br />
          <span className="text-gradient-primary">AI-Powered Documents</span>
        </h1>
        
        <p className="hero-subtitle">
          Upload your lectures, books, and notes. Chat directly with your materials, organize intelligently, and learn faster than ever before.
        </p>
        
        <div className="cta-group">
          <button className="btn-primary-glow btn-large" onClick={handleGetStarted}>
            {isAuthenticated ? 'Continue to Dashboard' : 'Get Started for Free'}
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FolderOpen size={28} />
            </div>
            <h3 className="feature-title">Smart Organization</h3>
            <p className="feature-desc">Keep all your academic documents perfectly organized in folders. Access them anywhere, anytime with secure cloud storage.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <Bot size={28} />
            </div>
            <h3 className="feature-title">Chat with Documents</h3>
            <p className="feature-desc">Stop reading hundreds of pages. Just ask our AI assistant to summarize, explain, or extract key insights from any document.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={28} />
            </div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-desc">Built with modern web technologies to ensure a seamless, fluid experience. Find what you need instantly.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
