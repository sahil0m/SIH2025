import React, { useState } from 'react';
import AlertService from '../services/AlertService';

function AlertCreationForm({ onSaveAlert, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alertType: 'earthquake',
    severity: 'medium',
    region: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    affectedAreas: [],
    validFrom: '',
    validUntil: '',
    isActive: true,
    priority: 'normal'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alertTypes = [
    { value: 'earthquake', label: 'Earthquake', color: 'danger' },
    { value: 'flood', label: 'Flood', color: 'info' },
    { value: 'fire', label: 'Fire', color: 'danger' },
    { value: 'cyclone', label: 'Cyclone', color: 'warning' },
    { value: 'landslide', label: 'Landslide', color: 'warning' },
    { value: 'tsunami', label: 'Tsunami', color: 'danger' },
    { value: 'drought', label: 'Drought', color: 'warning' },
    { value: 'general', label: 'General Alert', color: 'secondary' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'success', description: 'Minor risk, monitor situation' },
    { value: 'medium', label: 'Medium', color: 'warning', description: 'Moderate risk, take precautions' },
    { value: 'high', label: 'High', color: 'danger', description: 'Significant risk, immediate action required' },
    { value: 'critical', label: 'Critical', color: 'dark', description: 'Extreme risk, evacuate immediately' }
  ];

  const regions = [
    'Himachal Pradesh',
    'Assam',
    'Bihar',
    'Uttarakhand',
    'Kerala',
    'Tamil Nadu',
    'Gujarat',
    'Maharashtra',
    'West Bengal',
    'Odisha',
    'Andhra Pradesh',
    'Karnataka',
    'Rajasthan',
    'Punjab',
    'Haryana',
    'Delhi',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Jharkhand',
    'Chhattisgarh'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAffectedAreaAdd = () => {
    const area = document.getElementById('affectedAreaInput').value.trim();
    if (area && !formData.affectedAreas.includes(area)) {
      setFormData(prev => ({
        ...prev,
        affectedAreas: [...prev.affectedAreas, area]
      }));
      document.getElementById('affectedAreaInput').value = '';
    }
  };

  const handleAffectedAreaRemove = (area) => {
    setFormData(prev => ({
      ...prev,
      affectedAreas: prev.affectedAreas.filter(a => a !== area)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Alert title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Alert description is required';
    }

    if (!formData.region) {
      newErrors.region = 'Region is required';
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Valid from date is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    if (formData.validFrom && formData.validUntil && new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = 'Valid until must be after valid from date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const alertData = {
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: 'admin', // In real app, get from auth context
        status: 'active'
      };

      const result = await AlertService.createAlert(alertData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        alertType: 'earthquake',
        severity: 'medium',
        region: '',
        coordinates: { lat: '', lng: '' },
        affectedAreas: [],
        validFrom: '',
        validUntil: '',
        isActive: true,
        priority: 'normal'
      });
      
      // Show success message
      alert('Alert created successfully! It will be visible to all users in the alerts section.');
      
    } catch (error) {
      console.error('Error saving alert:', error);
      alert('Error creating alert: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAlertType = alertTypes.find(type => type.value === formData.alertType);
  const selectedSeverity = severityLevels.find(severity => severity.value === formData.severity);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center gap-2">
          <i className="bi bi-broadcast text-danger"></i>
          Create New Alert
        </h5>
        <p className="text-muted small mb-4">
          Create and configure disaster alerts for your region. All alerts will be sent to students, teachers, and staff in real-time.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Alert Type and Severity */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Alert Type *</label>
              <select
                className={`form-select ${errors.alertType ? 'is-invalid' : ''}`}
                name="alertType"
                value={formData.alertType}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                {alertTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.alertType && <div className="invalid-feedback">{errors.alertType}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Severity Level *</label>
              <select
                className={`form-select ${errors.severity ? 'is-invalid' : ''}`}
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                {severityLevels.map(severity => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label} - {severity.description}
                  </option>
                ))}
              </select>
              {errors.severity && <div className="invalid-feedback">{errors.severity}</div>}
            </div>
          </div>

          {/* Alert Title and Description */}
          <div className="row g-3 mb-3">
            <div className="col-12">
              <label className="form-label fw-semibold">Alert Title *</label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Landslide Risk, Flood Warning, Earthquake Alert"
                maxLength={100}
                disabled={isSubmitting}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              <small className="text-muted">{formData.title.length}/100 characters</small>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Alert Description *</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about the alert, affected areas, and recommended actions..."
                maxLength={500}
                disabled={isSubmitting}
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              <small className="text-muted">{formData.description.length}/500 characters</small>
            </div>
          </div>

          {/* Region and Location */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Region *</label>
              <select
                className={`form-select ${errors.region ? 'is-invalid' : ''}`}
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <div className="invalid-feedback">{errors.region}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Coordinates (Optional)</label>
              <div className="row g-2">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control"
                    name="coordinates.lat"
                    value={formData.coordinates.lat}
                    onChange={handleInputChange}
                    placeholder="Latitude"
                    step="any"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control"
                    name="coordinates.lng"
                    value={formData.coordinates.lng}
                    onChange={handleInputChange}
                    placeholder="Longitude"
                    step="any"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Affected Areas */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Affected Areas</label>
            <div className="d-flex gap-2 mb-2">
              <input
                type="text"
                id="affectedAreaInput"
                className="form-control"
                placeholder="Enter affected area (e.g., School Zone A, Building B)"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleAffectedAreaAdd}
                disabled={isSubmitting}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
            {formData.affectedAreas.length > 0 && (
              <div className="d-flex flex-wrap gap-1">
                {formData.affectedAreas.map((area, index) => (
                  <span key={index} className="badge bg-primary d-flex align-items-center gap-1">
                    {area}
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => handleAffectedAreaRemove(area)}
                      disabled={isSubmitting}
                    ></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Validity Period */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Valid From *</label>
              <input
                type="datetime-local"
                className={`form-control ${errors.validFrom ? 'is-invalid' : ''}`}
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {errors.validFrom && <div className="invalid-feedback">{errors.validFrom}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Valid Until *</label>
              <input
                type="datetime-local"
                className={`form-control ${errors.validUntil ? 'is-invalid' : ''}`}
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {errors.validUntil && <div className="invalid-feedback">{errors.validUntil}</div>}
            </div>
          </div>

          {/* Alert Preview */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Alert Preview</label>
            <div className="card border">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`bg-${selectedAlertType?.color || 'secondary'}-subtle rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-exclamation-triangle text-danger"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="mb-0 fw-semibold">{formData.title || 'Alert Title'}</h6>
                    </div>
                    <div className="text-muted small mb-1">
                      {formData.validFrom ? new Date(formData.validFrom).toLocaleString() : 'Date and time'}
                    </div>
                    <div className="text-muted small">
                      {formData.description || 'Alert description will appear here...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating Alert...
                </>
              ) : (
                <>
                  <i className="bi bi-broadcast me-2"></i>
                  Create Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AlertCreationForm;
