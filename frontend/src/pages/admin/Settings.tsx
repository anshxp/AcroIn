import React, { useEffect, useMemo, useState } from 'react';
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
import { uiAPI, type AdminSystemSettings } from '../../services/api';
import '../../styles/pages.css';

type SettingsFormState = {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoApproval: boolean;
  maintenanceMode: boolean;
  maxFileSize: string;
  allowedFileTypes: string;
  sessionTimeout: string;
  maxLoginAttempts: string;
};

const DEFAULT_FORM_STATE: SettingsFormState = {
  siteName: 'AcroIn',
  siteUrl: 'https://acroin.edu',
  adminEmail: 'admin@acroin.edu',
  supportEmail: 'support@acroin.edu',
  emailNotifications: true,
  pushNotifications: true,
  autoApproval: false,
  maintenanceMode: false,
  maxFileSize: '10',
  allowedFileTypes: 'pdf,png,jpg',
  sessionTimeout: '30',
  maxLoginAttempts: '5',
};

const toFormState = (settings: AdminSystemSettings): SettingsFormState => ({
  siteName: settings.general?.siteName || DEFAULT_FORM_STATE.siteName,
  siteUrl: settings.general?.siteUrl || DEFAULT_FORM_STATE.siteUrl,
  adminEmail: settings.general?.adminEmail || DEFAULT_FORM_STATE.adminEmail,
  supportEmail: settings.general?.supportEmail || DEFAULT_FORM_STATE.supportEmail,
  emailNotifications: settings.notifications?.emailNotifications ?? DEFAULT_FORM_STATE.emailNotifications,
  pushNotifications: settings.notifications?.pushNotifications ?? DEFAULT_FORM_STATE.pushNotifications,
  autoApproval: settings.notifications?.autoApproval ?? DEFAULT_FORM_STATE.autoApproval,
  maintenanceMode: settings.security?.maintenanceMode ?? DEFAULT_FORM_STATE.maintenanceMode,
  maxFileSize: String(settings.upload?.maxFileSizeMb ?? DEFAULT_FORM_STATE.maxFileSize),
  allowedFileTypes: (settings.upload?.allowedFileTypes || []).join(',') || DEFAULT_FORM_STATE.allowedFileTypes,
  sessionTimeout: String(settings.security?.sessionTimeoutMinutes ?? DEFAULT_FORM_STATE.sessionTimeout),
  maxLoginAttempts: String(settings.security?.maxLoginAttempts ?? DEFAULT_FORM_STATE.maxLoginAttempts),
});

const toPayload = (form: SettingsFormState): AdminSystemSettings => ({
  general: {
    siteName: form.siteName.trim(),
    siteUrl: form.siteUrl.trim(),
    adminEmail: form.adminEmail.trim(),
    supportEmail: form.supportEmail.trim(),
  },
  notifications: {
    emailNotifications: form.emailNotifications,
    pushNotifications: form.pushNotifications,
    autoApproval: form.autoApproval,
  },
  security: {
    sessionTimeoutMinutes: Number(form.sessionTimeout),
    maxLoginAttempts: Number(form.maxLoginAttempts),
    maintenanceMode: form.maintenanceMode,
  },
  upload: {
    maxFileSizeMb: Number(form.maxFileSize),
    allowedFileTypes: form.allowedFileTypes
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  },
  database: {
    backupFrequency: 'weekly',
    lastBackupAt: null,
  },
});

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsFormState>(DEFAULT_FORM_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await uiAPI.getAdminSettings();
        setSettings(toFormState(data));
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to load settings. Please try again.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const validationError = useMemo(() => {
    if (!settings.siteName.trim()) return 'Site name is required.';
    if (!settings.siteUrl.trim()) return 'Site URL is required.';
    if (!settings.adminEmail.trim()) return 'Admin email is required.';
    if (!settings.supportEmail.trim()) return 'Support email is required.';

    const sessionTimeout = Number(settings.sessionTimeout);
    if (Number.isNaN(sessionTimeout) || sessionTimeout < 5 || sessionTimeout > 120) {
      return 'Session timeout must be between 5 and 120 minutes.';
    }

    const maxLoginAttempts = Number(settings.maxLoginAttempts);
    if (Number.isNaN(maxLoginAttempts) || maxLoginAttempts < 3 || maxLoginAttempts > 10) {
      return 'Max login attempts must be between 3 and 10.';
    }

    const maxFileSize = Number(settings.maxFileSize);
    if (Number.isNaN(maxFileSize) || maxFileSize < 1 || maxFileSize > 100) {
      return 'Max file size must be between 1 and 100 MB.';
    }

    return null;
  }, [settings]);

  const handleSave = async () => {
    if (validationError) {
      setErrorMessage(validationError);
      setStatusMessage(null);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const payload = toPayload(settings);
      const updated = await uiAPI.updateAdminSettings(payload);
      setSettings(toFormState(updated));
      setStatusMessage('Settings saved successfully.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to save settings. Please try again.';
      setErrorMessage(message);
      setStatusMessage(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure application settings and preferences</p>
          {statusMessage && <p style={{ color: '#10b981', marginTop: '8px' }}>{statusMessage}</p>}
          {errorMessage && <p style={{ color: '#ef4444', marginTop: '8px' }}>{errorMessage}</p>}
        </div>
        <button className="add-button" onClick={handleSave} disabled={isSaving || isLoading}>
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {isLoading ? (
        <div className="settings-card" style={{ marginTop: '16px' }}>
          <div className="settings-card-body">Loading settings...</div>
        </div>
      ) : (
      <>

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

        {/* Notification Settings*/}
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
        <button className="add-button" onClick={handleSave} disabled={isSaving || isLoading}>
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
      </>
      )}
    </div>
  );
};
