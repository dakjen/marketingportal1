import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './ReportingSidebar.css';

function ReportingSidebar() {
  const { currentUser } = useContext(AuthContext);
  const isInternalUser = currentUser?.role === 'admin'; // Assuming 'admin' is the internal user role
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

        {isInternalUser && <li><NavLink to="/reporting/operations/social-media">Social Media</NavLink></li>}
        {isInternalUser && <li><NavLink to="/reporting/operations/physical">Physical</NavLink></li>}
        <li><NavLink to="/reporting/operations/wins">Wins</NavLink></li>
        <li><NavLink to="/reporting/operations/property-management">Property Management</NavLink></li>
        <li><NavLink to="/reporting/operations/budget">Budget</NavLink></li> {/* New Budget Link */}
        {isInternalUser && <li><NavLink to="/reporting/operations/admin-project-inputs">Admin Project Inputs</NavLink></li>}
      </ul>
    </div>
  );
}

export default ReportingSidebar;