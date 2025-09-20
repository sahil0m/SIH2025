import React, { useState, useEffect } from 'react';
import AlertService from '../services/AlertService';
import { getCurrentUser } from '../services/AuthService';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    alertType: '',
    severity: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);

  const user = getCurrentUser();

  useEffect(() => {
    loadAlerts();
    loadStats();
    
    // Subscribe to real-time alerts
    const unsubscribe = AlertService.subscribeToAlerts((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [filters]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await AlertService.getAlerts(filters);
      setAlerts(response.data.alerts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await AlertService.getAlertStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats if API fails
      setStats({
        total: 0,
        active: 0,
        recent: 0,
        byType: {},
        bySeverity: {},
        byRegion: {}
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getAlertTypeIcon = (type) => {
    const icons = {
      earthquake: '🌍',
      flood: '🌊',
      fire: '🔥',
      cyclone: '🌀',
      landslide: '⛰️',
      tsunami: '🌊',
      drought: '☀️',
      general: '📢'
    };
    return icons[type] || '📢';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'danger',
      critical: 'dark'
    };
    return colors[severity] || 'secondary';
  };

  const getSeverityLabel = (severity) => {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };
    return labels[severity] || 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAlertActive = (alert) => {
    const now = new Date();
    const validFrom = alert.validFrom ? new Date(alert.validFrom) : new Date(0);
    const validUntil = alert.validUntil ? new Date(alert.validUntil) : new Date(9999, 11, 31);
    return now >= validFrom && now <= validUntil;
  };

  const alertTypes = [
    { value: '', label: 'All Types' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'flood', label: 'Flood' },
    { value: 'fire', label: 'Fire' },
    { value: 'cyclone', label: 'Cyclone' },
    { value: 'landslide', label: 'Landslide' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'drought', label: 'Drought' },
    { value: 'general', label: 'General' }
  ];

  const severityLevels = [
    { value: '', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
    { value: 'Assam', label: 'Assam' },
    { value: 'Bihar', label: 'Bihar' },
    { value: 'Uttarakhand', label: 'Uttarakhand' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'West Bengal', label: 'West Bengal' },
    { value: 'Odisha', label: 'Odisha' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Jharkhand', label: 'Jharkhand' },
    { value: 'Chhattisgarh', label: 'Chhattisgarh' }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Header */}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-broadcast text-danger"></i>
            Emergency Alerts
          </h4>
        <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={loadAlerts}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
            {user?.role === 'admin' && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => window.location.href = '/admin'}
              >
                <i className="bi bi-plus me-1"></i>
                Create Alert
          </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h5 className="card-title">{stats.total || 0}</h5>
                <p className="card-text small">Total Alerts</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h5 className="card-title">{stats.active || 0}</h5>
                <p className="card-text small">Active Alerts</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h5 className="card-title">{stats.recent || 0}</h5>
                <p className="card-text small">This Week</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-white" style={{ backgroundColor: '#5f8a8b' }}>
              <div className="card-body text-center">
                <h5 className="card-title">{user?.institution || 'Your Region'}</h5>
                <p className="card-text small">Your Region</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Filter Alerts</h6>
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label className="form-label">Region</label>
                <select
                  className="form-select"
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Alert Type</label>
                <select
                  className="form-select"
                  value={filters.alertType}
                  onChange={(e) => handleFilterChange('alertType', e.target.value)}
                >
                  {alertTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Severity</label>
                <select
                  className="form-select"
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                >
                  {severityLevels.map(severity => (
                    <option key={severity.value} value={severity.value}>
                      {severity.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Results per page</label>
                <select
                  className="form-select"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="col-12">
        {alerts.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-bell-slash text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No alerts found</h5>
              <p className="text-muted">No alerts match your current filters.</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="col-12 col-lg-6">
                <div className={`card h-100 ${isAlertActive(alert) ? 'border-danger' : 'border-secondary'}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-danger-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                          <i className="bi bi-exclamation-triangle text-danger"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0 fw-semibold">{alert.title}</h6>
                        </div>
                        <p className="card-text text-muted small mb-2">{alert.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            {alert.region}
                            <span className="mx-2">•</span>
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(alert.createdAt)}
                          </div>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            View Details
                          </button>
                        </div>
                        {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">Affected Areas: </small>
                            {alert.affectedAreas.slice(0, 3).map((area, index) => (
                              <span key={index} className="badge bg-light text-dark me-1">
                                {area}
                              </span>
                            ))}
                            {alert.affectedAreas.length > 3 && (
                              <span className="badge bg-light text-dark">
                                +{alert.affectedAreas.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="col-12">
          <nav aria-label="Alerts pagination">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </button>
              </li>
              {[...Array(pagination.pages)].map((_, index) => (
                <li key={index} className={`page-item ${pagination.current === index + 1 ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.5rem' }}>
                    {getAlertTypeIcon(selectedAlert.alertType)}
                  </span>
                  {selectedAlert.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAlert(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <h6>Description</h6>
                    <p>{selectedAlert.description}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Severity</h6>
                    <span className={`badge bg-${getSeverityColor(selectedAlert.severity)}`}>
                      {getSeverityLabel(selectedAlert.severity)}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <h6>Region</h6>
                    <p className="mb-0">{selectedAlert.region}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Valid From</h6>
                    <p className="mb-0">{formatDate(selectedAlert.validFrom)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Valid Until</h6>
                    <p className="mb-0">{formatDate(selectedAlert.validUntil)}</p>
                  </div>
                  {selectedAlert.affectedAreas && selectedAlert.affectedAreas.length > 0 && (
                    <div className="col-12">
                      <h6>Affected Areas</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedAlert.affectedAreas.map((area, index) => (
                          <span key={index} className="badge bg-primary">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAlert(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alerts;