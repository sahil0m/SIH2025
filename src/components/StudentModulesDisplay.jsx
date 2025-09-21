import React, { useState, useEffect } from 'react';
import TeacherActionsService from '../services/TeacherActionsService';
import RealtimeService from '../services/RealtimeService';
import PointsService from '../services/PointsService';

function StudentModulesDisplay() {
  const [assignedModules, setAssignedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAllModules, setShowAllModules] = useState(false);
  const [completedFiles, setCompletedFiles] = useState(new Set());
  const [videoRef, setVideoRef] = useState(null);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [modulePoints, setModulePoints] = useState({});

  useEffect(() => {
    loadModules();
    
    // Connect to real-time service
    RealtimeService.connect();
    
    // Listen for new module assignments
    RealtimeService.onNewModuleAssignment((module) => {
      setAssignedModules(prev => [module, ...prev]);
    });

    // Also listen for custom events (fallback)
    const handleModuleAssignment = (event) => {
      const module = event.detail;
      setAssignedModules(prev => [module, ...prev]);
    };

    window.addEventListener('moduleAssigned', handleModuleAssignment);

    return () => {
      RealtimeService.disconnect();
      window.removeEventListener('moduleAssigned', handleModuleAssignment);
    };
  }, []);

  // Load module points for progress calculation
  const loadModulePoints = async () => {
    const userId = PointsService.getCurrentUserId();
    
    for (const module of assignedModules) {
      try {
        // Load points for video
        if (module.files?.video) {
          const videoId = PointsService.generateModuleVideoId(module._id, 'video-completion');
          const videoPoints = await PointsService.getVideoPoints(userId, videoId);
          
          // Load points for PDF
          let pdfPoints = 0;
          if (module.files?.pdf) {
            const pdfVideoId = PointsService.generateModuleVideoId(module._id, 'pdf-completion');
            const pdfPointsData = await PointsService.getVideoPoints(userId, pdfVideoId);
            pdfPoints = pdfPointsData.points;
          }
          
          setModulePoints(prev => ({
            ...prev,
            [module._id]: (videoPoints.points || 0) + pdfPoints
          }));
        }
      } catch (error) {
        console.error(`Failed to load points for module ${module._id}:`, error);
      }
    }
  };

  // Load points when modules change
  useEffect(() => {
    if (assignedModules.length > 0) {
      loadModulePoints();
    }
  }, [assignedModules]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const modules = await TeacherActionsService.getAssignedModules();
      console.log('Loaded modules:', modules);
      setAssignedModules(modules);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    if (isNaN(bytes)) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return 'bi-file-earmark text-secondary';
    if (fileType.includes('video')) {
      return 'bi-camera-video text-primary';
    } else if (fileType.includes('pdf')) {
      return 'bi-file-pdf text-danger';
    }
    return 'bi-file-earmark text-secondary';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const date = new Date(dueDate);
    return !isNaN(date.getTime()) && date < new Date();
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return false;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return date <= threeDaysFromNow && date > new Date();
  };

  const getFileId = (moduleId, fileType) => {
    return `${moduleId}-${fileType}`;
  };

  const handleFileClick = (file, fileType, currentModule) => {
    if (!file) {
      alert('File information not available');
      return;
    }
    
    if (!file.url) {
      alert('File URL not available');
      return;
    }
    
    console.log(`Opening ${fileType} file:`, file.url);
    
    // Test if the URL is accessible
    fetch(file.url, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          setSelectedModule({ ...currentModule, currentFile: file, currentFileType: fileType });
        } else {
          alert(`File not accessible. Status: ${response.status}`);
        }
      })
      .catch(error => {
        console.error('Error accessing file:', error);
        alert('Error accessing file. Please try again.');
      });
  };

  const handleMarkFileCompleted = async (fileId, fileType) => {
    setCompletedFiles(prev => new Set([...prev, fileId]));
    console.log(`File ${fileId} marked as completed`);
    
    // Award points based on file type
    try {
      const userId = PointsService.getCurrentUserId();
      const moduleId = selectedModule?._id || 'unknown';
      const points = fileType === 'video' ? 100 : 50; // 100 points for video, 50 for PDF
      const videoId = PointsService.generateModuleVideoId(moduleId, `${fileType}-completion`);
      
      // Use custom points for different file types
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/points/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          videoId: videoId,
          videoType: 'module_assignment',
          completionPercentage: 100,
          points: points // Use custom points: 100 for video, 50 for PDF
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`🎉 ${fileType.toUpperCase()} marked as complete! Awarded ${points} points`);
        if (window.showNotification) {
          window.showNotification(`${fileType.toUpperCase()} marked as completed! +${points} points earned!`, 'success');
        }
        
        // Update module points for progress bar
        if (selectedModule) {
          setModulePoints(prev => ({
            ...prev,
            [selectedModule._id]: (prev[selectedModule._id] || 0) + points
          }));
        }
      }
    } catch (error) {
      console.error('Failed to award completion points:', error);
      // Still show success for marking as complete, even if points fail
      if (window.showNotification) {
        window.showNotification(`File marked as completed!`, 'success');
      }
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const video = e.target;
    const duration = video.duration;
    const currentTime = video.currentTime;
    
    // Auto-complete when reaching last 15 seconds
    if (currentTime >= duration - 15 && !autoCompleted) {
      const fileId = getFileId(selectedModule._id, 'video');
      handleMarkFileCompleted(fileId, 'video');
      setAutoCompleted(true);
    }
  };

  const handleVideoEnded = () => {
    if (!autoCompleted) {
      const fileId = getFileId(selectedModule._id, 'video');
      handleMarkFileCompleted(fileId, 'video');
      setAutoCompleted(true);
    }
  };

  const handleVideoLoadedMetadata = () => {
    setAutoCompleted(false);
  };

  const closeModal = () => {
    setSelectedModule(null);
    setAutoCompleted(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading modules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Header */}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-journal-text text-primary"></i>
            Modules Assigned by Teachers
          </h5>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={loadModules}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Modules List */}
      {assignedModules.length === 0 ? (
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No modules assigned yet</h5>
              <p className="text-muted">Your teachers will assign modules with videos and PDFs here.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {(showAllModules ? assignedModules : assignedModules.slice(0, 2)).filter(module => module && module.title).map((module, index) => (
            <div key={module._id || index} className="col-12 col-lg-6">
              <div className={`card h-100 ${isOverdue(module.dueDate) ? 'border-danger' : isDueSoon(module.dueDate) ? 'border-warning' : 'border-primary'}`}>
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="card-title mb-0 fw-semibold">{module.title}</h6>
                    <div className="d-flex gap-1">
                      {isOverdue(module.dueDate) ? (
                        <span className="badge bg-danger">Overdue</span>
                      ) : isDueSoon(module.dueDate) ? (
                        <span className="badge bg-warning">Due Soon</span>
                      ) : (
                        <span className="badge bg-success">Active</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-text text-muted small mb-3">{module.description || 'No description available'}</p>
                  
                  {/* Module Details */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Due Date</small>
                      <span className="fw-semibold">{module.dueDate ? formatDate(module.dueDate) : 'Not specified'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Estimated Time</small>
                      <span className="fw-semibold">{module.estimatedTime || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Files Section */}
                  {(module.files?.video || module.files?.pdf) && (
                    <div className="mb-3">
                      <h6 className="small fw-semibold text-muted mb-2">Attached Files</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {module.files?.video && module.files.video.originalName && (
                          <div className="d-flex align-items-center gap-2 p-2 bg-primary-subtle rounded">
                            <i className={`bi ${getFileIcon(module.files.video.type || 'video/mp4')}`}></i>
                            <div>
                              <div className="small fw-semibold">{module.files.video.originalName}</div>
                              <div className="small text-muted">{formatFileSize(module.files.video.size || 0)}</div>
                            </div>
                          </div>
                        )}
                        {module.files?.pdf && module.files.pdf.originalName && (
                          <div className="d-flex align-items-center gap-2 p-2 bg-danger-subtle rounded">
                            <i className={`bi ${getFileIcon(module.files.pdf.type || 'application/pdf')}`}></i>
                            <div>
                              <div className="small fw-semibold">{module.files.pdf.originalName}</div>
                              <div className="small text-muted">{formatFileSize(module.files.pdf.size || 0)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Progress</span>
                      <span className="text-muted small">{modulePoints[module._id] || 0} / 150 points</span>
                    </div>
                    <div className="progress" role="progressbar" aria-label="module progress" aria-valuenow={modulePoints[module._id] || 0} aria-valuemin="0" aria-valuemax="150">
                      <div className="progress-bar bg-primary" style={{ width: `${Math.min(((modulePoints[module._id] || 0) / 150) * 100, 100)}%` }}>
                        {modulePoints[module._id] ? `${modulePoints[module._id]} pts` : '0 pts'}
                      </div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="small text-muted">
                      <i className="bi bi-person me-1"></i>
                      Assigned by {module.teacherName || 'Unknown Teacher'}
                    </div>
                    <div className="d-flex gap-2">
                      {/* File Access Buttons */}
                      {module.files?.video && module.files.video.url && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleFileClick(module.files.video, 'video', module)}
                        >
                          <i className="bi bi-play-circle me-1"></i>
                          Watch Video
                        </button>
                      )}
                      {module.files?.pdf && module.files.pdf.url && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleFileClick(module.files.pdf, 'pdf', module)}
                        >
                          <i className="bi bi-file-pdf me-1"></i>
                          View PDF
                        </button>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedModule(module)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {assignedModules.length > 2 && (
            <div className="col-12 text-center mt-3">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowAllModules(!showAllModules)}
              >
                {showAllModules ? (
                  <>
                    <i className="bi bi-chevron-up me-1"></i>
                    Show Less
                  </>
                ) : (
                  <>
                    <i className="bi bi-chevron-down me-1"></i>
                    Show More ({assignedModules.length - 2} more)
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Module Details Modal */}
      {selectedModule && !selectedModule.currentFile && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" onClick={closeModal}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-journal-text text-primary"></i>
                  {selectedModule.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Module Description */}
                <div className="mb-4">
                  <h6>Description</h6>
                  <p className="text-muted">{selectedModule.description || 'No description available'}</p>
                </div>

                {/* Module Details */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <h6>Due Date</h6>
                    <p className="text-muted">{formatDate(selectedModule.dueDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Estimated Time</h6>
                    <p className="text-muted">{selectedModule.estimatedTime || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Target Classes</h6>
                    <p className="text-muted">{selectedModule.targetClasses?.join(', ') || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Teacher</h6>
                    <p className="text-muted">{selectedModule.teacherName || 'Unknown Teacher'}</p>
                  </div>
                </div>

                {/* Files Section */}
                {(selectedModule.files?.video || selectedModule.files?.pdf) && (
                  <div className="mb-4">
                    <h6>Attached Files</h6>
                    <div className="row g-3">
                      {selectedModule.files?.video && selectedModule.files.video.url && (
                        <div className="col-md-6">
                          <div className="card border-primary">
                            <div className="card-body text-center">
                              <i className="bi bi-camera-video text-primary" style={{ fontSize: '2rem' }}></i>
                              <h6 className="mt-2">{selectedModule.files.video.originalName}</h6>
                              <p className="text-muted small">{formatFileSize(selectedModule.files.video.size || 0)}</p>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleFileClick(selectedModule.files.video, 'video', selectedModule)}
                              >
                                <i className="bi bi-play-circle me-1"></i>
                                Watch Video
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedModule.files?.pdf && selectedModule.files.pdf.url && (
                        <div className="col-md-6">
                          <div className="card border-danger">
                            <div className="card-body text-center">
                              <i className="bi bi-file-pdf text-danger" style={{ fontSize: '2rem' }}></i>
                              <h6 className="mt-2">{selectedModule.files.pdf.originalName}</h6>
                              <p className="text-muted small">{formatFileSize(selectedModule.files.pdf.size || 0)}</p>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleFileClick(selectedModule.files.pdf, 'pdf', selectedModule)}
                              >
                                <i className="bi bi-file-pdf me-1"></i>
                                View PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                <div className="mb-3">
                  <h6>Completion Status</h6>
                  <div className="d-flex gap-3">
                    {selectedModule.files?.video && (
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${completedFiles.has(getFileId(selectedModule._id, 'video')) ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}></i>
                        <span className={completedFiles.has(getFileId(selectedModule._id, 'video')) ? 'text-success' : 'text-muted'}>
                          Video {completedFiles.has(getFileId(selectedModule._id, 'video')) ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    )}
                    {selectedModule.files?.pdf && (
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${completedFiles.has(getFileId(selectedModule._id, 'pdf')) ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}></i>
                        <span className={completedFiles.has(getFileId(selectedModule._id, 'pdf')) ? 'text-success' : 'text-muted'}>
                          PDF {completedFiles.has(getFileId(selectedModule._id, 'pdf')) ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {selectedModule && selectedModule.currentFile && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" onClick={closeModal}>
          <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-journal-text text-primary"></i>
                  {selectedModule.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Auto-completion indicator for video */}
                {selectedModule.currentFileType === 'video' && !autoCompleted && (
                  <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-info-circle"></i>
                    <span>Video will be automatically marked as completed when it reaches the last 15 seconds</span>
                  </div>
                )}

                {/* File Content */}
                {selectedModule.currentFileType === 'video' ? (
                  <div className="ratio ratio-16x9">
                    <video 
                      ref={setVideoRef}
                      controls 
                      className="rounded"
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                    >
                      <source src={selectedModule.currentFile.url || ''} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="ratio ratio-16x9">
                    <iframe 
                      src={selectedModule.currentFile.url || ''} 
                      className="rounded"
                      title={selectedModule.currentFile.originalName || 'PDF Document'}
                    ></iframe>
                  </div>
                )}

                {/* File Info */}
                <div className="mt-3">
                  <h6>File Details</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>File Name:</strong> {selectedModule.currentFile.originalName || 'Unknown'}
                    </div>
                    <div className="col-md-6">
                      <strong>File Size:</strong> {formatFileSize(selectedModule.currentFile.size || 0)}
                    </div>
                    <div className="col-md-6">
                      <strong>File Type:</strong> {selectedModule.currentFileType?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    <div className="col-md-6">
                      <strong>Module:</strong> {selectedModule.title || 'Unknown Module'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <div>
                    {completedFiles.has(getFileId(selectedModule._id, selectedModule.currentFileType)) ? (
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        {autoCompleted ? 'Auto Completed' : 'File Completed'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkFileCompleted(getFileId(selectedModule._id, selectedModule.currentFileType), selectedModule.currentFileType)}
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Mark as Completed
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentModulesDisplay;