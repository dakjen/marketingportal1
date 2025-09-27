import React from 'react';
import './Sidebar.css';
import logo from './assets/djcreative-logo.png';

function Sidebar() {
  return (
    <div className="sidebar">
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
