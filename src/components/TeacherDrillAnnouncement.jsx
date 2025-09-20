import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/AuthService';

function TeacherDrillAnnouncement({ onSendDrillAnnouncement }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetClasses: [],
    priority: 'normal',
    scheduledFor: '',
    drillType: 'fire'
  });
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mock classes data - in real implementation, this would come from API
  const availableClasses = [
    { id: 'class1', name: 'B.Sc CS - II', studentCount: 45 },
    { id: 'class2', name: 'B.Com - I', studentCount: 38 },
    { id: 'class3', name: 'B.A. - III', studentCount: 42 },
    { id: 'class4', name: 'M.Sc Physics', studentCount: 28 }
  ];

  const drillTypes = [
    { value: 'fire', label: 'Fire Safety Drill' },
    { value: 'earthquake', label: 'Earthquake Drill' },
    { value: 'flood', label: 'Flood Safety Drill' },
    { value: 'evacuation', label: 'General Evacuation' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'success' },
    { value: 'normal', label: 'Normal Priority', color: 'warning' },
    { value: 'high', label: 'High Priority', color: 'danger' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(classId)
        ? prev.targetClasses.filter(id => id !== classId)
        : [...prev.targetClasses, classId]
    }));
  };

  const handleSelectAllClasses = () => {
    setFormData(prev => ({
      ...prev,
      targetClasses: availableClasses.map(cls => cls.id)
    }));
  };

  const handleClearAllClasses = () => {
    setFormData(prev => ({
      ...prev,
      targetClasses: []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in both title and message');
      return;
    }

    if (formData.targetClasses.length === 0) {
      setErrorMessage('Please select at least one class');
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const announcementData = {
        ...formData,
        teacherId: getCurrentUser()?.uid,
        teacherName: getCurrentUser()?.name,
        institution: getCurrentUser()?.institution,
        createdAt: new Date().toISOString(),
        status: 'sent'
      };

      await onSendDrillAnnouncement(announcementData);
      
      setSuccessMessage('Drill announcement sent successfully!');
      setFormData({
        title: '',
        message: '',
        targetClasses: [],
        priority: 'normal',
        scheduledFor: '',
        drillType: 'fire'
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to send drill announcement');
    } finally {
      setIsSending(false);
    }
  };

  const selectedClassesCount = formData.targetClasses.length;
  const totalStudents = formData.targetClasses.reduce((total, classId) => {
    const cls = availableClasses.find(c => c.id === classId);
    return total + (cls ? cls.studentCount : 0);
  }, 0);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center gap-2">
          <i className="bi bi-broadcast text-primary"></i>
          Send Drill Announcement
        </h5>
        <p className="text-muted small mb-4">
          Send drill announcements to your classes and students. They will receive real-time notifications.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Title and Message */}
          <div className="row g-3 mb-3">
            <div className="col-12">
              <label className="form-label fw-semibold">Announcement Title *</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Fire Safety Drill - Building A"
                maxLength={100}
                disabled={isSending}
                required
              />
              <small className="text-muted">{formData.title.length}/100 characters</small>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Message *</label>
              <textarea
                className="form-control"
                rows="4"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your drill announcement message..."
                maxLength={500}
                disabled={isSending}
                required
              />
              <small className="text-muted">{formData.message.length}/500 characters</small>
            </div>
          </div>

          {/* Drill Type and Priority */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Drill Type</label>
              <select
                className="form-select"
                name="drillType"
                value={formData.drillType}
                onChange={handleInputChange}
                disabled={isSending}
              >
                {drillTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Priority</label>
              <select
                className="form-select"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={isSending}
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Classes */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label fw-semibold mb-0">Target Classes *</label>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleSelectAllClasses}
                  disabled={isSending}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleClearAllClasses}
                  disabled={isSending}
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="row g-2">
              {availableClasses.map(cls => (
                <div key={cls.id} className="col-12 col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`class-${cls.id}`}
                      checked={formData.targetClasses.includes(cls.id)}
                      onChange={() => handleClassToggle(cls.id)}
                      disabled={isSending}
                    />
                    <label className="form-check-label" htmlFor={`class-${cls.id}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-medium">{cls.name}</span>
                        <small className="text-muted">{cls.studentCount} students</small>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedClassesCount > 0 && (
              <div className="mt-2 p-2 bg-light rounded">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Selected {selectedClassesCount} class(es) with {totalStudents} total students
                </small>
              </div>
            )}
          </div>

          {/* Schedule (Optional) */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Schedule for Later (Optional)</label>
            <input
              type="datetime-local"
              className="form-control"
              name="scheduledFor"
              value={formData.scheduledFor}
              onChange={handleInputChange}
              disabled={isSending}
            />
            <small className="text-muted">Leave empty to send immediately</small>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage('')}
              ></button>
            </div>
          )}

          {errorMessage && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {errorMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setErrorMessage('')}
              ></button>
            </div>
          )}

          {/* Submit Button */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setFormData({
                title: '',
                message: '',
                targetClasses: [],
                priority: 'normal',
                scheduledFor: '',
                drillType: 'fire'
              })}
              disabled={isSending}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              disabled={isSending || !formData.title.trim() || !formData.message.trim() || formData.targetClasses.length === 0}
            >
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-bell me-2"></i>
                  Send Drill Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherDrillAnnouncement;
