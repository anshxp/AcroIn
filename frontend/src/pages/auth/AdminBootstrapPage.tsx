import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, KeyRound, Lock, Crown, BadgeCheck, ArrowRight, Terminal } from 'lucide-react';
import { authAPI } from '../../services/api';
import './AuthPages.css';

export const AdminBootstrapPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bootstrapKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authAPI.bootstrapAdminRegister(
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        },
        form.bootstrapKey.trim()
      );

      navigate('/login');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Admin bootstrap failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page admin-bootstrap-page">
      <div className="auth-branding admin-bootstrap-branding">
        <div className="auth-branding-content admin-bootstrap-branding-content">
          <div className="auth-logo">
            <div className="auth-logo-icon admin-bootstrap-logo-icon">
              <Crown size={26} />
            </div>
            <div className="auth-logo-text">
              <span className="auth-logo-title">Bootstrap Console</span>
              <span className="auth-logo-subtitle">Restricted admin provisioning</span>
            </div>
          </div>

          <div className="auth-branding-main admin-bootstrap-hero">
            <div className="auth-badge admin-bootstrap-badge">
              <Shield size={14} />
              <span>Locked internal access</span>
            </div>

            <h1 className="auth-branding-title admin-bootstrap-title">
              Create the first admin
              <span className="auth-gradient-text"> safely and fast</span>
            </h1>

            <p className="auth-branding-desc admin-bootstrap-desc">
              This page is intentionally unlisted. It exists only to bootstrap one or two
              trusted administrators, then it should be disabled.
            </p>

            <div className="admin-bootstrap-panels">
              <div className="admin-bootstrap-panel">
                <div className="admin-bootstrap-panel-icon">
                  <BadgeCheck size={18} />
                </div>
                <div>
                  <h4>Server guarded</h4>
                  <p>Bootstrap key plus admin cap enforced in backend.</p>
                </div>
              </div>
              <div className="admin-bootstrap-panel">
                <div className="admin-bootstrap-panel-icon amber">
                  <Terminal size={18} />
                </div>
                <div>
                  <h4>Minimal footprint</h4>
                  <p>No nav links, no public entry, no discoverable CTA.</p>
                </div>
              </div>
              <div className="admin-bootstrap-panel">
                <div className="admin-bootstrap-panel-icon purple">
                  <Lock size={18} />
                </div>
                <div>
                  <h4>Disable after use</h4>
                  <p>Turn off bootstrap mode after creating the admin.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-branding-footer admin-bootstrap-footer">
            <p>Internal setup only. Keep the URL and bootstrap key private.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-section admin-bootstrap-form-section">
        <div className="auth-form-container admin-bootstrap-form-container">
          <div className="admin-bootstrap-topbar">
            <div className="admin-bootstrap-chip">
              <KeyRound size={14} />
              <span>Bootstrap key required</span>
            </div>
            <div className="admin-bootstrap-chip muted">
              <Sparkles size={14} />
              <span>Max 1-2 admins</span>
            </div>
          </div>

          <div className="auth-form-header admin-bootstrap-header">
            <h2>Provision an admin account</h2>
            <p>Use a trusted institute email and a strong password.</p>
          </div>

          {error && (
            <div className="auth-error admin-bootstrap-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form admin-bootstrap-form">
            <div className="admin-bootstrap-grid">
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <Shield size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="Main Admin"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Email</label>
                <div className="auth-input-wrapper">
                  <Sparkles size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    placeholder="admin@acropolis.in"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => onChange('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Bootstrap Key</label>
              <div className="auth-input-wrapper">
                <KeyRound size={18} className="auth-input-icon" />
                <input
                  type="password"
                  value={form.bootstrapKey}
                  onChange={(e) => onChange('bootstrapKey', e.target.value)}
                  placeholder="Internal secret key"
                  required
                />
              </div>
            </div>

            <div className="admin-bootstrap-note">
              <Crown size={16} />
              <span>This will create a login-ready admin in users, admins, and profiles.</span>
            </div>

            <button type="submit" className="auth-submit admin-bootstrap-submit" disabled={isLoading}>
              {isLoading ? (
                <span className="auth-loading">Provisioning...</span>
              ) : (
                <>
                  <span>Create Admin</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
