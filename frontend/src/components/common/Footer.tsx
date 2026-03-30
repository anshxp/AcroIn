import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Brain, 
  MapPin, 
  Mail, 
  Phone, 
  Github, 
  Linkedin, 
  Twitter, 
  ArrowUp 
} from 'lucide-react';
import './Footer.css';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (variant === 'minimal') {
    return (
      <footer className="footer footer--minimal">
        <div className="footer__container">
          <div className="footer__bottom">
            <p>© {new Date().getFullYear()} Acro-In. All rights reserved. | Acropolis Institute of Technology & Research</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__main">
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <GraduationCap size={24} />
              </div>
              <div className="footer__logo-text">
                <span className="footer__logo-title">Acro-In</span>
                <span className="footer__logo-subtitle">Acropolis Institute</span>
              </div>
            </div>
            
            <p className="footer__description">
              The next-generation networking platform connecting students, faculty, 
              and industry professionals through AI-powered intelligent systems.
            </p>
            
            <div className="footer__badges">
              <span className="footer__badge footer__badge--orange">
                <Users size={14} />
                5,000+ Students
              </span>
              <span className="footer__badge footer__badge--green">
                <Brain size={14} />
                AI-Powered
              </span>
            </div>
            
            <div className="footer__socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div className="footer__links-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#ai-integration">AI Technology</a></li>
              <li><a href="#dashboard">Dashboards</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Mobile App</a></li>
            </ul>
          </div>
          
          <div className="footer__contact">
            <h4>Contact</h4>
            <ul>
              <li>
                <MapPin size={16} />
                <span>Acropolis Institute of Technology & Research</span>
              </li>
              <li>
                <Mail size={16} />
                <span>info@acroin.edu</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+91 (755) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Acro-In. All rights reserved. | Acropolis Institute of Technology & Research</p>
          <button className="footer__back-to-top" onClick={scrollToTop}>
            <ArrowUp size={16} />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
