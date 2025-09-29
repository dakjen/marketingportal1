import './ReportingPage.css';

import React from 'react';
import './ReportingPage.css';
import ReportingSidebar from './ReportingSidebar'; // New import

function ReportingPage() {


  return (
    <div className="reporting-page-wrapper"> {/* New wrapper for sidebar and content */}
      <ReportingSidebar /> {/* Reporting page's dedicated sidebar */}
      <div className="reporting-main-content">
        <div className="reporting-boxes-container">
          <div className="reporting-box">
            <h4>Reports</h4>
          </div>
          <div className="reporting-box">
            <h4>Analytics</h4>
          </div>
          <div className="reporting-box">
            <h4>Submit</h4>
          </div>
          <div className="reporting-box">
            <h4>Budget</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportingPage;