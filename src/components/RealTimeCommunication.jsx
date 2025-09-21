import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

function RealTimeCommunication({ userRole, onSendDrillAnnouncement, onSendEmergencyAlert }) {
  const [drillMessage, setDrillMessage] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleDrillAnnouncement = async () => {
    if (!drillMessage.trim()) return;
    
    setIsSending(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.DRILLS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Drill Announcement',
          message: drillMessage,
          drillType: 'fire',
          priority: 'normal',
          targetClasses: ['all'],
          teacherName: 'Admin',
          institution: 'BML Munjal University'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setDrillMessage('');
        alert('Drill announcement sent successfully!');
      }
    } catch (error) {
      console.error('Error sending drill announcement:', error);
      alert('Error sending drill announcement');
    } finally {
      setIsSending(false);
    }
  };

  const handleEmergencyAlert = async () => {
    if (!emergencyMessage.trim()) return;
    
    setIsSending(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.ALERTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Emergency Alert',
          message: emergencyMessage,
          severity: 'high',
          region: 'All Regions',
          affectedAreas: ['All Areas']
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setEmergencyMessage('');
        alert('Emergency alert sent successfully!');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      alert('Error sending emergency alert');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center gap-2">
          <i className="bi bi-broadcast text-primary"></i>
          Real-time Communication
        </h5>
        <p className="text-muted small mb-3">
          {userRole === 'admin' 
            ? 'Enable broadcast messaging to students, parents, and staff during incidents.'
            : 'Send drill announcements to your classes and students.'
          }
        </p>

        {/* Drill Announcement Section */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Drill Announcement</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter drill announcement message..."
            value={drillMessage}
            onChange={(e) => setDrillMessage(e.target.value)}
            disabled={isSending}
          />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">
              {drillMessage.length}/500 characters
            </small>
            <button
              className="btn btn-warning btn-sm"
              onClick={handleDrillAnnouncement}
              disabled={!drillMessage.trim() || isSending}
            >
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-bell me-1"></i>
                  Send Drill Announcement
                </>
              )}
            </button>
          </div>
        </div>

        {/* Emergency Alert Section - Only for Admin */}
        {userRole === 'admin' && (
          <div className="border-top pt-3">
            <label className="form-label fw-semibold text-danger">Emergency Alert</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Enter emergency alert message..."
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              disabled={isSending}
            />
            <div className="d-flex justify-content-between align-items-center mt-2">
              <small className="text-muted">
                {emergencyMessage.length}/500 characters
              </small>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleEmergencyAlert}
                disabled={!emergencyMessage.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Send Emergency Alert
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RealTimeCommunication;