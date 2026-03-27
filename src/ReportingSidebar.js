import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './ReportingSidebar.css';

function ReportingSidebar() {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'admin2';
  return (
    <div className="reporting-sidebar">
      <NavLink to="/reporting"><h2>Reporting</h2></NavLink>
      <ul>
        <li><NavLink to="/reporting/social-media">Social Media</NavLink></li>
        <li><NavLink to="/reporting/physical-marketing">Physical Marketing</NavLink></li>
        <li><NavLink to="/reporting/monthly-reports">Monthly Reports</NavLink></li>
        <li><NavLink to="/reporting/generated-reports">Generated Reports</NavLink></li>
      </ul>
      {isAdmin && (
        <>
          <h3 className="sidebar-title">Operations</h3>
          <ul>
            <li><NavLink to="/reporting/operations/wins">Wins</NavLink></li>
            <li><NavLink to="/reporting/operations/property-management">Property Management</NavLink></li>
          </ul>
        </>
      )}
    </div>
  );
}

export default ReportingSidebar;
