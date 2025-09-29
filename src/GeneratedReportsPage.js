import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './GeneratedReportsPage.css';

function GeneratedReportsPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);

  const [generalReportPrompt, setGeneralReportPrompt] = useState('');
  const [generalReportStartDate, setGeneralReportStartDate] = useState('');
  const [generalReportEndDate, setGeneralReportEndDate] = useState('');
  const [generalReportOutput, setGeneralReportOutput] = useState('No report generated yet.');

  const [socialMediaReportPrompt, setSocialMediaReportPrompt] = useState('');
  const [socialMediaReportStartDate, setSocialMediaReportStartDate] = useState('');
  const [socialMediaReportEndDate, setSocialMediaReportEndDate] = useState('');
  const [socialMediaReportOutput, setSocialMediaReportOutput] = useState('No report generated yet.');

  const [physicalMarketingReportPrompt, setPhysicalMarketingReportPrompt] = useState('');
  const [physicalMarketingReportStartDate, setPhysicalMarketingReportStartDate] = useState('');
  const [physicalMarketingReportEndDate, setPhysicalMarketingReportEndDate] = useState('');
  const [physicalMarketingReportOutput, setPhysicalMarketingReportOutput] = useState('No report generated yet.');

  const handleGenerateReport = async (reportType) => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }

    let prompt, startDate, endDate, setOutput;

    switch (reportType) {
      case 'general':
        prompt = generalReportPrompt;
        startDate = generalReportStartDate;
        endDate = generalReportEndDate;
        setOutput = setGeneralReportOutput;
        break;
      case 'socialMedia':
        prompt = socialMediaReportPrompt;
        startDate = socialMediaReportStartDate;
        endDate = socialMediaReportEndDate;
        setOutput = setSocialMediaReportOutput;
        break;
      case 'physicalMarketing':
        prompt = physicalMarketingReportPrompt;
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

    // TODO: Call backend API for AI report generation
    // For now, simulate a response
    setTimeout(() => {
      setOutput(`Generated ${reportType} report for project ${activeProject.name} from ${startDate} to ${endDate} based on prompt: "${prompt}"`);
    }, 2000);
  };

  return (
    <div className="generated-reports-page-container">
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
          <label>Prompt:
            <textarea value={generalReportPrompt} onChange={(e) => setGeneralReportPrompt(e.target.value)} rows="3"></textarea>
          </label>
          <button onClick={() => handleGenerateReport('general')}>Generate General Report</button>
        </div>
        <div className="report-output">
          <h4>Report Output:</h4>
          <p>{generalReportOutput}</p>
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
          <label>Prompt:
            <textarea value={socialMediaReportPrompt} onChange={(e) => setSocialMediaReportPrompt(e.target.value)} rows="3"></textarea>
          </label>
          <button onClick={() => handleGenerateReport('socialMedia')}>Generate Social Media Report</button>
        </div>
        <div className="report-output">
          <h4>Report Output:</h4>
          <p>{socialMediaReportOutput}</p>
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
          <label>Prompt:
            <textarea value={physicalMarketingReportPrompt} onChange={(e) => setPhysicalMarketingReportPrompt(e.target.value)} rows="3"></textarea>
          </label>
          <button onClick={() => handleGenerateReport('physicalMarketing')}>Generate Physical Marketing Report</button>
        </div>
        <div className="report-output">
          <h4>Report Output:</h4>
          <p>{physicalMarketingReportOutput}</p>
        </div>
      </div>
    </div>
  );
}

export default GeneratedReportsPage;