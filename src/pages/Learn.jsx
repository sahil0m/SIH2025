import React, { useMemo, useState, useRef, useEffect } from 'react';
import StudentModulesDisplay from '../components/StudentModulesDisplay';
import AssignmentService from '../services/AssignmentService';
import PointsService from '../services/PointsService';

const CATEGORIES = [
  { id: 'earthquake', name: 'Earthquake' },
  { id: 'flood', name: 'Flood' },
  { id: 'fire', name: 'Fire Safety' },
  { id: 'cyclone', name: 'Cyclone' },
  { id: 'landslide', name: 'Landslide' }
];

// Video mapping based on actual files in public/Videos folder
const VIDEO_MODULES = {
  earthquake: [
    { 
      id: 'eq-bend-cover-hold', 
      title: 'Bend Cover Hold', 
      videoPath: '/Videos/Earthquake/Bend Cover Hold.mp4',
      minutes: 4 
    },
    { 
      id: 'eq-dos-donts', 
      title: 'Earthquake - DOs & DONTs', 
      videoPath: '/Videos/Earthquake/Earthquake - DOs & DONTs.mp4',
      minutes: 5 
    },
    { 
      id: 'eq-outdoors-safety', 
      title: 'How to Stay Safe if outdoors during an earthquake', 
      videoPath: '/Videos/Earthquake/How to Stay Safe if outdoors during an earthquake.mp4',
      minutes: 6 
    }
  ],
  flood: [
    { 
      id: 'flood-dos-donts', 
      title: 'Dos and Donts to follow during a flood', 
      videoPath: '/Videos/Flood/Dos and Donts to follow during a flood.mp4',
      minutes: 5 
    },
    { 
      id: 'flood-secure-after', 
      title: 'Here are some ways by which you can secure yourself after a flood', 
      videoPath: '/Videos/Flood/Here are some ways by which you can secure yourself after a flood.mp4',
      minutes: 6 
    },
    { 
      id: 'flood-prepare-before', 
      title: 'Know how you can stay prepared before floods', 
      videoPath: '/Videos/Flood/Know how you can stay prepared before floods',
      minutes: 5 
    }
  ],
  fire: [
    { 
      id: 'fire-safety-kids', 
      title: 'Fire Safety for Kids', 
      videoPath: '/Videos/Fire Safety/Fire Safety for Kids.mp4',
      minutes: 4 
    },
    { 
      id: 'fire-tips-dos-donts', 
      title: 'Fire Tips - Do\'s and don\'ts & must haves', 
      videoPath: '/Videos/Fire Safety/Fire Tips - Do\'s and don\'ts & must haves.mp4',
      minutes: 5 
    }
  ],
  cyclone: [
    { 
      id: 'cyclone-early-warning', 
      title: 'Know where all you can get early warning information for cyclones', 
      videoPath: '/Videos/Cyclone/Know where all you can get early warning information for cyclones.mp4',
      minutes: 6 
    },
    { 
      id: 'cyclone-prepare', 
      title: 'Prepare yourself for a cyclone with these do\'s and don\'ts', 
      videoPath: '/Videos/Cyclone/Prepare yourself for a cyclone with these do\'s and don\'ts.mp4',
      minutes: 5 
    },
    { 
      id: 'cyclone-secure-house', 
      title: 'Secure your house from a cyclone with these methods', 
      videoPath: '/Videos/Cyclone/Secure your house from a cyclone with these methods.mp4',
      minutes: 6 
    }
  ],
  landslide: [
    { 
      id: 'landslide-prepare', 
      title: 'How to stay prepared for a landslide', 
      videoPath: '/Videos/Landslide/How to stay prepared for a landslide_.mp4',
      minutes: 5 
    },
    { 
      id: 'landslide-stay-safe', 
      title: 'How to stay safe during a landslide', 
      videoPath: '/Videos/Landslide/How to stay safe during a landslide_.mp4',
      minutes: 4 
    },
    { 
      id: 'landslide-reasons', 
      title: 'What are the reasons for a landslide', 
      videoPath: '/Videos/Landslide/What are the reasons for a landslide_.mp4',
      minutes: 5 
    }
  ]
};

