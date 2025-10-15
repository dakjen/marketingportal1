import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './AdminReportGenerator.css';

function AdminReportGenerator() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportOutput, setReportOutput] = useState('');
  const [reportName, setReportName] = useState('');

  const handleGenerateReport = async () => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }

    const prompt = "please ustilize the entries from social media and physical marketing to generate a report of: money spent, organizations worked with, total in each category, and total in each subcategory, as well as a short narrative at gthe very top describing all of the types of marketing hit and an approximate reach for each entry, as well as total reach per category. the structure of this report should be title, summary, then a \"short summary\" section where you summarize the total reach, and total items added within the time frame, do not include costs, just the extimated total reach, then put the rest of the items named above: format it simply with bullets and narratives, like a plain word doc, no formatting indicators";

    setReportOutput('Generating report...');

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({ reportType: 'admin', startDate, endDate, prompt, project_name: activeProject.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const data = await response.json();
      setReportOutput(data.report);
    } catch (error) {
      console.error('Error generating AI report:', error);
      alert(error.message || 'Failed to generate report. Please try again.');
      setReportOutput('Error generating report.');
    }
  };

  const handleSaveReport = async () => {
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
        body: JSON.stringify({ reportContent: reportOutput, reportName, reportType: 'admin', project_name: activeProject.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save report');
      }

      alert('Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      alert(error.message || 'Failed to save report. Please try again.');
    }
  };

  const handleSaveAsWord = async () => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }
    if (!reportName) {
      alert('Please enter a name for the report.');
      return;
    }

    try {
      const response = await fetch('/api/save-report-as-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({ reportContent: reportOutput, reportName, project_name: activeProject.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save report as Word');
      }

      alert('Report saved successfully as Word document!');
    } catch (error) {
      console.error('Error saving report as Word:', error);
      alert(error.message || 'Failed to save report as Word. Please try again.');
    }
  };

  return (
    <div className="admin-report-generator-page-container">
      <div className="report-generator-section">
        <h2>Admin Report Generator</h2>
        <div className="report-section">
          <h3>Admin Report</h3>
          <div className="report-controls">
            <label>Start Date:
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>End Date:
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <button onClick={handleGenerateReport}>Generate Admin Report</button>
          </div>
          <div className="report-output">
            <h4>Report Output:</h4>
            <p>{reportOutput}</p>
            {reportOutput && reportOutput !== 'Generating report...' && reportOutput !== 'Error generating report.' && (
              <div className="save-report-controls">
                <input
                  type="text"
                  placeholder="Report Name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
                <button onClick={handleSaveReport}>Save as PDF</button>
                <button onClick={handleSaveAsWord}>Save as Word</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReportGenerator;