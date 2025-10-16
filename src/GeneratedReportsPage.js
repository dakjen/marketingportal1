import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './GeneratedReportsPage.css';

function GeneratedReportsPage({ wordReports, fetchWordReports }) {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);

  const [generalReportStartDate, setGeneralReportStartDate] = useState('');
  const [generalReportEndDate, setGeneralReportEndDate] = useState('');
  const [generalReportOutput, setGeneralReportOutput] = useState('');
  const [generalReportName, setGeneralReportName] = useState('');

  const [socialMediaReportStartDate, setSocialMediaReportStartDate] = useState('');
  const [socialMediaReportEndDate, setSocialMediaReportEndDate] = useState('');
  const [socialMediaReportOutput, setSocialMediaReportOutput] = useState('');
  const [socialMediaReportName, setSocialMediaReportName] = useState('');

  const [physicalMarketingReportStartDate, setPhysicalMarketingReportStartDate] = useState('');
  const [physicalMarketingReportEndDate, setPhysicalMarketingReportEndDate] = useState('');
  const [physicalMarketingReportOutput, setPhysicalMarketingReportOutput] = useState('');
  const [physicalMarketingReportName, setPhysicalMarketingReportName] = useState('');

  const [generatedReports, setGeneratedReports] = useState([]);

  const fetchGeneratedReports = async () => {
    if (!activeProject) {
      setGeneratedReports([]);
      return;
    }
    try {
      const response = await fetch(`/api/generated-reports?project_name=${activeProject.name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGeneratedReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch generated reports:", error);
      alert('Failed to load generated reports. Please try again.');
    }
  };

  useEffect(() => {
    fetchGeneratedReports();
  }, [activeProject]);

  const handleGenerateWordReport = async (reportType, startDate, endDate, reportName) => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }

    let prompt = "Summarize analytics data gathered within these dates and present analytics data for all platforms and categories included within that date range. Please highlight any wins or significant changes in data.";

    try {
      const response = await fetch('/api/generate-and-save-word-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({ reportType, startDate, endDate, prompt, project_name: activeProject.name, reportName: reportName || 'Generated Report' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName || 'Generated Report'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      fetchWordReports();
    } catch (error) {
      console.error('Error generating AI report:', error);
      alert(error.message || 'Failed to generate report. Please try again.');
    }
  };

  const handleViewReport = (reportId) => {
    window.open(`/api/generated-reports/${reportId}/view`, '_blank');
  };

  const handleViewWordReport = (reportId) => {
    window.open(`/api/word-reports/${reportId}/view`, '_blank');
  };

  const handleDeleteWordReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    try {
      const response = await fetch(`/api/word-reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete report');
      }

      alert('Report deleted successfully!');
      console.log('Calling fetchWordReports after delete.');
      fetchWordReports(); // Re-fetch reports to update the list
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(error.message || 'Failed to delete report. Please try again.');
    }
  };

  return (
    <div className="generated-reports-page-container">
      <div className="report-generator-section">
        <h2>Generated Reports</h2>

        <div className="report-section">
          <h3>General Reports</h3>
          <div className="report-controls">
            <label>Start Date:
              <input type="date" value={generalReportStartDate} onChange={(e) => setGeneralReportStartDate(e.target.value)} />
            </label>
            <label>End Date:
              <input type="date" value={generalReportEndDate} onChange={(e) => setGeneralReportEndDate(e.target.value)} />
            </label>
            <label>Report Name:
              <input type="text" value={generalReportName} onChange={(e) => setGeneralReportName(e.target.value)} />
            </label>
            <button onClick={() => handleGenerateWordReport('general', generalReportStartDate, generalReportEndDate, generalReportName)}>Generate General Report</button>
          </div>
        </div>

        <div className="report-section">
          <h3>Social Media Reports</h3>
          <div className="report-controls">
            <label>Start Date:
              <input type="date" value={socialMediaReportStartDate} onChange={(e) => setSocialMediaReportStartDate(e.target.value)} />
            </label>
            <label>End Date:
              <input type="date" value={socialMediaReportEndDate} onChange={(e) => setSocialMediaReportEndDate(e.target.value)} />
            </label>
            <label>Report Name:
              <input type="text" value={socialMediaReportName} onChange={(e) => setSocialMediaReportName(e.target.value)} />
            </label>
            <button onClick={() => handleGenerateWordReport('socialMedia', socialMediaReportStartDate, socialMediaReportEndDate, socialMediaReportName)}>Generate Social Media Report</button>
          </div>
        </div>

        <div className="report-section">
          <h3>Physical Marketing Reports</h3>
          <div className="report-controls">
            <label>Start Date:
              <input type="date" value={physicalMarketingReportStartDate} onChange={(e) => setPhysicalMarketingReportStartDate(e.target.value)} />
            </label>
            <label>End Date:
              <input type="date" value={physicalMarketingReportEndDate} onChange={(e) => setPhysicalMarketingReportEndDate(e.target.value)} />
            </label>
            <label>Report Name:
              <input type="text" value={physicalMarketingReportName} onChange={(e) => setPhysicalMarketingReportName(e.target.value)} />
            </label>
            <button onClick={() => handleGenerateWordReport('physicalMarketing', physicalMarketingReportStartDate, physicalMarketingReportEndDate, physicalMarketingReportName)}>Generate Physical Marketing Report</button>
          </div>
        </div>
      </div>

      <div className="generated-reports-list-section">
        <h3>Saved Reports</h3>
        {generatedReports.length > 0 ? (
          (() => {
            const groupedReports = generatedReports.reduce((acc, report) => {
              acc[report.report_type] = acc[report.report_type] || [];
              acc[report.report_type].push(report);
              return acc;
            }, {});

            const reportCategories = [
              { type: 'general', title: 'General Reports' },
              { type: 'socialMedia', title: 'Social Media Reports' },
              { type: 'physicalMarketing', title: 'Physical Marketing Reports' },
            ];

            return reportCategories.map(category => (
              groupedReports[category.type] && groupedReports[category.type].length > 0 && (
                <div key={category.type} className="report-category-section">
                  <h4>{category.title}</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Generated By</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedReports[category.type].map((report) => (
                        <tr key={report.id}>
                          <td>{report.report_name}</td>
                          <td>{report.uploader_username}</td>
                          <td>{new Date(report.generation_date).toLocaleDateString()}</td>
                          <td>
                            <button onClick={() => handleViewReport(report.id)}>View</button>
                            {currentUser && currentUser.role !== 'internal' && currentUser.role !== 'view-only' && (
                              <button onClick={() => handleDeleteWordReport(report.id)}>Delete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ));
          })()
        ) : (
          <p>No reports generated yet.</p>
        )}

        {wordReports.length > 0 && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Generated By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wordReports.filter(report => report.report_type !== 'admin').map((report) => (
                      <tr key={report.id}>
                        <td><a href={`/api/word-reports/${report.id}/view`} target="_blank" rel="noopener noreferrer">{report.report_name}</a></td>
                        <td>{report.uploader_username}</td>
                            <button onClick={() => handleDeleteWordReport(report.id)}>Delete</button>
                      </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default GeneratedReportsPage;