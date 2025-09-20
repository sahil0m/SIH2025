import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import PointsDisplay from './PointsDisplay';
import { useEffect, useState } from 'react';
import { getCurrentUser, logout, onAuthChange } from '../services/AuthService';

function AppNav() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set initial user state
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Listen for auth changes
    const unsubscribe = onAuthChange((user) => {
      console.log('Auth state changed:', user); // Debug log
      setUser(user);
    });
    
    return unsubscribe;
  }, []);
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <i className="bi bi-shield-fill-exclamation text-danger"></i>
          <span>D-Prep</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {(!user || user.role === 'student') && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/learn"><i className="bi bi-mortarboard me-1"></i>Learn</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/alerts"><i className="bi bi-broadcast me-1"></i>Alerts</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/drills"><i className="bi bi-joystick me-1"></i>Drills</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/simulation"><i className="bi bi-controller me-1"></i>Simulation</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/leaderboard"><i className="bi bi-trophy me-1"></i>Leaderboard</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/emergency"><i className="bi bi-telephone me-1"></i>Emergency</NavLink></li>
              </>
            )}
            {user?.role === 'teacher' && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/teacher"><i className="bi bi-speedometer2 me-1"></i>Dashboard</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/alerts"><i className="bi bi-broadcast me-1"></i>Alerts</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/drills"><i className="bi bi-flag me-1"></i>Drills</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/simulation"><i className="bi bi-controller me-1"></i>Simulation</NavLink></li>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/admin"><i className="bi bi-speedometer2 me-1"></i>Dashboard</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/alerts"><i className="bi bi-broadcast me-1"></i>Alerts</NavLink></li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user && (user.role === 'student' || !user.role) && (
              <PointsDisplay />
            )}
            {user ? (
              <>
                <span className="small text-muted">{user.name} · {user.role}</span>
                <button className="btn btn-outline-danger btn-sm" onClick={() => { logout(); navigate('/login', { replace: true }); }}><i className="bi bi-box-arrow-right me-1"></i>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-outline-primary btn-sm">Login</NavLink>
                <NavLink to="/signup" className="btn btn-primary btn-sm">Sign up</NavLink>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AppNav;


