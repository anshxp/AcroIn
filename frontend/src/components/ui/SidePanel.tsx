import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Use portal to render at end of body
  return createPortal(
    <>
      {/* Fallback styles in case CSS is not loaded */}
      <style>{`
        .sidepanel-overlay { position: fixed; inset: 0; z-index: 1200; display: flex; justify-content: flex-end; }
        .sidepanel { background: #fff; width: 400px; max-width: 100vw; height: 100vh; box-shadow: -2px 0 16px rgba(0,0,0,0.08); display: flex; flex-direction: column; animation: sidepanelSlideIn 0.2s ease-out; position: relative; }
        .sidepanel-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 12px 24px; border-bottom: 1px solid #eee; }
        .sidepanel-close { background: none; border: none; font-size: 2rem; color: #888; cursor: pointer; line-height: 1; }
        .sidepanel-content { flex: 1; overflow-y: auto; padding: 20px 24px; }
        .sidepanel-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1199; }
        @keyframes sidepanelSlideIn { from { transform: translateX(100%); opacity: 0.7; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 600px) { .sidepanel { width: 100vw; max-width: 100vw; border-radius: 0; } .sidepanel-header, .sidepanel-content { padding-left: 12px; padding-right: 12px; } }
      `}</style>
      <div className="sidepanel-overlay">
        <div className="sidepanel">
          <div className="sidepanel-header">
            {title && <h2>{title}</h2>}
            <button className="sidepanel-close" onClick={onClose}>&times;</button>
          </div>
          <div className="sidepanel-content">
            <div style={{color: 'red', fontWeight: 'bold', marginBottom: 8}}>DEBUG: SidePanel is rendered</div>
            {children}
          </div>
        </div>
        <div className="sidepanel-backdrop" onClick={onClose} />
      </div>
    </>,
    document.body
  );
};
