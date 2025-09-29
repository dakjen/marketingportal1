import React from 'react';
import { Routes, Route } from 'react-router-dom'; // New import
import './ReportingPage.css';
import ReportingSidebar from './ReportingSidebar'; // New import
import MonthlyReportsPage from './MonthlyReportsPage';
import SocialMediaReportingPage from './SocialMediaReportingPage';
import PhysicalMarketingReportingPage from './PhysicalMarketingReportingPage';

function ReportingPage() {


  return (
    <div className="reporting-page-wrapper"> {/* New wrapper for sidebar and content */}
      <ReportingSidebar /> {/* Reporting page's dedicated sidebar */}
      <div className="reporting-main-content">
        <Routes>
          <Route path="/" element={
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
          } />
          <Route path="/monthly-reports" element={<MonthlyReportsPage />} />
          <Route path="/social-media" element={<SocialMediaReportingPage />} />
          <Route path="/physical-marketing" element={<PhysicalMarketingReportingPage />} />
          {/* Placeholder for Generated Reports and Operations routes */}
          <Route path="/generated-reports" element={<div>Generated Reports Content</div>} />
          <Route path="/operations/dashboard" element={<div>Operations Dashboard Content</div>} />
          <Route path="/operations/social-media" element={<div>Operations Social Media Content</div>} />
          <Route path="/operations/physical" element={<div>Operations Physical Content</div>} />
          <Route path="/operations/wins" element={<div>Operations Wins Content</div>} />
          <Route path="/operations/property-management" element={<div>Operations Property Management Content</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default ReportingPage;