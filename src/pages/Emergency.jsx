import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const CONTACTS = [
  { label: 'NDMA Helpline', phone: '011-26701700' },
  { label: 'Police', phone: '100' },
  { label: 'Ambulance', phone: '108' },
  { label: 'Fire', phone: '101' }
];

function Emergency() {
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [drillAnnouncements, setDrillAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAllDrills, setShowAllDrills] = useState(false);

  useEffect(() => {
    fetchRealTimeData();
  }, []);

  const fetchRealTimeData = async () => {
    try {
      setLoading(true);
    const [alertsResponse, drillsResponse] = await Promise.all([
      fetch(`${API_ENDPOINTS.ALERTS}`),
      fetch(`${API_ENDPOINTS.DRILLS}`)
    ]);

      const alertsData = await alertsResponse.json();
      const drillsData = await drillsResponse.json();

      if (alertsData.success) {
        setEmergencyAlerts(alertsData.data.alerts || []);
      }
      if (drillsData.success) {
        setDrillAnnouncements(drillsData.data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title d-flex align-items-center gap-2"><i className="bi bi-telephone text-danger"></i>Emergency Contacts</h4>
            <ul className="list-group mt-3">
              {CONTACTS.map((c) => (
                <li key={c.label} className="list-group-item d-flex justify-content-between align-items-center">
                  {c.label}
                  <a className="btn btn-outline-danger btn-sm" href={`tel:${c.phone}`}>{c.phone}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-6">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0">
              <i className="bi bi-megaphone me-2"></i>Real-time Communication
            </h4>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchRealTimeData}
              disabled={loading}
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
              Refresh
            </button>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 small">Loading alerts...</p>
              </div>
            ) : (
              <div>
                {/* Emergency Alerts */}
                <div className="mb-3">
                  <h6 className="text-danger mb-2">
                    Emergency Alerts ({emergencyAlerts.length})
                  </h6>
                  {emergencyAlerts.length === 0 ? (
                    <div className="text-center py-2 text-muted small">
                      <i className="bi bi-shield-check me-1"></i>
                      No active alerts
                    </div>
                  ) : (
                    <>
                      <div className="list-group list-group-flush">
                        {(showAllAlerts ? emergencyAlerts : emergencyAlerts.slice(0, 2)).map((alert) => (
                          <div key={alert._id} className="list-group-item px-0 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1 small fw-semibold">{alert.title}</h6>
                                <p className="text-muted small mb-1">{alert.message}</p>
                              </div>
                              <small className="text-muted">{formatDate(alert.createdAt)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                      {emergencyAlerts.length > 2 && (
                        <div className="text-center mt-2">
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
                    </>
                  )}
                </div>

                {/* Drill Announcements */}
                <div className="mb-0">
                  <h6 className="text-warning mb-2">
                    Drill Announcements ({drillAnnouncements.length})
                  </h6>
                  {drillAnnouncements.length === 0 ? (
                    <div className="text-center py-2 text-muted small">
                      <i className="bi bi-calendar-x me-1"></i>
                      No announcements
                    </div>
                  ) : (
                    <>
                      <div className="list-group list-group-flush">
                        {(showAllDrills ? drillAnnouncements : drillAnnouncements.slice(0, 2)).map((drill) => (
                          <div key={drill._id} className="list-group-item px-0 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1 small fw-semibold">{drill.title}</h6>
                                <p className="text-muted small mb-1">{drill.message}</p>
                              </div>
                              <small className="text-muted">{formatDate(drill.createdAt)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                      {drillAnnouncements.length > 2 && (
                        <div className="text-center mt-2">
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => setShowAllDrills(!showAllDrills)}
                          >
                            {showAllDrills ? (
                              <>
                                <i className="bi bi-chevron-up me-1"></i>
                                Show Less
                              </>
                            ) : (
                              <>
                                <i className="bi bi-chevron-down me-1"></i>
                                Show More ({drillAnnouncements.length - 2} more)
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Emergency;


