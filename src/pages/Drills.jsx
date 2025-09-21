import React, { useEffect, useMemo, useState, useRef } from 'react';
import PointsService from '../services/PointsService';
import VideoProgressTracker from '../components/VideoProgressTracker';
import { API_ENDPOINTS } from '../config/api';

const SCENARIOS = [
  { id: 'drill-eq', title: 'Earthquake Classroom Drill', steps: ['Drop, Cover, Hold', 'Move to assembly point', 'Headcount & report'] },
  { id: 'drill-fire', title: 'Fire Safety Evacuation Drill', steps: ['Raise alarm', 'Use nearest exit', 'Do not use elevators'] },
  { id: 'drill-flood', title: 'Flood Safety Evacuation Drill', steps: ['Move to higher ground', 'Avoid waterlogged areas', 'Switch off mains'] },
  { id: 'drill-cyclone', title: 'Cyclone Evacuation Drill', steps: ['Secure windows and doors', 'Move to designated safe area', 'Stay away from windows'] },
  { id: 'drill-landslide', title: 'Landslide Evacuation Drill', steps: ['Move to higher ground immediately', 'Avoid steep slopes', 'Stay alert for debris flow'] }
];

// Drill Video Player Component with Progress Tracking
function DrillVideoPlayer({ active, selected, onVideoEnd, onProgressUpdate, onPointsUpdate }) {
  const [progress, setProgress] = useState(0);
  const [awardedPoints, setAwardedPoints] = useState([]);
  const videoRef = useRef(null);

  const getVideoSource = () => {
    switch (active) {
      case 'drill-eq':
        return '/Videos/Classroom Drill/Earthquake Drill.mp4';
      case 'drill-fire':
        return '/Videos/Classroom Drill/Fire safety evacuation.mp4';
      case 'drill-flood':
        return '/Videos/Classroom Drill/Flood safety evacuation.mp4';
      case 'drill-cyclone':
        return '/Videos/Classroom Drill/Cyclone evacuation.mp4';
      case 'drill-landslide':
        return '/Videos/Classroom Drill/Landslide evacuation.mp4';
      default:
        return '';
    }
  };

  const getInstructionText = () => {
    switch (active) {
      case 'drill-eq':
        return 'Follow along with the video demonstration for proper earthquake drill procedures.';
      case 'drill-fire':
        return 'Follow along with the video demonstration for proper fire evacuation procedures.';
      case 'drill-flood':
        return 'Follow along with the video demonstration for proper flood safety procedures.';
      case 'drill-cyclone':
        return 'Follow along with the video demonstration for proper cyclone evacuation procedures.';
      case 'drill-landslide':
        return 'Follow along with the video demonstration for proper landslide evacuation procedures.';
      default:
        return '';
    }
  };

  const checkProgress = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      if (duration > 0) {
        const percentage = Math.round((currentTime / duration) * 100);
        setProgress(percentage);
        
        // Check if we've reached a milestone
        checkMilestone(percentage);
        
        if (onProgressUpdate) {
          onProgressUpdate(percentage);
        }
      }
    }
  };

  const checkMilestone = async (percentage) => {
    // Only award 100 points when video is 100% complete
    if (percentage >= 100 && !awardedPoints.includes(100)) {
      try {
        const userId = PointsService.getCurrentUserId();
        const videoId = PointsService.generateDrillVideoId(active, selected?.title);
        
        const response = await PointsService.awardPoints(
          userId, 
          videoId, 
          'drill', 
          100
        );
        
        setAwardedPoints(prev => [...prev, 100]);
        
        if (response.updated) {
          console.log(`🔄 Drill video completed! Updated points: +${response.awardedPoints} points`);
        } else {
          console.log(`🎉 Drill video completed! Awarded ${response.awardedPoints} points`);
        }
        
        // Update drill points for progress bar
        if (onPointsUpdate) {
          onPointsUpdate(active, response.awardedPoints);
        }
      } catch (error) {
        console.error('Failed to award drill completion points:', error);
      }
    }
  };

  const handleTimeUpdate = () => {
    checkProgress();
  };

  const handleLoadedMetadata = () => {
    checkProgress();
  };

  const handleEnded = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div className="mt-3 mb-3">
      <div className="ratio ratio-16x9">
        <video 
          ref={videoRef}
          key={active} // Force re-render when drill changes
          controls 
          autoPlay 
          className="rounded"
          style={{ maxHeight: '400px' }}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={getVideoSource()} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="alert alert-info mt-2 d-flex align-items-center gap-2">
        <i className="bi bi-info-circle"></i>
        <span>{getInstructionText()}</span>
      </div>
    </div>
  );
}

