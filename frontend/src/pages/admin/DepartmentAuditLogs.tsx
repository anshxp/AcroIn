import React, { useEffect, useState } from 'react';
import {
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import type { AuditLog } from '../../types';
import './department-audit-logs.css';

export const DepartmentAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await adminAPI.getDepartmentAuditLogs(200);
        setLogs(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: '#8B5CF6',
      admin: '#6366F1',
      dept_admin: '#EC4899',
      faculty: '#3B82F6',
      student: '#10B981',
      system: '#6B7280',
    };
    return colors[role] || '#6B7280';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: '#3B82F6',
      POST: '#10B981',
      PUT: '#F59E0B',
      DELETE: '#EF4444',
      PATCH: '#8B5CF6',
    };
    return colors[method] || '#6B7280';
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedLog(null);
  };

  if (isLoading) {
    return (
      <div className="audit-logs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading department audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <div>
          <h1>Department Audit Logs</h1>
          <p className="subtitle">Monitor all activities in your department</p>
        </div>
        <div className="audit-logs-stats">
          <div className="stat-badge">
            <span className="stat-label">Total Activities</span>
            <span className="stat-value">{logs.length}</span>
          </div>
          <div className="stat-badge success">
            <span className="stat-label">Successful</span>
            <span className="stat-value">{logs.filter((l) => l.success).length}</span>
          </div>
          <div className="stat-badge error">
            <span className="stat-label">Failed</span>
            <span className="stat-value">{logs.filter((l) => !l.success).length}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} />
          <h3>No Activities Yet</h3>
          <p>Audit logs for your department will appear here</p>
        </div>
      ) : (
        <div className="audit-logs-table-container">
          <table className="audit-logs-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Method</th>
                <th>Status</th>
                <th>Code</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className={`log-row ${!log.success ? 'failed' : ''}`}>
                  <td className="time-cell">
                    <Calendar size={14} />
                    <span>{formatDate(log.createdAt)}</span>
                  </td>
                  <td className="actor-cell">
                    <User size={14} />
                    <span>
                      {typeof log.actorId === 'string'
                        ? log.actorId
                        : (log.actorId as any)?.email || 'System'}
                    </span>
                  </td>
                  <td className="role-cell">
                    <span
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(log.actorRole) }}
                    >
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="action-cell">{log.action}</td>
                  <td className="method-cell">
                    <span
                      className="method-badge"
                      style={{ color: getMethodColor(log.method) }}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="status-cell">
                    {log.success ? (
                      <CheckCircle size={16} className="success-icon" />
                    ) : (
                      <XCircle size={16} className="error-icon" />
                    )}
                  </td>
                  <td className="code-cell">{log.statusCode}</td>
                  <td className="details-cell">
                    <button
                      className="detail-btn"
                      onClick={() => handleViewDetail(log)}
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedLog && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Activity Details</h2>
              <button className="close-btn" onClick={handleCloseDetail}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Actor</span>
                    <span className="value">
                      {typeof selectedLog.actorId === 'string'
                        ? selectedLog.actorId
                        : (selectedLog.actorId as any)?.email || 'System'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Role</span>
                    <span className="value">{selectedLog.actorRole}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Department</span>
                    <span className="value">{selectedLog.actorDepartment || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Timestamp</span>
                    <span className="value">{formatDate(selectedLog.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Request Details</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="label">Action</span>
                    <span className="value">{selectedLog.action}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Method</span>
                    <span className="value">{selectedLog.method}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Path</span>
                    <span className="value code">{selectedLog.path}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Response</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Status Code</span>
                    <span className={`value ${selectedLog.success ? 'success' : 'error'}`}>
                      {selectedLog.statusCode}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Success</span>
                    <span className={`value ${selectedLog.success ? 'success' : 'error'}`}>
                      {selectedLog.success ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration</span>
                    <span className="value">
                      {selectedLog.payload?.durationMs
                        ? `${selectedLog.payload.durationMs}ms`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedLog.payload && Object.keys(selectedLog.payload).length > 1 && (
                <div className="detail-section">
                  <h3>Request Payload</h3>
                  <pre className="payload-display">
                    {JSON.stringify(
                      {
                        params: selectedLog.payload.params || {},
                        query: selectedLog.payload.query || {},
                        body: selectedLog.payload.body || {},
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
