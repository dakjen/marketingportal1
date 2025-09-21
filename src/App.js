import React, { useContext, useState } from 'react';
     import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from
       'react-router-dom';
     import Dashboard from './Dashboard';
     import SocialMediaEntries from './SocialMediaEntries';
     import PhysicalMarketingEntries from './PhysicalMarketingEntries';
     import ProjectManagementPage from './ProjectManagementPage';
     import LoginPage from './LoginPage';
     import ProfilePage from './ProfilePage';
     import ContactAdminPage from './ContactAdminPage';
   import { AuthProvider, AuthContext } from './AuthContext';
   import { ProjectProvider, ProjectContext } from './ProjectContext';
   import './Tabs.css';
   
   const PrivateRoute = ({ children, allowedRoles }) => {
     const { isLoggedIn, currentUser } = useContext(AuthContext);
     if (!isLoggedIn) { return <Navigate to="/login" />; }
     if (allowedRoles && !allowedRoles.includes(currentUser?.role)) { return <Navigate to="/"
       />; }
     return children;
   };
   
   function AppContent() {
     const { isLoggedIn, logout, currentUser } = useContext(AuthContext);
     const { projects, activeProject, selectProject } = useContext(ProjectContext);
     const [showDropdown, setShowDropdown] = useState(false);
   
     return (
       <div>
         <nav>
           <ul className="tabs-container">
             {isLoggedIn && (
               <>
                 <li className="tab-item">
                   <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                     Dashboard
                   </NavLink>
                 </li>
                 {(currentUser?.role === 'admin' || currentUser?.role === 'internal') && (
                   <li className="tab-item">
                     <NavLink to="/social-media" className={({ isActive }) => (isActive ?
       'active' : '')}>
                       Social media entries
                     </NavLink>
                   </li>
                 )}
                 {(currentUser?.role === 'admin' || currentUser?.role === 'internal') && (
                   <li className="tab-item">
                     <NavLink to="/physical-marketing" className={({ isActive }) => (isActive
       ? 'active' : '')}>
                       Physical marketing entries
                     </NavLink>
                   </li>
                 )}
                 {currentUser?.role === 'admin' && (
                   <li className="tab-item">
                     <NavLink to="/project-management" className={({ isActive }) => (isActive
       ? 'active project-management-tab' : 'project-management-tab')}>
                       Project Management
                     </NavLink>
                   </li>
                 )}
                 <li className="tab-item profile-dropdown-container">
                   <div className="profile-icon" onClick={() => setShowDropdown
       (!showDropdown)}>
                     <i className="fas fa-user-circle"></i>
                   </div>
                   {showDropdown && (
                     <div className="dropdown-menu">
                       <NavLink to="/profile" className="dropdown-item" onClick={() =>
       setShowDropdown(false)}>
                         View Profile
                       </NavLink>
                       <button onClick={logout} className="dropdown-item">
                         Logout
                       </button>
                     </div>
                   )}
                 </li>
               </>
             )}
           </ul>
           {isLoggedIn && (
             <div className="app-login-status-display">
        {currentUser && <p>User: {currentUser.username}</p>}
        <p>Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}</p>
       </div>
           )}
         </nav>
         <hr />
         <Routes>
           <Route path="/login" element={<LoginPage />} />
           <Route path="/forgot-password" element={<ContactAdminPage />} />
           <Route
             path="/"
             element={
               <PrivateRoute allowedRoles={['admin', 'internal', 'external']}>
                 <Dashboard
                   projects={projects}
                   activeProject={activeProject}
                   selectProject={selectProject}
                 />
               </PrivateRoute>
             }
           />
           <Route
             path="/project-management"
           element={
             <PrivateRoute allowedRoles={['admin']}>
               <ProjectManagementPage />
             </PrivateRoute>
           }
         />
         <Route
           path="/social-media"
           element={
             <PrivateRoute allowedRoles={['admin', 'internal']}>
               {activeProject ? <SocialMediaEntries /> : <p>Please select a project to view
       social media entries.</p>}
             </PrivateRoute>
           }
         />
         <Route
           path="/physical-marketing"
           element={
             <PrivateRoute allowedRoles={['admin', 'internal']}>
               {activeProject ? <PhysicalMarketingEntries /> : <p>Please select a project
       to view physical marketing entries.</p>}
             </PrivateRoute>
           }
         />
         <Route
           path="/profile"
           element={
             <PrivateRoute allowedRoles={['admin', 'internal', 'external']}>
               <ProfilePage />
             </PrivateRoute>
           }
         />
       </Routes>
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