// Region names for display
const REGION_NAMES = {
  // States
  'IN-AP': 'Andhra Pradesh',
  'IN-AR': 'Arunachal Pradesh',
  'IN-AS': 'Assam',
  'IN-BR': 'Bihar',
  'IN-CT': 'Chhattisgarh',
  'IN-GA': 'Goa',
  'IN-GJ': 'Gujarat',
  'IN-HR': 'Haryana',
  'IN-HP': 'Himachal Pradesh',
  'IN-JH': 'Jharkhand',
  'IN-KA': 'Karnataka',
  'IN-KL': 'Kerala',
  'IN-MP': 'Madhya Pradesh',
  'IN-MH': 'Maharashtra',
  'IN-MN': 'Manipur',
  'IN-ML': 'Meghalaya',
  'IN-MZ': 'Mizoram',
  'IN-NL': 'Nagaland',
  'IN-OR': 'Odisha',
  'IN-PB': 'Punjab',
  'IN-RJ': 'Rajasthan',
  'IN-SK': 'Sikkim',
  'IN-TN': 'Tamil Nadu',
  'IN-TG': 'Telangana',
  'IN-TR': 'Tripura',
  'IN-UP': 'Uttar Pradesh',
  'IN-UT': 'Uttarakhand',
  'IN-WB': 'West Bengal',
  
  // Union Territories
  'IN-AN': 'Andaman and Nicobar Islands',
  'IN-CH': 'Chandigarh',
  'IN-DH': 'Dadra and Nagar Haveli and Daman and Diu',
  'IN-DL': 'Delhi',
  'IN-JK': 'Jammu and Kashmir',
  'IN-LA': 'Ladakh',
  'IN-LD': 'Lakshadweep',
  'IN-PY': 'Puducherry'
};

// All Indian States and Union Territories with their disaster priorities
const REGION_PRIORITIES = {
  // States
  'IN-AP': ['cyclone', 'flood'], // Andhra Pradesh
  'IN-AR': ['flood', 'earthquake'], // Arunachal Pradesh
  'IN-AS': ['flood', 'earthquake'], // Assam
  'IN-BR': ['flood', 'earthquake'], // Bihar
  'IN-CT': ['flood', 'cyclone'], // Chhattisgarh
  'IN-GA': ['cyclone', 'flood'], // Goa
  'IN-GJ': ['cyclone', 'earthquake'], // Gujarat
  'IN-HR': ['earthquake', 'fire'], // Haryana
  'IN-HP': ['landslide', 'earthquake'], // Himachal Pradesh
  'IN-JH': ['flood', 'earthquake'], // Jharkhand
  'IN-KA': ['flood', 'cyclone'], // Karnataka
  'IN-KL': ['flood', 'cyclone'], // Kerala
  'IN-MP': ['flood', 'earthquake'], // Madhya Pradesh
  'IN-MH': ['cyclone', 'flood'], // Maharashtra
  'IN-MN': ['flood', 'earthquake'], // Manipur
  'IN-ML': ['flood', 'landslide'], // Meghalaya
  'IN-MZ': ['flood', 'landslide'], // Mizoram
  'IN-NL': ['flood', 'landslide'], // Nagaland
  'IN-OR': ['cyclone', 'flood'], // Odisha
  'IN-PB': ['earthquake', 'fire'], // Punjab
  'IN-RJ': ['earthquake', 'fire'], // Rajasthan
  'IN-SK': ['earthquake', 'landslide'], // Sikkim
  'IN-TN': ['cyclone', 'flood'], // Tamil Nadu
  'IN-TG': ['cyclone', 'flood'], // Telangana
  'IN-TR': ['flood', 'earthquake'], // Tripura
  'IN-UP': ['flood', 'earthquake'], // Uttar Pradesh
  'IN-UT': ['earthquake', 'landslide'], // Uttarakhand
  'IN-WB': ['cyclone', 'flood'], // West Bengal
  
  // Union Territories
  'IN-AN': ['cyclone', 'earthquake'], // Andaman and Nicobar Islands
  'IN-CH': ['earthquake', 'fire'], // Chandigarh
  'IN-DH': ['earthquake', 'fire'], // Dadra and Nagar Haveli and Daman and Diu
  'IN-DL': ['earthquake', 'fire'], // Delhi
  'IN-JK': ['earthquake', 'landslide'], // Jammu and Kashmir
  'IN-LA': ['earthquake', 'landslide'], // Ladakh
  'IN-LD': ['cyclone', 'flood'], // Lakshadweep
  'IN-PY': ['cyclone', 'flood'] // Puducherry
};

