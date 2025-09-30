import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // New import
import './ReportingPage.css';
import ReportingSidebar from './ReportingSidebar'; // New import
import MonthlyReportsPage from './MonthlyReportsPage';
import SocialMediaReportingPage from './SocialMediaReportingPage';
import PhysicalMarketingReportingPage from './PhysicalMarketingReportingPage';
import GeneratedReportsPage from './GeneratedReportsPage';
import OperationsDashboardPage from './OperationsDashboardPage';
import OperationsSocialMediaPage from './OperationsSocialMediaPage';
import OperationsPhysicalPage from './OperationsPhysicalPage';
import OperationsWinsPage from './OperationsWinsPage';
import OperationsPropertyManagementPage from './OperationsPropertyManagementPage';
import ProjectSwitcher from './ProjectSwitcher'; // New import

function ReportingPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (file) => {
    setUploadedFiles(prevFiles => [...prevFiles, file]);
  };

  const handleFileDelete = (fileName) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  return (
    <div className="reporting-page-wrapper"> {/* New wrapper for sidebar and content */}
      <ReportingSidebar /> {/* Reporting page's dedicated sidebar */}
      <div className="reporting-main-content">
        <ProjectSwitcher />
        <Routes>
          <Route path="/" element={
            <div>
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
              <div className="recent-reports-container">
                <h3>Recently Uploaded Reports</h3>
                {uploadedFiles.length > 0 ? (
                  <ul className="recent-reports-list">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="recent-reports-list-item">
                        <span>{file.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No reports uploaded yet.</p>
                )}
              </div>
            </div>
          } />
          <Route path="monthly-reports" element={<MonthlyReportsPage uploadedFiles={uploadedFiles} handleFileUpload={handleFileUpload} handleFileDelete={handleFileDelete} />} />
          <Route path="social-media" element={<SocialMediaReportingPage />} />
          <Route path="physical-marketing" element={<PhysicalMarketingReportingPage />} />
          {/* Placeholder for Generated Reports and Operations routes */}
          <Route path="generated-reports" element={<GeneratedReportsPage />} />
          <Route path="operations/dashboard" element={<OperationsDashboardPage />} />
          <Route path="operations/social-media" element={<OperationsSocialMediaPage />} />
          <Route path="operations/physical" element={<OperationsPhysicalPage />} />
          <Route path="operations/wins" element={<OperationsWinsPage />} />
          <Route path="operations/property-management" element={<OperationsPropertyManagementPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default ReportingPage;