import React from 'react';
import { NavLink } from 'react-router-dom'; // New import
import './ReportingSidebar.css';

function ReportingSidebar() {
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
        <li><NavLink to="/reporting/operations/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/reporting/operations/social-media">Social Media</NavLink></li>
        <li><NavLink to="/reporting/operations/physical">Physical</NavLink></li>
        <li><NavLink to="/reporting/operations/wins">Wins</NavLink></li>
        <li><NavLink to="/reporting/operations/property-management">Property Management</NavLink></li>
        <li><NavLink to="/reporting/operations/budget">Budget</NavLink></li> {/* New Budget Link */}
      </ul>
    </div>
  );
}

export default ReportingSidebar;