function Drills() {
  const [active, setActive] = useState('drill-eq');
  const [running, setRunning] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [drillPoints, setDrillPoints] = useState({});
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'teacher'
  const [adminDrills, setAdminDrills] = useState([]);
  const [teacherDrills, setTeacherDrills] = useState([]);
  const [selectedTeacherDrill, setSelectedTeacherDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const selected = useMemo(() => SCENARIOS.find((s) => s.id === active), [active]);


  // Load drill points for progress calculation
  const loadDrillPoints = async () => {
    const userId = PointsService.getCurrentUserId();
    
    for (const scenario of SCENARIOS) {
      try {
        const videoId = PointsService.generateDrillVideoId(scenario.id, scenario.title);
        const pointsData = await PointsService.getVideoPoints(userId, videoId);
        setDrillPoints(prev => ({
          ...prev,
          [scenario.id]: pointsData.points
        }));
      } catch (error) {
        console.error(`Failed to load points for drill ${scenario.id}:`, error);
      }
    }
  };

  // Load admin-created drills (empty for now - can be used for admin-specific drills)
  const loadAdminDrills = async () => {
    try {
      // For now, admin drills will be empty
      setAdminDrills([]);
    } catch (error) {
      console.error('Failed to load admin drills:', error);
    }
  };

  // Load teacher-created drills (drill announcements + confirmed drills)
  const loadTeacherDrills = async () => {
    try {
      // Load drill announcements (these are created by teachers/admins)
      const drillResponse = await fetch(`${API_ENDPOINTS.DRILLS}`);
      const drillData = await drillResponse.json();
      
      // Load confirmed drills
      const confirmedResponse = await fetch(`${API_ENDPOINTS.TEACHER_ACTIONS}/confirmed-drills`);
      const confirmedData = await confirmedResponse.json();
      
      const drillAnnouncements = drillData.success ? (drillData.data.announcements || []) : [];
      const confirmedDrills = confirmedData.success ? (confirmedData.data.drills || []) : [];
      
      // Combine both types of teacher drills
      setTeacherDrills([...drillAnnouncements, ...confirmedDrills]);
    } catch (error) {
      console.error('Failed to load teacher drills:', error);
    }
  };

  // Load all drill data
  const loadAllDrills = async () => {
    setLoading(true);
    await Promise.all([
      loadAdminDrills(),
      loadTeacherDrills(),
      loadDrillPoints()
    ]);
    setLoading(false);
  };

  // Load points on component mount
  useEffect(() => {
    loadAllDrills();
  }, []);

  const start = () => { 
    setRunning(true); 
    // Show video for all drill types
    setShowVideo(true);
  };
  const stop = () => { 
    setRunning(false); 
    setShowVideo(false);
  };

  // Switch drill type and reset video
  const switchDrill = (drillId) => {
    setActive(drillId);
    // Stop current drill and reset when switching
    setRunning(false);
    setShowVideo(false);
  };

  const handleVideoEnd = () => {
    // Auto-stop the drill when video ends
    setRunning(false);
    setShowVideo(false);
  };

  const handleProgressUpdate = (percentage) => {
    // Progress tracking is handled by VideoProgressTracker component
    console.log(`Video progress: ${percentage}%`);
  };

  const handlePointsUpdate = (drillId, points) => {
    setDrillPoints(prev => ({
      ...prev,
      [drillId]: (prev[drillId] || 0) + points
    }));
  };

  // Helper functions
  const getDrillTypeIcon = (type) => {
    const icons = {
      fire: '🔥',
      earthquake: '🌍',
      flood: '🌊',
      cyclone: '🌀',
      landslide: '🏔️',
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get current drills based on active tab
  const getCurrentDrills = () => {
    return activeTab === 'admin' ? adminDrills : teacherDrills;
  };

  // Handle teacher drill selection
  const handleTeacherDrillSelect = (drill) => {
    setSelectedTeacherDrill(drill);
    // Reset practice drill states when selecting teacher drill
    setActive('');
    setRunning(false);
    setShowVideo(false);
  };

  // Handle tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    // Reset states when switching tabs
    if (tab === 'admin') {
      setSelectedTeacherDrill(null);
    } else {
      setActive('');
      setRunning(false);
      setShowVideo(false);
    }
  };

  return (
    <div>
      {/* Custom CSS for fixing UI glitches */}
      <style>
        {`
          .list-group-item-action {
            transition: all 0.2s ease-in-out;
          }
          .list-group-item-action:hover {
            background-color: #e3f2fd;
            border-color: #bbdefb;
          }
          .list-group-item-action:focus {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
            outline: none;
          }
          .list-group-item-action.active {
            background-color: #2196f3 !important;
            border-color: #1976d2 !important;
            color: white !important;
          }
          .list-group-item-action.active:hover {
            background-color: #1976d2 !important;
            border-color: #1565c0 !important;
            color: white !important;
          }
          .list-group-item-action.active:focus {
            background-color: #1976d2 !important;
            border-color: #1565c0 !important;
            color: white !important;
          }
          .nav-tabs .nav-link {
            transition: all 0.2s ease-in-out;
          }
          .nav-tabs .nav-link:hover {
            border-color: #e9ecef #e9ecef #dee2e6;
          }
          .nav-tabs .nav-link.active {
            color: #495057;
            background-color: #fff;
            border-color: #dee2e6 #dee2e6 #fff;
          }
        `}
      </style>
      
      {/* Tab Navigation */}
      <div className="mb-4">
        <ul className="nav nav-tabs" id="drillTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('admin')}
              type="button"
            >
              <i className="bi bi-shield-check me-2"></i>
              Practice Drills
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'teacher' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('teacher')}
              type="button"
            >
              <i className="bi bi-person-check me-2"></i>
              Teacher Drills ({teacherDrills.length})
            </button>
          </li>
        </ul>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          {/* Content based on active tab */}
          {activeTab === 'admin' ? (
            /* Practice Drills Section */
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-play-circle me-2"></i>
                  Practice Drills
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {SCENARIOS.map((s) => (
                    <button 
                      key={s.id} 
                      type="button"
                      className={`list-group-item list-group-item-action d-flex align-items-center ${active === s.id ? 'active' : ''}`} 
                      onClick={() => switchDrill(s.id)}
                      style={{ border: 'none', textAlign: 'left' }}
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      <span className="fw-medium">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Teacher Drills Section */
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Teacher Created Drills
                </h6>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : teacherDrills.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-calendar-x fs-4"></i>
                    <p className="mt-2 mb-0">No teacher drills available</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {teacherDrills.map((drill, index) => (
                      <button 
                        key={drill._id || index} 
                        type="button"
                        className={`list-group-item list-group-item-action ${selectedTeacherDrill?._id === drill._id ? 'active' : ''}`}
                        onClick={() => handleTeacherDrillSelect(drill)}
                        style={{ border: 'none', textAlign: 'left' }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-flag text-primary"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold">{drill.title}</h6>
                            <p className="text-muted small mb-2">{drill.message || drill.description}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="small text-muted">
                                <i className="bi bi-person me-1"></i>
                                {drill.teacherName || 'Admin'}
                                <span className="mx-2">•</span>
                                <i className="bi bi-clock me-1"></i>
                                {formatDate(drill.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="alert alert-info mt-3 d-flex align-items-start gap-2">
            <i className="bi bi-vr"></i>
            <span>Use VR assets here for immersive practice.</span>
          </div>
        </div>
        <div className="col-12 col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              {activeTab === 'admin' ? (
                /* Practice Drills Content */
                <>
                  <h4 className="card-title d-flex align-items-center gap-2">
                    <i className="bi bi-joystick text-success"></i>
                    {selected?.title || 'Select a Practice Drill'}
                  </h4>
                  
                  {selected ? (
                    <>
                      {/* Video Players for Different Drill Types */}
                      {showVideo && (
                        <DrillVideoPlayer 
                          active={active}
                          selected={selected}
                          onVideoEnd={handleVideoEnd}
                          onProgressUpdate={handleProgressUpdate}
                          onPointsUpdate={handlePointsUpdate}
                        />
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Progress</span>
                          <span className="text-muted small">{drillPoints[active] || 0} / 100 points</span>
                        </div>
                        <div className="progress" role="progressbar" aria-label="drill progress" aria-valuenow={drillPoints[active] || 0} aria-valuemin="0" aria-valuemax="100">
                          <div className="progress-bar bg-success" style={{ width: `${Math.min((drillPoints[active] || 0), 100)}%` }}>
                            {drillPoints[active] ? `${drillPoints[active]} pts` : '0 pts'}
                          </div>
                        </div>
                      </div>
                      
                      <ol className="mt-3">
                        {selected?.steps.map((st, idx) => (
                          <li key={idx} className="mb-2">{st}</li>
                        ))}
                      </ol>
                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-primary" onClick={start} disabled={running}><i className="bi bi-play-fill me-1"></i>Start</button>
                        <button className="btn btn-outline-secondary" onClick={stop} disabled={!running}><i className="bi bi-stop-circle me-1"></i>Stop</button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-arrow-left fs-1"></i>
                      <p className="mt-3">Select a practice drill from the left panel to get started</p>
                    </div>
                  )}
                </>
              ) : (
                /* Teacher Drills Content */
                <>
                  <h4 className="card-title d-flex align-items-center gap-2">
                    <i className="bi bi-person-check text-primary"></i>
                    {selectedTeacherDrill?.title || 'Select a Teacher Drill'}
                  </h4>
                  
                  {selectedTeacherDrill ? (
                    <>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                              <span style={{ fontSize: '1.5rem' }}>
                                {getDrillTypeIcon(selectedTeacherDrill.drillType)}
                              </span>
                            </div>
                            <div>
                              <h5 className="mb-1">{selectedTeacherDrill.title}</h5>
                              <p className="text-muted mb-0">
                                <i className="bi bi-person me-1"></i>
                                {selectedTeacherDrill.teacherName || 'Admin'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-end">
                            <p className="text-muted small mt-2 mb-0">
                              <i className="bi bi-clock me-1"></i>
                              {formatDate(selectedTeacherDrill.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h6 className="text-primary">Description</h6>
                        <p className="text-muted">{selectedTeacherDrill.message || selectedTeacherDrill.description || 'No description available.'}</p>
                      </div>
                      
                      {selectedTeacherDrill.targetClasses && (
                        <div className="mb-4">
                          <h6 className="text-primary">Target Classes</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {selectedTeacherDrill.targetClasses.map((targetClass, index) => (
                              <span key={index} className="badge bg-info">{targetClass}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedTeacherDrill.scheduledDate && (
                        <div className="mb-4">
                          <h6 className="text-primary">Scheduled Information</h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <p className="mb-1"><strong>Date:</strong> {selectedTeacherDrill.scheduledDate}</p>
                            </div>
                            <div className="col-md-6">
                              <p className="mb-1"><strong>Time:</strong> {selectedTeacherDrill.scheduledTime}</p>
                            </div>
                            {selectedTeacherDrill.location && (
                              <div className="col-12">
                                <p className="mb-1"><strong>Location:</strong> {selectedTeacherDrill.location}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        This drill was created by {selectedTeacherDrill.teacherName || 'Admin'} and is part of the school's emergency preparedness program.
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-arrow-left fs-1"></i>
                      <p className="mt-3">Select a teacher drill from the left panel to view details</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Drills;


