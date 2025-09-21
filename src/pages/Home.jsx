import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementsDisplay from '../components/AnnouncementsDisplay';
import StudentNotifications from '../components/StudentNotifications';
import StatisticsService from '../services/StatisticsService';

function Home() {
  const [userStats, setUserStats] = useState({
    modulesCompleted: 0,
    drillsCompleted: 0,
    totalPoints: 0,
    preparednessScore: 0
  });
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 0,
    totalModulesCompleted: 0,
    totalDrillsCompleted: 0,
    averagePreparedness: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const userId = StatisticsService.getCurrentUserId();
      
      // Load user statistics and platform statistics in parallel
      const [userData, platformData] = await Promise.all([
        StatisticsService.getUserStatistics(userId),
        StatisticsService.getPlatformStatistics()
      ]);
      
      setUserStats(userData);
      setPlatformStats(platformData);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      <div className="p-4 p-md-5 mb-4 rounded-4 border position-relative overflow-hidden main-hero-card">
        <div className="position-absolute top-0 end-0 opacity-25" style={{ transform: 'translate(20%, -20%)' }}>
          <i className="bi bi-radar hero-icon"></i>
        </div>
        <div className="container-fluid py-3 position-relative">
          <div className="d-flex align-items-center gap-3 mb-2">
            <i className="bi bi-shield-fill-exclamation text-danger" style={{ fontSize: 32 }}></i>
            <h1 className="display-6 fw-semibold mb-0 hero-title">Disaster Preparedness & Response Education</h1>
          </div>
          <p className="col-md-10 fs-5 hero-description">Interactive modules, region-specific alerts, virtual drills, and gamified learning to build disaster-ready campuses.</p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/learn"><i className="bi bi-play-fill me-1"></i>Start Learning</Link>
            <Link className="btn btn-outline-secondary" to="/alerts"><i className="bi bi-broadcast me-1"></i>View Alerts</Link>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center p-3 rounded-4 border bg-white shadow-sm">
            {loading ? (
              // Loading state
              <>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people text-primary"></i>
                  <span className="small text-muted">Students onboarded</span>
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-film text-danger"></i>
                  <span className="small text-muted">Modules completed</span>
                  <div className="spinner-border spinner-border-sm text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-flag text-success"></i>
                  <span className="small text-muted">Drill recorded</span>
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-warning"></i>
                  <span className="small text-muted">Avg preparedness</span>
                  <div className="spinner-border spinner-border-sm text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </>
            ) : (
              // Data loaded
              <>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people text-primary"></i>
                  <span className="small text-muted">Students onboarded</span>
                  <span className="fw-semibold">{(platformStats?.totalStudents || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-film text-danger"></i>
                  <span className="small text-muted">Modules completed</span>
                  <span className="fw-semibold">{(userStats?.modulesCompleted || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-flag text-success"></i>
                  <span className="small text-muted">Drill recorded</span>
                  <span className="fw-semibold">{(userStats?.drillsCompleted || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-warning"></i>
                  <span className="small text-muted">Avg preparedness</span>
                  <span className="fw-semibold">{userStats?.preparednessScore || 0}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <Link to="/learn" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body d-flex align-items-start gap-3">
                <i className="bi bi-mortarboard fs-2 text-primary"></i>
                <div>
                  <div className="fw-semibold">Interactive Learning</div>
                  <div className="text-muted small">Bite-sized videos and quizzes.</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <Link to="/alerts" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body d-flex align-items-start gap-3">
                <i className="bi bi-broadcast fs-2 text-danger"></i>
                <div>
                  <div className="fw-semibold">Region Alerts</div>
                  <div className="text-muted small">Stay updated and prepared.</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <Link to="/drills" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body d-flex align-items-start gap-3">
                <i className="bi bi-joystick fs-2 text-success"></i>
                <div>
                  <div className="fw-semibold">Virtual Drills</div>
                  <div className="text-muted small">Practice safely with simulations.</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <Link to="/simulation" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body d-flex align-items-start gap-3">
                <i className="bi bi-controller fs-2 text-info"></i>
                <div>
                  <div className="fw-semibold">Disaster Simulation</div>
                  <div className="text-muted small">Interactive VR-style training.</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Teacher Actions Display */}
      <div className="mb-4">
        <StudentNotifications />
      </div>

      {/* Announcements Display */}
      <div className="mb-4">
        <AnnouncementsDisplay userRole="student" />
      </div>
    </div>
  );
}

export default Home;