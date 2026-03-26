import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import EntriesPage from './EntriesPage';
import SocialMediaEntries from './SocialMediaEntries';
import PhysicalMarketingEntries from './PhysicalMarketingEntries';
import ProjectManagementPage from './ProjectManagementPage';
import MessagesPage from './MessagesPage';
import ReportingPage from './ReportingPage';
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage';
import ContactAdminPage from './ContactAdminPage';
import IntroScreen from './IntroScreen';
import RequestAccountPage from './RequestAccountPage';
import WorkflowPage from './WorkflowPage';
import { AuthProvider, AuthContext } from './AuthContext';
import { ProjectProvider, ProjectContext } from './ProjectContext';
import { canEditEntries, canManageProjects, canViewMessages, canViewReporting } from './roles';
import './Tabs.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, currentUser, isLoading } = useContext(AuthContext);
  if (isLoading) { return <div>Loading...</div>; }
  if (!isLoggedIn) { return <Navigate to="/intro" />; }
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) { return <Navigate to="/" />; }
  return children;
};

function AppContent() {
  const { isLoggedIn, logout, currentUser } = useContext(AuthContext);
  const { projects, activeProject, selectProject } = useContext(ProjectContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Capture the install prompt and suppress the browser's automatic banner
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsAppInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setIsAppInstalled(true);
    setInstallPrompt(null);
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!currentUser) return;
      try {
        const response = await fetch('/api/messages/unread-count', {
          headers: {
            'X-User-Username': currentUser.username,
            'X-User-Role': currentUser.role,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch unread message count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <div className="app-container">
      {isLoggedIn && (
        <>
          <nav>
            <ul className="tabs-container">
              <li className="tab-item">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Dashboard
                </NavLink>
              </li>
              {canEditEntries(currentUser?.role) && (
                <li className="tab-item">
                  <NavLink to="/entries" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Entries
                  </NavLink>
                </li>
              )}
              {canViewReporting(currentUser?.role) && (
                <li className="tab-item">
                  <NavLink to="/reporting" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Reporting
                  </NavLink>
                </li>
              )}
              {canViewMessages(currentUser?.role) && (
                <li className="tab-item">
                  <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Messages {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                  </NavLink>
                </li>
              )}
              <li className="tab-item">
                <NavLink to="/workflow" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Workflow
                </NavLink>
              </li>
              {canManageProjects(currentUser?.role) && (
                <li className="tab-item">
                  <NavLink to="/project-management" className={({ isActive }) => (isActive ? 'active project-management-tab' : 'project-management-tab')}>
                    Project Management
                  </NavLink>
                </li>
              )}
              {isLoggedIn && installPrompt && !isAppInstalled && (
                <li className="tab-item">
                  <button className="install-pwa-btn" onClick={handleInstallClick} title="Install DJC Portal as a desktop app">
                    <i className="fas fa-download"></i> Install App
                  </button>
                </li>
              )}
              <li className="tab-item profile-dropdown-container">
                {currentUser && <p className="user-display">User: {currentUser.username}</p>}
                <div className="profile-icon" onClick={() => setShowDropdown(!showDropdown)}>
                  <i className="fas fa-user-circle"></i>
                </div>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <NavLink to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      View Profile
                    </NavLink>
                    <button onClick={logout} className="dropdown-item">
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
            <div className="app-login-status-display"></div>
          </nav>
          <hr />
        </>
      )}
      <div className="main-content">
        <Routes>
          <Route path="/intro" element={isLoggedIn ? <Navigate to="/" /> : <IntroScreen />} />
          <Route path="/request-account" element={isLoggedIn ? <Navigate to="/" /> : <RequestAccountPage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/forgot-password" element={<ContactAdminPage />} />
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <PrivateRoute allowedRoles={['admin', 'admin2', 'internal', 'external', 'view-only']}>
                  <Dashboard
                    projects={projects}
                    activeProject={activeProject}
                    selectProject={selectProject}
                  />
                </PrivateRoute>
              ) : (
                <Navigate to="/intro" />
              )
            }
          />
          <Route
            path="/project-management"
            element={
              <PrivateRoute allowedRoles={['admin', 'admin2']}>
                <ProjectManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entries"
            element={
              <PrivateRoute allowedRoles={['admin', 'admin2', 'internal']}>
                <EntriesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/social-media"
            element={
              <PrivateRoute allowedRoles={['admin', 'admin2', 'internal', 'view-only']}>
                {activeProject ? <SocialMediaEntries /> : <p>Please select a project to view social media entries.</p>}
              </PrivateRoute>
            }
          />
          <Route
            path="/physical-marketing"
            element={
              <PrivateRoute allowedRoles={['admin', 'admin2', 'internal']}>
                {activeProject ? <PhysicalMarketingEntries /> : <p>Please select a project to view physical marketing entries.</p>}
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={['admin', 'admin2', 'internal', 'external']}>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute allowedRoles={['admin', 'internal']}>
                <MessagesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reporting/*"
            element={
              <PrivateRoute allowedRoles={['admin', 'internal']}>
                <ReportingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/workflow"
            element={
              <PrivateRoute allowedRoles={['admin', 'admin2', 'internal', 'external', 'view-only']}>
                <WorkflowPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const AppProviders = () => {
    const { reloadUser } = useContext(AuthContext);
    return (
      <ProjectProvider reloadUser={reloadUser}>
        <AppContent />
      </ProjectProvider>
    );
  };

  return (
    <Router>
      <AuthProvider>
        <AppProviders />
      </AuthProvider>
    </Router>
  );
}

export default App;
