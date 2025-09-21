import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import RealtimeService from '../services/RealtimeService';

function AnnouncementsDisplay({ userRole }) {
  const [announcements, setAnnouncements] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    
    // Connect to real-time service
    RealtimeService.connect();
    
    // Listen for new drill announcements
    RealtimeService.onNewDrillAnnouncement((announcement) => {
      setAnnouncements(prev => [announcement, ...prev]);
    });

    // Listen for new emergency alerts
    RealtimeService.onNewEmergencyAlert((alert) => {
      setEmergencyAlerts(prev => [alert, ...prev]);
    });

    return () => {
      RealtimeService.disconnect();
    };
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      
      // Load drill announcements
      const drillResponse = await fetch(`${API_ENDPOINTS.DRILLS}`);
      const drillData = await drillResponse.json();
      if (drillData.success) {
        setAnnouncements(drillData.data.announcements);
      }
      
      // Load emergency alerts
      const emergencyResponse = await fetch(`${API_ENDPOINTS.ALERTS}`);
      const emergencyData = await emergencyResponse.json();
      if (emergencyData.success) {
        setEmergencyAlerts(emergencyData.data.alerts);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDrillTypeIcon = (type) => {
    const icons = {
      fire: '🔥',
      earthquake: '🌍',
      flood: '🌊',
      evacuation: '🚨'
    };
    return icons[type] || '��';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      normal: 'warning',
      high: 'danger'
    };
    return colors[priority] || 'warning';
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-3">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading announcements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Drill Announcements */}
      <div className="col-12">
        <h5 className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-bell text-warning"></i>
          Drill Announcements
        </h5>
        {announcements.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-4">
              <i className="bi bi-bell-slash text-muted" style={{ fontSize: '2rem' }}></i>
              <p className="text-muted mt-2 mb-0">No drill announcements</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {(showAllAnnouncements ? announcements : announcements.slice(0, 2)).map((announcement, index) => (
              <div key={announcement._id || index} className="col-12 col-md-6">
                <div className="card border-warning">
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-flag text-warning"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0 fw-semibold">{announcement.title}</h6>
                        </div>
                        <p className="card-text text-muted small mb-2">{announcement.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small text-muted">
                            <i className="bi bi-person me-1"></i>
                            {announcement.teacherName || 'Teacher'}
                            <span className="mx-2">•</span>
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(announcement.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length > 2 && (
              <div className="col-12 text-center mt-3">
                <button 
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                >
                  {showAllAnnouncements ? (
                    <>
                      <i className="bi bi-chevron-up me-1"></i>
                      Show Less
                    </>
                  ) : (
                    <>
                      <i className="bi bi-chevron-down me-1"></i>
                      Show More ({announcements.length - 2} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency Alerts */}
      <div className="col-12">
        <h5 className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-exclamation-triangle text-danger"></i>
          Emergency Alerts
        </h5>
        {emergencyAlerts.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-4">
              <i className="bi bi-shield-check text-muted" style={{ fontSize: '2rem' }}></i>
              <p className="text-muted mt-2 mb-0">No emergency alerts</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {(showAllAlerts ? emergencyAlerts : emergencyAlerts.slice(0, 2)).map((alert, index) => (
              <div key={alert._id || index} className="col-12 col-md-6">
                <div className="card border-danger">
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-danger-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-exclamation-triangle text-danger"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0 fw-semibold text-danger">{alert.title}</h6>
                        </div>
                        <p className="card-text text-muted small mb-2">{alert.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            {alert.region}
                            <span className="mx-2">•</span>
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(alert.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {emergencyAlerts.length > 2 && (
              <div className="col-12 text-center mt-3">
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                >
                  {showAllAlerts ? (
                    <>
                      <i className="bi bi-chevron-up me-1"></i>
                      Show Less
                    </>
                  ) : (
                    <>
                      <i className="bi bi-chevron-down me-1"></i>
                      Show More ({emergencyAlerts.length - 2} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementsDisplay;