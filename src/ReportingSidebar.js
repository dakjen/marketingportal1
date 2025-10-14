import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './ReportingSidebar.css';

function ReportingSidebar() {
  const { currentUser } = useContext(AuthContext);
  const isInternalUser = currentUser?.role === 'admin' || currentUser?.role === 'admin2'; // Assuming 'admin' and 'admin2' are the internal user roles
  return (
    <div className="reporting-sidebar">
      <NavLink to="/reporting"><h2>Project Reporting</h2></NavLink>
      <ul>
        <li><NavLink to="/reporting/monthly-reports">Monthly Reports</NavLink></li>
        <li><NavLink to="/reporting/social-media">Social Media</NavLink></li>
        <li><NavLink to="/reporting/physical-marketing">Physical Marketing</NavLink></li>
        <li><NavLink to="/reporting/generated-reports">Generated Reports</NavLink></li>
      </ul>
      <h3 className="sidebar-title">Operations</h3>
      <ul>
        {isInternalUser && <li><NavLink to="/reporting/operations/dashboard">Dashboard</NavLink></li>}
        {isInternalUser && <li><NavLink to="/reporting/operations/social-media">Social Media</NavLink></li>}
        {isInternalUser && <li><NavLink to="/reporting/operations/physical">Physical</NavLink></li>}
        <li><NavLink to="/reporting/operations/wins">Wins</NavLink></li>
        <li><NavLink to="/reporting/operations/property-management">Property Management</NavLink></li>
        <li><NavLink to="/reporting/operations/budget">Budget</NavLink></li> {/* New Budget Link */}
      </ul>
      <h3 className="sidebar-title">Admin Tools</h3>
      <ul>
        {isInternalUser && <li><NavLink to="/reporting/admin-project-inputs">Admin Project Inputs</NavLink></li>}
        {isInternalUser && <li><NavLink to="/reporting/admin-operations-dashboard">Operations Dashboard</NavLink></li>}
        {isInternalUser && <li><NavLink to="/reporting/admin-report-generator">Admin Report Generator</NavLink></li>}
      </ul>
    </div>
  );
}

export default ReportingSidebar;