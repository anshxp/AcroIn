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

export const Footer = ({ variant = 'default' }) => {
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
              <span className="footer__badge footer__badge--blue">
                <Brain size={14} />
                AI-Powered
              </span>
            </div>
          </div>
          <div className="footer__contact">
            <div className="footer__contact-item">
              <MapPin size={16} />
              Indore, India
            </div>
            <div className="footer__contact-item">
              <Mail size={16} />
              info@acrop-in.com
            </div>
            <div className="footer__contact-item">
              <Phone size={16} />
              +91 12345 67890
            </div>
          </div>
          <div className="footer__social">
            <a href="#" className="footer__social-link"><Github size={16} /></a>
            <a href="#" className="footer__social-link"><Linkedin size={16} /></a>
            <a href="#" className="footer__social-link"><Twitter size={16} /></a>
          </div>
        </div>
        <div className="footer__bottom">
          <button className="footer__scrolltop" onClick={scrollToTop}>
            <ArrowUp size={16} />
          </button>
          <p>© {new Date().getFullYear()} Acro-In. All rights reserved. | Acropolis Institute of Technology & Research</p>
        </div>
      </div>
    </footer>
  );
};
