import React, { useState, useEffect } from 'react';
import TeacherActionsService from '../services/TeacherActionsService';
import AssignmentService from '../services/AssignmentService';
import RealtimeService from '../services/RealtimeService';

function StudentNotifications() {
  console.log('StudentNotifications component rendered');
  const [assignedModules, setAssignedModules] = useState([]);
  const [confirmedDrills, setConfirmedDrills] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllModules, setShowAllModules] = useState(false);
  const [showAllDrills, setShowAllDrills] = useState(false);
  const [showAllAssignments, setShowAllAssignments] = useState(false);

  useEffect(() => {
    loadData();
    
    // Connect to real-time service
    RealtimeService.connect();
    
    // Listen for real-time notifications via Socket.io
    RealtimeService.onNewModuleAssignment((module) => {
      setAssignedModules(prev => [module, ...prev]);
    });

    RealtimeService.onNewDrillConfirmation((drill) => {
      setConfirmedDrills(prev => [drill, ...prev]);
    });

    // Also listen for custom events (fallback)
    const handleModuleAssignment = (event) => {
      const module = event.detail;
      setAssignedModules(prev => [module, ...prev]);
    };

    const handleDrillConfirmation = (event) => {
      const drill = event.detail;
      setConfirmedDrills(prev => [drill, ...prev]);
    };

    window.addEventListener('moduleAssigned', handleModuleAssignment);
    window.addEventListener('drillConfirmed', handleDrillConfirmation);

    return () => {
      RealtimeService.disconnect();
      window.removeEventListener('moduleAssigned', handleModuleAssignment);
      window.removeEventListener('drillConfirmed', handleDrillConfirmation);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading student notifications...');
      console.log('About to call TeacherActionsService.getAssignedModules()');
      const [modules, drills, assignments] = await Promise.all([
        TeacherActionsService.getAssignedModules(),
        TeacherActionsService.getConfirmedDrills(),
        AssignmentService.getAllAssignments()
      ]);
      console.log('Loaded modules:', modules);
      console.log('Loaded drills:', drills);
      console.log('Loaded assignments:', assignments);
      console.log('Setting assigned modules:', modules);
      console.log('Setting confirmed drills:', drills);
      console.log('Setting assignments:', assignments);
      setAssignedModules(modules);
      setConfirmedDrills(drills);
      setAssignments(assignments);
    } catch (error) {
      console.error('Error loading student notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('Rendering StudentNotifications - loading:', loading, 'assignedModules:', assignedModules.length, 'confirmedDrills:', confirmedDrills.length);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-3">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Assigned Modules */}
      <div className="col-12 col-md-6">
        <div className="card border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="card-title mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-journal-text"></i>
              Assigned Modules
            </h6>
          </div>
          <div className="card-body">
            {assignedModules.length === 0 ? (
              <div className="text-center py-3">
                <i className="bi bi-journal-x text-muted" style={{ fontSize: '2rem' }}></i>
                <p className="text-muted mt-2 mb-0">No modules assigned yet</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {(showAllModules ? assignedModules : assignedModules.slice(0, 2)).map((module, index) => (
                  <div key={index} className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-journal-text text-primary"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">{module.title}</h6>
                        <p className="mb-2 text-muted small">{module.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            Due: {formatDate(module.dueDate)}
                            <span className="mx-2">•</span>
                            <i className="bi bi-clock me-1"></i>
                            {module.estimatedTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {assignedModules.length > 2 && (
                  <div className="text-center mt-3">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmed Drills */}
      <div className="col-12 col-md-6">
        <div className="card border-success">
          <div className="card-header bg-success text-white">
            <h6 className="card-title mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-flag"></i>
              Confirmed Drills
            </h6>
          </div>
          <div className="card-body">
            {confirmedDrills.length === 0 ? (
              <div className="text-center py-3">
                <i className="bi bi-flag text-muted" style={{ fontSize: '2rem' }}></i>
                <p className="text-muted mt-2 mb-0">No drills confirmed yet</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {(showAllDrills ? confirmedDrills : confirmedDrills.slice(0, 2)).map((drill, index) => (
                  <div key={index} className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-success-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-flag text-success"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">{drill.title}</h6>
                        <p className="mb-2 text-muted small">{drill.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {formatDate(drill.scheduledDate)}
                            <span className="mx-2">•</span>
                            <i className="bi bi-clock me-1"></i>
                            {formatTime(drill.scheduledTime)}
                            <span className="mx-2">•</span>
                            <i className="bi bi-geo-alt me-1"></i>
                            {drill.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {confirmedDrills.length > 2 && (
                  <div className="text-center mt-3">
                    <button 
                      className="btn btn-outline-success btn-sm"
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
                          Show More ({confirmedDrills.length - 2} more)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignments Section */}
      <div className="col-12 col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-header bg-info text-white">
            <h6 className="card-title mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-clipboard"></i>
              Assignments
            </h6>
          </div>
          <div className="card-body">
            {assignments.length === 0 ? (
              <div className="text-center py-3">
                <i className="bi bi-clipboard text-muted" style={{ fontSize: '2rem' }}></i>
                <p className="text-muted mt-2 mb-0">No assignments yet</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {(showAllAssignments ? assignments : assignments.slice(0, 2)).map((assignment, index) => (
                  <div key={assignment._id || index} className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-info-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-clipboard text-info"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">{assignment.title}</h6>
                        {assignment.description && (
                          <p className="mb-2 text-muted small">{assignment.description}</p>
                        )}
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small text-muted">
                            <i className="bi bi-people me-1"></i>
                            {assignment.classId}
                            <span className="mx-2">•</span>
                            <i className="bi bi-calendar me-1"></i>
                            {formatDate(assignment.dueDate)}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {assignment.pdfFile && (
                              <a 
                                href={`http://localhost:5000${assignment.pdfFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="bi bi-file-pdf me-1"></i>PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {assignments.length > 2 && (
                  <div className="text-center mt-3">
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => setShowAllAssignments(!showAllAssignments)}
                    >
                      {showAllAssignments ? (
                        <>
                          <i className="bi bi-chevron-up me-1"></i>
                          Show Less
                        </>
                      ) : (
                        <>
                          <i className="bi bi-chevron-down me-1"></i>
                          Show More ({assignments.length - 2} more)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentNotifications;