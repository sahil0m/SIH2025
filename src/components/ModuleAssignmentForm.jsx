import React, { useState } from 'react';
import TeacherActionsService from '../services/TeacherActionsService';
import { getCurrentUser } from '../services/AuthService';

function ModuleAssignmentForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    estimatedTime: '25 minutes',
    targetClasses: [],
    videoFile: null,
    pdfFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ video: 0, pdf: 0 });
  const [errors, setErrors] = useState({});

  const user = getCurrentUser();
  const classes = ['B.Sc CS - II', 'B.Com - I', 'B.A. - III'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB for video, 10MB for PDF)
      const maxSize = fileType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [fileType]: `File size must be less than ${fileType === 'video' ? '50MB' : '10MB'}`
        }));
        return;
      }

      // Validate file type
      const validTypes = fileType === 'video' 
        ? ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
        : ['application/pdf'];
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [fileType]: `Please select a valid ${fileType === 'video' ? 'video' : 'PDF'} file`
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fileType === 'video' ? 'videoFile' : 'pdfFile']: file
      }));

      // Clear error
      setErrors(prev => ({
        ...prev,
        [fileType]: ''
      }));
    }
  };

  const handleClassToggle = (className) => {
    setFormData(prev => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(className)
        ? prev.targetClasses.filter(c => c !== className)
        : [...prev.targetClasses, className]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (formData.targetClasses.length === 0) {
      newErrors.targetClasses = 'Please select at least one class';
    }
    if (!formData.videoFile && !formData.pdfFile) {
      newErrors.files = 'Please upload at least one file (video or PDF)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);

    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${fileType}`);
    }

    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress({ video: 0, pdf: 0 });

    try {
      const moduleData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        estimatedTime: formData.estimatedTime,
        targetClasses: formData.targetClasses,
        teacherName: user?.name || 'Teacher',
        teacherId: user?.uid,
        institution: user?.institution || 'BML Munjal University',
        files: {
          video: null,
          pdf: null
        }
      };

      // Upload files if present
      if (formData.videoFile) {
        setUploadProgress(prev => ({ ...prev, video: 50 }));
        const videoResult = await uploadFile(formData.videoFile, 'video');
        moduleData.files.video = {
          filename: videoResult.filename,
          originalName: formData.videoFile.name,
          url: videoResult.url,
          size: formData.videoFile.size,
          type: formData.videoFile.type
        };
        setUploadProgress(prev => ({ ...prev, video: 100 }));
      }

      if (formData.pdfFile) {
        setUploadProgress(prev => ({ ...prev, pdf: 50 }));
        const pdfResult = await uploadFile(formData.pdfFile, 'pdf');
        moduleData.files.pdf = {
          filename: pdfResult.filename,
          originalName: formData.pdfFile.name,
          url: pdfResult.url,
          size: formData.pdfFile.size,
          type: formData.pdfFile.type
        };
        setUploadProgress(prev => ({ ...prev, pdf: 100 }));
      }

      // Assign module
      await TeacherActionsService.assignModule(moduleData);
      
      onSuccess('Module assigned successfully with files!');
      onClose();
      
    } catch (error) {
      console.error('Error assigning module:', error);
      alert('Error assigning module: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-journal-plus me-2"></i>
              Assign Module with Files
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Title */}
                <div className="col-12">
                  <label className="form-label">Module Title *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter module title"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter module description"
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>

                {/* Due Date and Estimated Time */}
                <div className="col-md-6">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dueDate && <div className="invalid-feedback">{errors.dueDate}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Estimated Time</label>
                  <select
                    className="form-select"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleInputChange}
                  >
                    <option value="15 minutes">15 minutes</option>
                    <option value="25 minutes">25 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                </div>

                {/* Target Classes */}
                <div className="col-12">
                  <label className="form-label">Target Classes *</label>
                  <div className="row g-2">
                    {classes.map(className => (
                      <div key={className} className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={className}
                            checked={formData.targetClasses.includes(className)}
                            onChange={() => handleClassToggle(className)}
                          />
                          <label className="form-check-label" htmlFor={className}>
                            {className}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.targetClasses && <div className="text-danger small">{errors.targetClasses}</div>}
                </div>

                {/* File Upload Section */}
                <div className="col-12">
                  <label className="form-label">Upload Files *</label>
                  <div className="row g-3">
                    {/* Video Upload */}
                    <div className="col-md-6">
                      <div className="border rounded p-3">
                        <h6 className="text-primary">
                          <i className="bi bi-camera-video me-2"></i>
                          Video File
                        </h6>
                        <input
                          type="file"
                          className="form-control"
                          accept="video/*"
                          onChange={(e) => handleFileChange(e, 'video')}
                        />
                        {formData.videoFile && (
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="bi bi-file-earmark-play me-1"></i>
                              {formData.videoFile.name} ({formatFileSize(formData.videoFile.size)})
                            </small>
                            {uploadProgress.video > 0 && (
                              <div className="progress mt-1" style={{ height: '4px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${uploadProgress.video}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        )}
                        {errors.video && <div className="text-danger small">{errors.video}</div>}
                      </div>
                    </div>

                    {/* PDF Upload */}
                    <div className="col-md-6">
                      <div className="border rounded p-3">
                        <h6 className="text-danger">
                          <i className="bi bi-file-pdf me-2"></i>
                          PDF File
                        </h6>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, 'pdf')}
                        />
                        {formData.pdfFile && (
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="bi bi-file-earmark-pdf me-1"></i>
                              {formData.pdfFile.name} ({formatFileSize(formData.pdfFile.size)})
                            </small>
                            {uploadProgress.pdf > 0 && (
                              <div className="progress mt-1" style={{ height: '4px' }}>
                                <div 
                                  className="progress-bar bg-danger" 
                                  style={{ width: `${uploadProgress.pdf}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        )}
                        {errors.pdf && <div className="text-danger small">{errors.pdf}</div>}
                      </div>
                    </div>
                  </div>
                  {errors.files && <div className="text-danger small">{errors.files}</div>}
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Upload at least one file. Video files (max 50MB), PDF files (max 10MB).
                  </small>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Assigning Module...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Assign Module
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleAssignmentForm;
