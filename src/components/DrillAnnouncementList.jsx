import React, { useState, useEffect } from 'react';
import DrillAnnouncementService from '../services/DrillAnnouncementService';

function DrillAnnouncementList({ userRole = 'student' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, fire, earthquake, flood, evacuation
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority

  useEffect(() => {
    loadAnnouncements();
    
    // Listen for real-time drill announcements
    const handleDrillAnnouncement = (event) => {
      const newAnnouncement = event.detail;
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    };

    window.addEventListener('drillAnnouncement', handleDrillAnnouncement);
    
    return () => {
      window.removeEventListener('drillAnnouncement', handleDrillAnnouncement);
    };
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = userRole === 'teacher' 
        ? await DrillAnnouncementService.getTeacherAnnouncements(getCurrentUserId())
        : await DrillAnnouncementService.getStudentAnnouncements(getCurrentUserId());
      
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    // In real implementation, get from auth context
    return localStorage.getItem('userId') || 'current-user';
  };

  const getDrillTypeIcon = (type) => {
    const icons = {
      fire: '🔥',
      earthquake: '🌍',
      flood: '🌊',
      evacuation: '🚨'
    };
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      normal: 'warning',
      high: 'danger'
    };
    return colors[priority] || 'warning';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Low Priority',
      normal: 'Normal Priority',
      high: 'High Priority'
    };
    return labels[priority] || 'Unknown';
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

  const filteredAndSortedAnnouncements = announcements
    .filter(announcement => {
      if (filter === 'all') return true;
      return announcement.drillType === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.sentAt) - new Date(a.sentAt);
        case 'oldest':
          return new Date(a.sentAt) - new Date(b.sentAt);
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading announcements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title d-flex align-items-center gap-2 mb-0">
            <i className="bi bi-broadcast text-primary"></i>
            {userRole === 'teacher' ? 'My Drill Announcements' : 'Drill Announcements'}
          </h5>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={loadAnnouncements}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <select 
              className="form-select form-select-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Drill Types</option>
              <option value="fire">Fire Safety</option>
              <option value="earthquake">Earthquake</option>
              <option value="flood">Flood Safety</option>
              <option value="evacuation">Evacuation</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <select 
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
            </select>
          </div>
        </div>

        {/* Announcements List */}
        {filteredAndSortedAnnouncements.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-bell-slash text-muted" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted mt-2 mb-0">No drill announcements found</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filteredAndSortedAnnouncements.map((announcement, index) => (
              <div key={announcement.id || index} className="list-group-item border-0 px-0">
                <div className="d-flex align-items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-flag text-warning"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-1 fw-semibold">{announcement.title}</h6>
                    </div>
                    <p className="mb-2 text-muted small">{announcement.message}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="small text-muted">
                        <i className="bi bi-person me-1"></i>
                        {announcement.teacherName || 'Teacher'}
                        <span className="mx-2">•</span>
                        <i className="bi bi-clock me-1"></i>
                        {formatDate(announcement.sentAt)}
                      </div>
                      <div className="small text-muted">
                        {announcement.drillType?.charAt(0).toUpperCase() + announcement.drillType?.slice(1)} Drill
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DrillAnnouncementList;
