import React from 'react';
import './ReportingSidebar.css';

function ReportingSidebar() {
  return (
    <div className="reporting-sidebar">
      <ul>
        <li>Monthly Reports</li>
        <li>Social Media</li>
        <li>Physical Marketing</li>
      </ul>
      <h3 className="sidebar-title">Operations</h3>
      <ul>
        <li>Dashboard</li>
        <li>Social Media</li>
        <li>Physical</li>
        <li>Wins</li>
        <li>Property Management</li>
      </ul>
    </div>
  );
}

export default ReportingSidebar;