// Module Video Player Component with Progress Tracking
function ModuleVideoPlayer({ video, onVideoEnd, onVideoProgress }) {
  const [progress, setProgress] = useState(0);
  const [awardedPoints, setAwardedPoints] = useState([]);
  const videoRef = useRef(null);

  const checkProgress = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;
      
      if (duration > 0) {
        const percentage = Math.round((currentTime / duration) * 100);
        setProgress(percentage);
        
        // Check if we've reached a milestone
        checkMilestone(percentage);
        
        if (onVideoProgress) {
          onVideoProgress(video, percentage);
        }
      }
    }
  };

  const checkMilestone = async (percentage) => {
    const milestones = [25, 50, 75, 100];
    const reachedMilestone = milestones.find(milestone => 
      percentage >= milestone && !awardedPoints.includes(milestone)
    );

    if (reachedMilestone) {
      try {
        const userId = PointsService.getCurrentUserId();
        const videoId = PointsService.generateModuleVideoId(video.id.split('-')[0], video.title);
        
        const response = await PointsService.awardPoints(
          userId, 
          videoId, 
          'module', 
          reachedMilestone
        );
        
        setAwardedPoints(prev => [...prev, reachedMilestone]);
        
        if (response.updated) {
          console.log(`🔄 ${reachedMilestone}% milestone reached! Updated points: +${response.awardedPoints} points`);
        } else {
          console.log(`🎉 ${reachedMilestone}% milestone reached! Awarded ${response.awardedPoints} points`);
        }
      } catch (error) {
        console.error('Failed to award milestone points:', error);
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
      onVideoEnd(video);
    }
  };

  return (
    <div className="ratio ratio-16x9">
      <video 
        ref={videoRef}
        controls 
        className="rounded"
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={video.videoPath} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function Learn() {
  const [region, setRegion] = useState('IN-HP');
  const [progress, setProgress] = useState({});
  const [category, setCategory] = useState('earthquake');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('learning');
  const [videoPoints, setVideoPoints] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentPoints, setAssignmentPoints] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAllAssignments, setShowAllAssignments] = useState(false);
  const [completedAssignments, setCompletedAssignments] = useState(new Set());

  const recommended = useMemo(() => {
    // Get priority disasters for the selected region
    const priorityDisasters = REGION_PRIORITIES[region] || ['earthquake', 'fire'];
    
    // Get all videos for priority disasters
    const recommendedVideos = [];
    priorityDisasters.forEach(disaster => {
      if (VIDEO_MODULES[disaster]) {
        recommendedVideos.push(...VIDEO_MODULES[disaster]);
      }
    });
    
    return recommendedVideos;
  }, [region]);

  const visible = useMemo(() => VIDEO_MODULES[category] || [], [category]);

  // Load video points for progress calculation
  const loadVideoPoints = async () => {
    const userId = PointsService.getCurrentUserId();
    const allVideos = [...visible, ...recommended];
    
    for (const video of allVideos) {
      try {
        const videoId = PointsService.generateModuleVideoId(video.id.split('-')[0], video.title);
        const pointsData = await PointsService.getVideoPoints(userId, videoId);
        setVideoPoints(prev => ({
          ...prev,
          [video.id]: pointsData.points
        }));
      } catch (error) {
        console.error(`Failed to load points for video ${video.id}:`, error);
      }
    }
  };

  // Load points when category or region changes
  useEffect(() => {
    loadVideoPoints();
    loadAssignments();
  }, [category, region]);

  // Load assignments
  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const data = await AssignmentService.getAllAssignments();
      setAssignments(data);
      loadAssignmentPoints(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Load assignment points
  const loadAssignmentPoints = async (assignmentsData) => {
    try {
      const userId = PointsService.getCurrentUserId();
      const pointsPromises = assignmentsData.map(async (assignment) => {
        const videoId = PointsService.generateAssignmentId(assignment._id, assignment.title);
        const points = await PointsService.getVideoPoints(userId, videoId);
        return { assignmentId: assignment._id, points: points.points || 0 };
      });
      
      const pointsResults = await Promise.all(pointsPromises);
      const pointsMap = {};
      pointsResults.forEach(result => {
        pointsMap[result.assignmentId] = result.points;
      });
      
      setAssignmentPoints(pointsMap);
    } catch (error) {
      console.error('Failed to load assignment points:', error);
    }
  };


  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  // Helper functions for assignments (matching modules)
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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    return due <= threeDaysFromNow && due > now;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'bi-file-pdf';
    if (fileType.includes('video')) return 'bi-camera-video';
    if (fileType.includes('image')) return 'bi-image';
    return 'bi-file';
  };

  const getFileId = (assignmentId, fileType) => {
    return `${assignmentId}-${fileType}`;
  };

  const handleAssignmentFileClick = (fileUrl, fileType, assignment) => {
    setSelectedAssignment({
      ...assignment,
      currentFile: {
        url: `http://localhost:5000${fileUrl}`,
        originalName: 'Assignment PDF',
        size: 0,
        type: fileType
      },
      currentFileType: fileType
    });
  };

  const closeAssignmentModal = () => {
    setSelectedAssignment(null);
  };

  const handleMarkAssignmentCompleted = async (assignmentId, fileType) => {
    try {
      const assignment = assignments.find(a => a._id === assignmentId);
      if (!assignment) return;

      const userId = PointsService.getCurrentUserId();
      const videoId = PointsService.generateAssignmentId(assignmentId, assignment.title);
      
      // Award 50 points for assignment completion
      const response = await PointsService.awardPoints(
        userId, 
        videoId, 
        'assignment', 
        100, // 100% completion
        50   // 50 points for assignment completion
      );
      
      // Update local points state - set to 50 points
      setAssignmentPoints(prev => ({
        ...prev,
        [assignmentId]: 50
      }));

      // Mark as completed
      setCompletedAssignments(prev => new Set([...prev, getFileId(assignmentId, fileType)]));
      
      console.log('Assignment completed! Points awarded:', response);
      
    } catch (error) {
      console.error('Failed to complete assignment:', error);
    }
  };

  const handleVideoClose = () => {
    setSelectedVideo(null);
  };

  const handleVideoEnd = async (video) => {
    // Update progress to 100%
    setProgress((p) => ({ ...p, [video.id]: 100 }));
  };

  const handleVideoProgress = async (video, percentage) => {
    try {
      const userId = PointsService.getCurrentUserId();
      const videoId = PointsService.generateModuleVideoId(video.id.split('-')[0], video.title);
      
      // Award points for milestone completion
      const response = await PointsService.awardPoints(userId, videoId, 'module', percentage);
      
      if (response.awardedPoints > 0) {
        console.log(`🎉 ${percentage}% milestone reached! Awarded ${response.awardedPoints} points for ${video.title}`);
        
        // Update video points to refresh progress bar
        setVideoPoints(prev => ({
          ...prev,
          [video.id]: (prev[video.id] || 0) + response.awardedPoints
        }));
      }
    } catch (error) {
      console.error('Failed to award milestone points:', error);
    }
  };


  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-4">
        <ul className="nav nav-tabs" id="learnTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'learning' ? 'active' : ''}`}
              onClick={() => setActiveTab('learning')}
              type="button"
            >
              <i className="bi bi-mortarboard me-2"></i>
              Learning Modules
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveTab('assigned')}
              type="button"
            >
              <i className="bi bi-person-workspace me-2"></i>
              Modules Assigned by Teachers
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'learning' && (
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center gap-2"><i className="bi bi-geo-alt text-primary"></i>Your Region</h5>
                  <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                    <optgroup label="States">
                      <option value="IN-AP">Andhra Pradesh</option>
                      <option value="IN-AR">Arunachal Pradesh</option>
                      <option value="IN-AS">Assam</option>
                      <option value="IN-BR">Bihar</option>
                      <option value="IN-CT">Chhattisgarh</option>
                      <option value="IN-GA">Goa</option>
                      <option value="IN-GJ">Gujarat</option>
                      <option value="IN-HR">Haryana</option>
                      <option value="IN-HP">Himachal Pradesh</option>
                      <option value="IN-JH">Jharkhand</option>
                      <option value="IN-KA">Karnataka</option>
                      <option value="IN-KL">Kerala</option>
                      <option value="IN-MP">Madhya Pradesh</option>
                      <option value="IN-MH">Maharashtra</option>
                      <option value="IN-MN">Manipur</option>
                      <option value="IN-ML">Meghalaya</option>
                      <option value="IN-MZ">Mizoram</option>
                      <option value="IN-NL">Nagaland</option>
                      <option value="IN-OR">Odisha</option>
                      <option value="IN-PB">Punjab</option>
                      <option value="IN-RJ">Rajasthan</option>
                      <option value="IN-SK">Sikkim</option>
                      <option value="IN-TN">Tamil Nadu</option>
                      <option value="IN-TG">Telangana</option>
                      <option value="IN-TR">Tripura</option>
                      <option value="IN-UP">Uttar Pradesh</option>
                      <option value="IN-UT">Uttarakhand</option>
                      <option value="IN-WB">West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option value="IN-AN">Andaman and Nicobar Islands</option>
                      <option value="IN-CH">Chandigarh</option>
                      <option value="IN-DH">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="IN-DL">Delhi</option>
                      <option value="IN-JK">Jammu and Kashmir</option>
                      <option value="IN-LA">Ladakh</option>
                      <option value="IN-LD">Lakshadweep</option>
                      <option value="IN-PY">Puducherry</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="card mt-3 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center gap-2"><i className="bi bi-stars text-warning"></i>Recommended Courses</h5>
                  <p className="text-muted small mb-2">Based on {REGION_NAMES[region]}'s disaster risk profile</p>
                  <div className="mb-3">
                    <small className="text-muted">Primary risks: </small>
                    {REGION_PRIORITIES[region]?.map((risk, index) => (
                      <span key={risk}>
                        <span className="badge bg-danger-subtle text-danger me-1">{risk.charAt(0).toUpperCase() + risk.slice(1)}</span>
                        {index < REGION_PRIORITIES[region].length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  <ul className="list-group">
                    {recommended.map((video) => (
                      <li 
                        key={video.id} 
                        className="list-group-item d-flex justify-content-between align-items-center cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleVideoSelect(video)}
                      >
                        <div>
                          <div className="fw-medium">{video.title}</div>
                          <small className="text-muted text-capitalize">{video.id.split('-')[0]}</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-play-circle text-primary"></i>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-8">
              <div className="d-flex align-items-center justify-content-between mb-2 p-3 rounded-4 border bg-white shadow-sm">
                <h4 className="mb-0 d-flex align-items-center gap-2"><i className="bi bi-mortarboard text-primary"></i>Modules</h4>
                <select className="form-select w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="row g-3">
                {visible.map((video) => (
                  <div key={video.id} className="col-12 col-lg-6">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title">{video.title}</h5>
                        <p className="card-text">Educational video with practical safety information.</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small">{video.minutes} minutes</span>
                          <button 
                            className="btn btn-outline-primary btn-sm" 
                            onClick={() => handleVideoSelect(video)}
                          >
                            <i className="bi bi-play-fill me-1"></i>Watch Video
                          </button>
                        </div>
                        <div className="progress mt-3" role="progressbar" aria-label="module progress" aria-valuenow={videoPoints[video.id] || 0} aria-valuemin="0" aria-valuemax="100">
                          <div className="progress-bar" style={{ width: `${Math.min((videoPoints[video.id] || 0), 100)}%` }}>
                            {videoPoints[video.id] ? `${videoPoints[video.id]} pts` : '0 pts'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Modal */}
              {selectedVideo && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{selectedVideo.title}</h5>
                        <button 
                          type="button" 
                          className="btn-close" 
                          onClick={handleVideoClose}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <ModuleVideoPlayer 
                          video={selectedVideo}
                          onVideoEnd={handleVideoEnd}
                          onVideoProgress={handleVideoProgress}
                        />
                      </div>
                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={handleVideoClose}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assigned' && (
          <div>
            <StudentModulesDisplay />
            
            {/* Assignments Section */}
            <div className="mt-4">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-clipboard"></i>
                    Assignments
                  </h5>
                </div>
                <div className="card-body">
                  {loadingAssignments ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2">Loading assignments...</p>
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '3rem' }}></i>
                        <h5 className="mt-3 text-muted">No assignments available</h5>
                        <p className="text-muted">Your teachers will assign tasks with PDFs here.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {(showAllAssignments ? assignments : assignments.slice(0, 2)).filter(assignment => assignment && assignment.title).map((assignment, index) => (
                        <div key={assignment._id || index} className="col-12 col-lg-6">
                          <div className={`card h-100 ${isOverdue(assignment.dueDate) ? 'border-danger' : isDueSoon(assignment.dueDate) ? 'border-warning' : 'border-primary'}`}>
                            <div className="card-header bg-light">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6 className="card-title mb-0 fw-semibold">{assignment.title}</h6>
                                <div className="d-flex gap-1">
                                  {isOverdue(assignment.dueDate) ? (
                                    <span className="badge bg-danger">Overdue</span>
                                  ) : isDueSoon(assignment.dueDate) ? (
                                    <span className="badge bg-warning">Due Soon</span>
                                  ) : (
                                    <span className="badge bg-success">Active</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="card-body">
                              <p className="card-text text-muted small mb-3">{assignment.description || 'No description available'}</p>
                              
                              {/* Assignment Details */}
                              <div className="row g-2 mb-3">
                                <div className="col-6">
                                  <small className="text-muted d-block">Due Date</small>
                                  <span className="fw-semibold">{assignment.dueDate ? formatDate(assignment.dueDate) : 'Not specified'}</span>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted d-block">Class</small>
                                  <span className="fw-semibold">{assignment.classId || 'Not specified'}</span>
                                </div>
                              </div>

                              {/* PDF File Section */}
                              {assignment.pdfFile && (
                                <div className="mb-3">
                                  <h6 className="small fw-semibold text-muted mb-2">Attached Files</h6>
                                  <div className="d-flex flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2 p-2 bg-danger-subtle rounded">
                                      <i className="bi bi-file-pdf text-danger"></i>
                                      <div>
                                        <div className="small fw-semibold">Assignment PDF</div>
                                        <div className="small text-muted">PDF Document</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="text-muted small">Progress</span>
                                  <span className="text-muted small">{assignmentPoints[assignment._id] || 0} / 50 points</span>
                                </div>
                                <div className="progress" role="progressbar" aria-label="assignment progress" aria-valuenow={assignmentPoints[assignment._id] || 0} aria-valuemin="0" aria-valuemax="50">
                                  <div className="progress-bar bg-primary" style={{ width: `${Math.min(((assignmentPoints[assignment._id] || 0) / 50) * 100, 100)}%` }}>
                                    {assignmentPoints[assignment._id] ? `${assignmentPoints[assignment._id]} pts` : '0 pts'}
                                  </div>
                                </div>
                              </div>

                              {/* Teacher Info */}
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="small text-muted">
                                  <i className="bi bi-person me-1"></i>
                                  Assigned by {assignment.teacherName || 'Unknown Teacher'}
                                </div>
                                <div className="d-flex gap-2">
                                  {/* PDF Access Button */}
                                  {assignment.pdfFile && (
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleAssignmentFileClick(assignment.pdfFile, 'pdf', assignment)}
                                    >
                                      <i className="bi bi-file-pdf me-1"></i>
                                      View PDF
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedAssignment(assignment)}
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
                      {assignments.length > 2 && (
                        <div className="col-12 text-center mt-3">
                          <button 
                            className="btn btn-outline-primary btn-sm"
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
        )}
      </div>

      {/* Assignment Details Modal */}
      {selectedAssignment && !selectedAssignment.currentFile && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" onClick={closeAssignmentModal}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-clipboard text-primary"></i>
                  {selectedAssignment.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAssignmentModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Assignment Description */}
                <div className="mb-4">
                  <h6>Description</h6>
                  <p className="text-muted">{selectedAssignment.description || 'No description available'}</p>
                </div>

                {/* Assignment Details */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <h6>Due Date</h6>
                    <p className="text-muted">{formatDate(selectedAssignment.dueDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Class</h6>
                    <p className="text-muted">{selectedAssignment.classId || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Instructions</h6>
                    <p className="text-muted">{selectedAssignment.instructions || 'No instructions provided'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Teacher</h6>
                    <p className="text-muted">{selectedAssignment.teacherName || 'Unknown Teacher'}</p>
                  </div>
                </div>

                {/* PDF File Section */}
                {selectedAssignment.pdfFile && (
                  <div className="mb-4">
                    <h6>Attached Files</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="card border-danger">
                          <div className="card-body text-center">
                            <i className="bi bi-file-pdf text-danger" style={{ fontSize: '2rem' }}></i>
                            <h6 className="mt-2">Assignment PDF</h6>
                            <p className="text-muted small">PDF Document</p>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleAssignmentFileClick(selectedAssignment.pdfFile, 'pdf', selectedAssignment)}
                            >
                              <i className="bi bi-file-pdf me-1"></i>
                              View PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAssignmentModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment PDF Viewer Modal */}
      {selectedAssignment && selectedAssignment.currentFile && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" onClick={closeAssignmentModal}>
          <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-clipboard text-primary"></i>
                  {selectedAssignment.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAssignmentModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* PDF Content */}
                <div className="ratio ratio-16x9">
                  <iframe 
                    src={selectedAssignment.currentFile.url || ''} 
                    className="rounded"
                    title={selectedAssignment.currentFile.originalName || 'PDF Document'}
                  ></iframe>
                </div>

                {/* File Info */}
                <div className="mt-3">
                  <h6>File Details</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>File Name:</strong> {selectedAssignment.currentFile.originalName || 'Unknown'}
                    </div>
                    <div className="col-md-6">
                      <strong>File Size:</strong> {formatFileSize(selectedAssignment.currentFile.size || 0)}
                    </div>
                    <div className="col-md-6">
                      <strong>File Type:</strong> {selectedAssignment.currentFileType?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    <div className="col-md-6">
                      <strong>Assignment:</strong> {selectedAssignment.title || 'Unknown Assignment'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <div>
                    {completedAssignments.has(getFileId(selectedAssignment._id, selectedAssignment.currentFileType)) ? (
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Assignment Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAssignmentCompleted(selectedAssignment._id, selectedAssignment.currentFileType)}
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Mark as Completed
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeAssignmentModal}
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

export default Learn;