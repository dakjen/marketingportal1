import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './GeneratedReportsPage.css';

function GeneratedReportsPage() {
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
  const [wordReports, setWordReports] = useState([]);

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

  const fetchWordReports = async () => {
    if (!activeProject) {
      setWordReports([]);
      return;
    }
    try {
      const response = await fetch(`/api/word-reports?project_name=${activeProject.name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWordReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch word reports:", error);
      alert('Failed to load word reports. Please try again.');
    }
  };

  useEffect(() => {
    fetchGeneratedReports();
    fetchWordReports();
  }, [activeProject]);

  const handleGenerateReport = async (reportType) => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }

    let startDate, endDate, setOutput;
    let prompt = ""; // Initialize prompt here

    switch (reportType) {
      case 'general':
        prompt = "Summarize analytics data gathered within these dates and present analytics data for all platforms and categories included within that date range. Please highlight any wins or significant changes in data.";
        startDate = generalReportStartDate;
        endDate = generalReportEndDate;
        setOutput = setGeneralReportOutput;
        break;
      case 'socialMedia':
        // Social media reports don't have a prompt dropdown, so prompt is not used here
        startDate = socialMediaReportStartDate;
        endDate = socialMediaReportEndDate;
        setOutput = setSocialMediaReportOutput;
        break;
      case 'physicalMarketing':
        prompt = "Summarize analytics data gathered within these dates and present analytics data for all platforms and categories included within that date range. Please highlight any wins or significant changes in data.";
        startDate = physicalMarketingReportStartDate;
        endDate = physicalMarketingReportEndDate;
        setOutput = setPhysicalMarketingReportOutput;
        break;
      default:
        return;
    }

    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }

    setOutput('Generating report...');

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({ reportType, startDate, endDate, prompt, project_name: activeProject.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const data = await response.json();
      setOutput(data.report);
    } catch (error) {
      console.error('Error generating AI report:', error);
      alert(error.message || 'Failed to generate report. Please try again.');
      setOutput('Error generating report.');
    }
  };

  const handleSaveReport = async (reportContent, reportType, reportName) => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }
    if (!reportName) {
      alert('Please enter a name for the report.');
      return;
    }

    try {
      const response = await fetch('/api/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({ reportContent, reportName, reportType, project_name: activeProject.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save report');
      }

      alert('Report saved successfully!');
      fetchGeneratedReports(); // Re-fetch reports to update the list
    } catch (error) {
      console.error('Error saving report:', error);
      alert(error.message || 'Failed to save report. Please try again.');
    }
  };

  const handleViewReport = (reportId) => {
    window.open(`/api/generated-reports/${reportId}/view`, '_blank');
  };

  const handleViewWordReport = (reportId) => {
    window.open(`/api/word-reports/${reportId}/view`, '_blank');
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    try {
      const response = await fetch(`/api/generated-reports/${reportId}`, {
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
      fetchGeneratedReports(); // Re-fetch reports to update the list
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
            <button onClick={() => handleGenerateReport('general')}>Generate General Report</button>
          </div>
          <div className="report-output">
            <h4>Report Output:</h4>
            <p>{generalReportOutput}</p>
            {generalReportOutput && generalReportOutput !== 'Generating report...' && generalReportOutput !== 'Error generating report.' && (
              <div className="save-report-controls">
                <input
                  type="text"
                  placeholder="Report Name"
                  value={generalReportName}
                  onChange={(e) => setGeneralReportName(e.target.value)}
                />
                <button onClick={() => handleSaveReport(generalReportOutput, 'general', generalReportName)}>Save as PDF</button>
              </div>
            )}
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

            <button onClick={() => handleGenerateReport('socialMedia')}>Generate Social Media Report</button>
          </div>
          <div className="report-output">
            <h4>Report Output:</h4>
            <p>{socialMediaReportOutput}</p>
            {socialMediaReportOutput && socialMediaReportOutput !== 'Generating report...' && socialMediaReportOutput !== 'Error generating report.' && (
              <div className="save-report-controls">
                <input
                  type="text"
                  placeholder="Report Name"
                  value={socialMediaReportName}
                  onChange={(e) => setSocialMediaReportName(e.target.value)}
                />
                <button onClick={() => handleSaveReport(socialMediaReportOutput, 'socialMedia', socialMediaReportName)}>Save as PDF</button>
              </div>
            )}
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
            <button onClick={() => handleGenerateReport('physicalMarketing')}>Generate Physical Marketing Report</button>
          </div>
          <div className="report-output">
            <h4>Report Output:</h4>
            <p>{physicalMarketingReportOutput}</p>
            {physicalMarketingReportOutput && physicalMarketingReportOutput !== 'Generating report...' && physicalMarketingReportOutput !== 'Error generating report.' && (
              <div className="save-report-controls">
                <input
                  type="text"
                  placeholder="Report Name"
                  value={physicalMarketingReportName}
                  onChange={(e) => setPhysicalMarketingReportName(e.target.value)}
                />
                <button onClick={() => handleSaveReport(physicalMarketingReportOutput, 'physicalMarketing', physicalMarketingReportName)}>Save as PDF</button>
              </div>
            )}
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
                              <button onClick={() => handleDeleteReport(report.id)}>Delete</button>
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
          <div className="report-category-section">
            <h4>Word Reports</h4>
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
                {wordReports.map((report) => (
                      <tr key={report.id}>
                        <td><a href={`/api/word-reports/${report.id}/view`} target="_blank" rel="noopener noreferrer">{report.report_name}</a></td>
                        <td>{report.uploader_username}</td>
                        <td>{new Date(report.generation_date).toLocaleDateString()}</td>
                        <td>
                          {currentUser && currentUser.role !== 'internal' && currentUser.role !== 'view-only' && (
                            <button onClick={() => handleDeleteReport(report.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneratedReportsPage;