import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

function AppFooter() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    setMessage('');

    try {
      console.log('Attempting to subscribe email:', email);
      console.log('Making request to:', `${API_ENDPOINTS.MAILING}/subscribe`);
      
      const response = await fetch(`${API_ENDPOINTS.MAILING}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setMessage(data.message);
        setEmail(''); // Clear the input
      } else {
        setMessage(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      console.error('Error details:', error.message);
      setMessage(`Failed to subscribe: ${error.message}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="border-top bg-white mt-5 pt-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-shield-fill-exclamation text-danger"></i>
              <span className="fw-semibold">D-Prep</span>
            </div>
            <div className="text-muted small">Preparedness for Indian schools and colleges — interactive learning, region alerts, and virtual drills to build resilient campuses.</div>
            <div className="d-flex gap-2 mt-3">
              <span className="badge bg-primary-subtle text-primary border">Education</span>
              <span className="badge bg-danger-subtle text-danger border">Emergency</span>
              <span className="badge bg-success-subtle text-success border">Readiness</span>
            </div>
          </div>
          <div className="col-6 col-lg-2">
            <div className="fw-semibold mb-2 small text-uppercase text-muted">Solutions</div>
            <ul className="list-unstyled small m-0 d-grid gap-1">
              <li><a href="/learn" className="text-decoration-none text-muted">Interactive Modules</a></li>
              <li><a href="/drills" className="text-decoration-none text-muted">Virtual Drills</a></li>
              <li><a href="/alerts" className="text-decoration-none text-muted">Region Alerts</a></li>
              <li><a href="/leaderboard" className="text-decoration-none text-muted">Gamified Leaderboard</a></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <div className="fw-semibold mb-2 small text-uppercase text-muted">Stakeholders</div>
            <ul className="list-unstyled small m-0 d-grid gap-1">
              <li><span className="text-muted">Students</span></li>
              <li><span className="text-muted">Teachers & Staff</span></li>
              <li><span className="text-muted">Administrators</span></li>
              <li><span className="text-muted">Parents & Responders</span></li>
            </ul>
          </div>
          <div className="col-12 col-lg-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="fw-semibold mb-2 small text-uppercase text-muted">Emergency Tools</div>
                <ul className="list-unstyled small m-0 d-grid gap-1">
                  <li><a href="/emergency" className="text-decoration-none text-muted">SOS & Contacts</a></li>
                  <li><a href="/alerts" className="text-decoration-none text-muted">Live Alerts</a></li>
                  <li><a href="/drills" className="text-decoration-none text-muted">Drill Planner</a></li>
                </ul>
              </div>
              <div className="col-12 col-md-6">
                <div className="fw-semibold mb-2 small text-uppercase text-muted">Compliance</div>
                <ul className="list-unstyled small m-0 d-grid gap-1">
                  <li><a href="#" className="text-decoration-none text-muted">NDMA Guidelines</a></li>
                  <li><a href="#" className="text-decoration-none text-muted">UNDRR for Education</a></li>
                  <li><a href="#" className="text-decoration-none text-muted">Safety Policies</a></li>
                </ul>
              </div>
            </div>
            <form className="mt-3 d-flex gap-2" onSubmit={handleSubscribe}>
              <input 
                className="form-control form-control-sm" 
                placeholder="Subscribe for updates" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                required
              />
              <button 
                className="btn btn-primary btn-sm" 
                type="submit"
                disabled={isSubscribing || !email}
              >
                {isSubscribing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
            {message && (
              <div className={`mt-2 small ${message.includes('Successfully') ? 'text-success' : 'text-danger'}`}>
                {message}
              </div>
            )}
          </div>
        </div>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 border-top mt-4 py-3">
          <div className="text-muted small">© {new Date().getFullYear()} D-Prep • Building disaster-ready campuses</div>
          <div className="d-flex gap-3">
            <a href="#" className="text-decoration-none text-muted small">Privacy</a>
            <a href="#" className="text-decoration-none text-muted small">Terms</a>
            <a href="#" className="text-decoration-none text-muted small">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;




