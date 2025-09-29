import React from 'react';
import './Sidebar.css';
import logo from './assets/djcreative-logo.png';

function Sidebar({ isCollapsed }) {
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <img src={logo} alt="Logo" className="sidebar-logo" />
      <a href="#tools">Tools</a>
      <a href="#analytics">Analytics</a>
      <a href="#conversions">Conversions</a>
      <a href="#audience">Audience</a>
      <a href="#settings">Settings</a>
    </div>
  );
}

export default Sidebar;
