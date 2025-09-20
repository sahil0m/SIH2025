import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppNav from './components/AppNav';
import AppFooter from './components/AppFooter';
import MotionPage from './components/MotionPage';
import Chatbot from './components/Chatbot';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Alerts from './pages/Alerts';
import Drills from './pages/Drills';
import Leaderboard from './pages/Leaderboard';
import Emergency from './pages/Emergency';
import DisasterSimulation from './pages/DisasterSimulation';
import Admin from './pages/Admin';
import Teacher from './pages/Teacher';
import Auth from './pages/Auth';
import SetupUsers from './pages/SetupUsers';
import RequireAuth from './components/RequireAuth';
import RoleGuard, { AllowRoles } from './components/RoleGuard';

function AppRoutes() {
  const location = useLocation();
  const ProtectedLayout = () => (
    <div className="d-flex flex-column min-vh-100">
      <AppNav />
      <div className="app-bg flex-grow-1">
        <div className="container py-3">
          <Outlet />
        </div>
      </div>
      <AppFooter />
      <Chatbot />
    </div>
  );
  const AuthLayout = () => (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public auth pages (no navbar, but include footer) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<MotionPage><Auth /></MotionPage>} />
          <Route path="/signup" element={<MotionPage><Auth /></MotionPage>} />
          <Route path="/setup" element={<MotionPage><SetupUsers /></MotionPage>} />
        </Route>

        {/* Protected app shell with nav/footer */}
        <Route element={<RequireAuth><ProtectedLayout /></RequireAuth>}>
          <Route path="/" element={<MotionPage><Home /></MotionPage>} />
          <Route path="/learn" element={<MotionPage><AllowRoles roles={["student","teacher"]}><Learn /></AllowRoles></MotionPage>} />
          <Route path="/alerts" element={<MotionPage><AllowRoles roles={["student","teacher","admin"]}><Alerts /></AllowRoles></MotionPage>} />
          <Route path="/drills" element={<MotionPage><AllowRoles roles={["student","teacher"]}><Drills /></AllowRoles></MotionPage>} />
          <Route path="/simulation" element={<MotionPage><AllowRoles roles={["student","teacher"]}><DisasterSimulation /></AllowRoles></MotionPage>} />
          <Route path="/leaderboard" element={<MotionPage><AllowRoles roles={["student"]}><Leaderboard /></AllowRoles></MotionPage>} />
          <Route path="/emergency" element={<MotionPage><AllowRoles roles={["student","teacher"]}><Emergency /></AllowRoles></MotionPage>} />
          <Route path="/admin" element={<MotionPage><RoleGuard role="admin"><Admin /></RoleGuard></MotionPage>} />
          <Route path="/teacher" element={<MotionPage><RoleGuard role="teacher"><Teacher /></RoleGuard></MotionPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ConditionalChatbot />
      <NotificationToast />
    </BrowserRouter>
  );
}

function ConditionalChatbot() {
  const location = useLocation();
  
  // Don't show chatbot on auth pages
  const authPages = ['/login', '/signup', '/setup'];
  const isAuthPage = authPages.includes(location.pathname);
  
  if (isAuthPage) {
    return null;
  }
  
  return <Chatbot />;
}

export default App;


