import React, { useState } from 'react';
import { 
  Save, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Settings as SettingsIcon,
  Lock,
  Clock,
  FileText,
  Upload,
  RefreshCw
} from 'lucide-react';
import '../../styles/pages.css';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'AcroIn',
    siteUrl: 'https://acroin.edu',
    adminEmail: 'admin@acroin.edu',
    supportEmail: 'support@acroin.edu',
    emailNotifications: true,
    pushNotifications: true,
    autoApproval: false,
    maintenanceMode: false,
    maxFileSize: '10',
    allowedFileTypes: 'pdf,jpg,png,doc,docx',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure application settings and preferences</p>
        </div>
        <button className="add-button" onClick={handleSave}>
          <Save size={18} />
          Save All Settings
        </button>
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">
        {/* General Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <SettingsIcon size={20} />
            <div>
              <h3>General Settings</h3>
              <p>Basic configuration for the application</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-field">
              <label>
                <Globe size={16} />
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Enter site name"
              />
            </div>
            <div className="settings-field">
              <label>
                <Globe size={16} />
                Site URL
              </label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="settings-field">
              <label>
                <Mail size={16} />
                Admin Email
              </label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="settings-field">
              <label>
                <Mail size={16} />
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="support@example.com"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Bell size={20} />
            <div>
              <h3>Notification Settings</h3>
              <p>Configure email and push notifications</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-toggle">
              <div className="settings-toggle-info">
                <h4>Email Notifications</h4>
                <p>Send email notifications for important events</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-toggle">
              <div className="settings-toggle-info">
                <h4>Push Notifications</h4>
                <p>Enable browser push notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-toggle">
              <div className="settings-toggle-info">
                <h4>Auto-Approval</h4>
                <p>Automatically approve low-risk submissions</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoApproval}
                  onChange={(e) => setSettings({ ...settings, autoApproval: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Shield size={20} />
            <div>
              <h3>Security Settings</h3>
              <p>Configure security and access controls</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-field">
              <label>
                <Clock size={16} />
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                min="5"
                max="120"
              />
            </div>
            <div className="settings-field">
              <label>
                <Lock size={16} />
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                min="3"
                max="10"
              />
            </div>
            <div className="settings-toggle">
              <div className="settings-toggle-info">
                <h4>Maintenance Mode</h4>
                <p>Disable access to the site temporarily</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* File Upload Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Upload size={20} />
            <div>
              <h3>File Upload Settings</h3>
              <p>Configure file upload restrictions</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-field">
              <label>
                <FileText size={16} />
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                min="1"
                max="100"
              />
            </div>
            <div className="settings-field">
              <label>
                <FileText size={16} />
                Allowed File Types
              </label>
              <input
                type="text"
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                placeholder="pdf,jpg,png,doc"
              />
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Database size={20} />
            <div>
              <h3>Database Management</h3>
              <p>Database maintenance and backup options</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-toggle">
              <div className="settings-toggle-info">
                <h4>Backup Database</h4>
                <p>Create a backup of all application data</p>
              </div>
              <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Database size={14} style={{ marginRight: '6px' }} />
                Backup Now
              </button>
            </div>
            <div className="settings-toggle">
              <div className="settings-toggle-info">
                <h4>Clear Cache</h4>
                <p>Clear application cache and temporary files</p>
              </div>
              <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <RefreshCw size={14} style={{ marginRight: '6px' }} />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="add-button" onClick={handleSave}>
          <Save size={18} />
          Save All Settings
        </button>
      </div>
    </div>
  );
};
