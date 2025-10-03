import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom'; // New import
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Import Recharts components
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
import { OperationsBudgetPage, socialMediaTypes, physicalMarketingTypes } from './OperationsBudgetPage'; // New import for Operations Budget Page and types
import AdminProjectInputsPage from './AdminProjectInputsPage'; // New import
import AdminOperationsDashboardPage from './AdminOperationsDashboardPage'; // New import
import ProjectSwitcher from './ProjectSwitcher'; // New import
import { AuthContext } from './AuthContext'; // Import AuthContext
import { ProjectContext } from './ProjectContext'; // Import ProjectContext
import PrivateRoute from './PrivateRoute'; // New import

function ReportingPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [socialMediaUploads, setSocialMediaUploads] = useState([]);
  const [physicalMarketingUploads, setPhysicalMarketingUploads] = useState([]);
  const [projectSpendData, setProjectSpendData] = useState([]);
  const [monthlySpendChartData, setMonthlySpendChartData] = useState([]);
  const [selectedMonthlyReport, setSelectedMonthlyReport] = useState(''); // New state for selected report
  const [socialMediaBudget, setSocialMediaBudget] = useState(0); // New state for social media budget
  const [physicalMarketingBudget, setPhysicalMarketingBudget] = useState(0); // New state for physical marketing budget
  const [budgetInputText, setBudgetInputText] = useState(''); // New state for budget input text
  const [individualBudgets, setIndividualBudgets] = useState({}); // New state for individual category budgets
  const [totalSpent, setTotalSpent] = useState(0); // New state for total spent
  const [socialMediaSpent, setSocialMediaSpent] = useState(0); // New state for social media spent
  const [physicalMarketingSpent, setPhysicalMarketingSpent] = useState(0); // New state for physical marketing spent
  const [totalMonthlySpend, setTotalMonthlySpend] = useState(0); // New state for total monthly spend

  const handleFileUpload = (file) => {
    setUploadedFiles(prevFiles => [...prevFiles, file]);
  };

  const handleFileDelete = (fileName) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  // Placeholder functions for social media uploads
  const handleSocialMediaUpload = (newUpload) => {
    setSocialMediaUploads(prevUploads => [...prevUploads, newUpload]);
  };

  const handleSocialMediaDelete = (idToDelete) => {
    setSocialMediaUploads(prevUploads => prevUploads.filter(upload => upload.id !== idToDelete));
  };

  // Placeholder functions for physical marketing uploads
  const handlePhysicalMarketingUpload = (newUpload) => {
    setPhysicalMarketingUploads(prevUploads => [...prevUploads, newUpload]);
  };

  const handlePhysicalMarketingDelete = (idToDelete) => {
    setPhysicalMarketingUploads(prevUploads => prevUploads.filter(upload => upload.id !== idToDelete));
  };

  // Fetch project spend data
  useEffect(() => {
    const fetchProjectSpend = async () => {
      if (!activeProject) {
        setProjectSpendData([]);
        setMonthlySpendChartData([]);
        setTotalMonthlySpend(0);
        return;
      }
      try {
            const responseProjectData = await fetch(`/api/project-data?project_name=${encodeURIComponent(activeProject.name)}`);
            if (!responseProjectData.ok) {
              const errorData = await responseProjectData.json();
              console.error("Failed to fetch project spend data:", responseProjectData.status, errorData);
              throw new Error(errorData.message || `HTTP error! status: ${responseProjectData.status}`);
            }
            const projectData = await responseProjectData.json();
            console.log('fetchProjectSpend: projectData.spend:', projectData.spend);
    
            // Fetch social media entries
            const responseSocialMediaEntries = await fetch(`/api/socialmediaentries?project_name=${encodeURIComponent(activeProject.name)}`);
            if (!responseSocialMediaEntries.ok) {
              const errorData = await responseSocialMediaEntries.json();
              console.error("Failed to fetch social media entries data:", responseSocialMediaEntries.status, errorData);
              throw new Error(errorData.message || `HTTP error! status: ${responseSocialMediaEntries.status}`);
            }
            const socialMediaEntriesData = await responseSocialMediaEntries.json();
            console.log('fetchProjectSpend: socialMediaEntriesData.entries:', socialMediaEntriesData.entries);
    
            // Fetch physical marketing entries
            const responsePhysicalMarketingEntries = await fetch(`/api/physicalmarketingentries?project_name=${encodeURIComponent(activeProject.name)}`);
            if (!responsePhysicalMarketingEntries.ok) {
              const errorData = await responsePhysicalMarketingEntries.json();
              console.error("Failed to fetch physical marketing entries data:", responsePhysicalMarketingEntries.status, errorData);
              throw new Error(errorData.message || `HTTP error! status: ${responsePhysicalMarketingEntries.status}`);
            }
            const physicalMarketingEntriesData = await responsePhysicalMarketingEntries.json();
            console.log('fetchProjectSpend: physicalMarketingEntriesData.entries:', physicalMarketingEntriesData.entries);
    
        // Combine spend data from project-data
        const combinedSpendData = [
          ...projectData.spend,
        ];        console.log('fetchProjectSpend: combinedSpendData:', combinedSpendData);

        // Calculate total spend for the last 30 days
        const totalGrandSpend = combinedSpendData.reduce((sum, item) => {
          const amount = parseFloat(item.amount);
          if (isNaN(amount)) {
            console.warn('Non-numeric amount found:', item.amount, 'for item:', item);
            return sum; // Skip non-numeric amounts
          }
          return sum + amount;
        }, 0);
        console.log('fetchProjectSpend: totalGrandSpend:', totalGrandSpend);
        setTotalMonthlySpend(totalGrandSpend);
        setProjectSpendData(combinedSpendData); // Ensure projectSpendData is set

      } catch (error) {
        console.error("Error in fetchProjectSpend:", error);
        alert(`Failed to load project spend data: ${error.message}. Please try again.`);
      }
    };
    fetchProjectSpend();
  }, [activeProject]);

  // Process project spend data for chart
  useEffect(() => {
    if (projectSpendData.length > 0) {
      const monthlyTotals = projectSpendData.reduce((acc, item) => {
        const date = new Date(item.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        acc[monthYear] = (acc[monthYear] || 0) + item.amount;
        return acc;
      }, {});

      let chartData = Object.keys(monthlyTotals).map(monthYear => ({
        month: monthYear,
        spend: monthlyTotals[monthYear],
      })).sort((a, b) => {
        const [aYear, aMonth] = a.month.split('-').map(Number);
        const [bYear, bMonth] = b.month.split('-').map(Number);
        return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
      });

      // Filter to last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      chartData = chartData.filter(dataPoint => {
        const [year, month] = dataPoint.month.split('-').map(Number);
        return new Date(year, month - 1) >= sixMonthsAgo;
      });

      setMonthlySpendChartData(chartData);
    } else {
      setMonthlySpendChartData([]);
    }
  }, [projectSpendData]);

  // Calculate total spent and categorized spent whenever projectSpendData changes
  useEffect(() => {
    const calculatedTotalSpent = projectSpendData.reduce((sum, item) => sum + item.amount, 0);
    setTotalSpent(calculatedTotalSpent);

    const calculatedSocialMediaSpent = projectSpendData
      .filter(item => item.type === 'socialMedia')
      .reduce((sum, item) => sum + item.amount, 0);
    setSocialMediaSpent(calculatedSocialMediaSpent);

    const calculatedPhysicalMarketingSpent = projectSpendData
      .filter(item => item.type === 'physicalMarketing')
      .reduce((sum, item) => sum + item.amount, 0);
    setPhysicalMarketingSpent(calculatedPhysicalMarketingSpent);
  }, [projectSpendData]);

  // Calculate individual category budgets whenever projectSpendData changes
  useEffect(() => {
    const newIndividualBudgets = {};
    projectSpendData.forEach(item => {
      // Assuming item.type directly corresponds to a category or can be mapped
      // For budget entries, the 'type' field from the API should be the category
      const category = item.type;
      if (category) {
        newIndividualBudgets[category] = (newIndividualBudgets[category] || 0) + item.amount;
      }
    });
    setIndividualBudgets(newIndividualBudgets);
  }, [projectSpendData]);

  const handleSubmitMonthlyReport = async () => {
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    if (!currentUser) {
      alert('You must be logged in to submit a report.');
      return;
    }
    if (!selectedMonthlyReport) {
      alert('Please select a monthly report to submit.');
      return;
    }

    const confirmation = window.confirm(
      `Are you sure you want to submit the monthly report "${selectedMonthlyReport}" for project "${activeProject.name}"?`
    );

    if (confirmation) {
      try {
        const response = await fetch('/api/submit-monthly-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Username': currentUser.username,
            'X-User-Role': currentUser.role,
          },
          body: JSON.stringify({
            projectName: activeProject.name,
            submittedBy: currentUser.username,
            reportType: 'monthly',
            reportName: selectedMonthlyReport, // Include the selected report name
            message: `New monthly report "${selectedMonthlyReport}" for project "${activeProject.name}" is complete and submitted by ${currentUser.username}.`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit monthly report');
        }

        alert('Monthly report submitted successfully! Admin has been notified.');
        setSelectedMonthlyReport(''); // Clear selection after submission
      } catch (error) {
        console.error('Error submitting monthly report:', error);
        alert(error.message || 'Failed to submit monthly report. Please try again.');
      }
    }
  };

  const socialMediaCategories = ['Facebook', 'Instagram', 'Google Ads', 'LinkedIn', 'Bluesky', 'Other'];
  const physicalMarketingCategories = ['Billboards', 'Podcasts', 'Radio Ads', 'Newspaper', 'Jobsite banners', 'Printed collateral'];

  const parseBudgetInput = () => {
    const lines = budgetInputText.split('\n');
    console.log('Parsing budget input. Lines:', lines);
    let newSocialMediaBudget = 0;
    let newPhysicalMarketingBudget = 0;
    const newIndividualBudgets = {};

    const socialMediaCategories = ['Facebook', 'Instagram', 'Google Ads', 'LinkedIn', 'Bluesky', 'Other'];
    const physicalMarketingCategories = ['Billboards', 'Podcasts', 'Radio Ads', 'Newspaper', 'Jobsite banners', 'Printed collateral'];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      console.log('Processing line:', trimmedLine);
      const match = trimmedLine.match(/^(.*?)\$(\d+\.?\d*)$/);

      if (match) {
        const category = match[1].trim();
        const amount = parseFloat(match[2]);
        console.log('Match found. Category:', category, 'Amount:', amount);

        if (!isNaN(amount)) {
          newIndividualBudgets[category] = amount;

          if (socialMediaCategories.includes(category)) {
            newSocialMediaBudget += amount;
          } else if (physicalMarketingCategories.includes(category)) {
            newPhysicalMarketingBudget += amount;
          }
        } else {
          console.log('Amount is NaN for line:', trimmedLine);
        }
      } else {
        console.log('No match found for line:', trimmedLine);
      }
    });

    setSocialMediaBudget(newSocialMediaBudget);
    setPhysicalMarketingBudget(newPhysicalMarketingBudget);
    setIndividualBudgets(newIndividualBudgets);
  };

  return (
    <div className="reporting-page-wrapper"> {/* New wrapper for sidebar and content */}
      <ReportingSidebar /> {/* Reporting page's dedicated sidebar */}
      <div className="reporting-main-content">
        <ProjectSwitcher />
        <Routes>
          <Route path="/" element={
            <React.Fragment>
              <div className="reporting-boxes-container">
                <div className="reporting-box">
                  <h4>Reports</h4>
                </div>
                <div className="reporting-box">
                  <h4>Analytics</h4>
                  <p>Social Media Uploads: {socialMediaUploads.length}</p>
                  <p>Physical Marketing Uploads: {physicalMarketingUploads.length}</p>
                </div>
                <div className="reporting-box">
                  <h4>Submit</h4>
                  <p style={{ fontSize: '0.85em' }}>Submit monthly report to Project Lead</p>
                  <select
                    value={selectedMonthlyReport}
                    onChange={(e) => setSelectedMonthlyReport(e.target.value)}
                    style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                  >
                    <option value="">Select a report</option>
                    {uploadedFiles.map((file, index) => (
                      <option key={index} value={file.name}>{file.name}</option>
                    ))}
                  </select>
                  <button onClick={handleSubmitMonthlyReport}>Submit Report</button>
                </div>
                <div className="reporting-box">
                  <h4>Total Cumulative Spend</h4>
                  <p>${totalMonthlySpend.toFixed(2)}</p>
                </div>

              </div>
              <div className="budget-container">
                <h3>Budget</h3>
                {monthlySpendChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlySpendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="spend" fill="#c07481" name="Monthly Spend" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No budget data available for the active project.</p>
                )}

                <div className="spend-container" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '20px'}}>
                  <div className="spend-box" style={{width: '45%'}}>
                    <h4>Social Media Spend</h4>
                    <p>${socialMediaSpent.toFixed(2)}</p>
                  </div>
                  <div className="spend-box" style={{width: '45%'}}>
                    <h4>Physical Marketing Spend</h4>
                    <p>${physicalMarketingSpent.toFixed(2)}</p>
                  </div>
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
            </React.Fragment>
          } />
          <Route path="monthly-reports" element={<MonthlyReportsPage uploadedFiles={uploadedFiles} handleFileUpload={handleFileUpload} handleFileDelete={handleFileDelete} />} />
          <Route path="social-media" element={<SocialMediaReportingPage uploads={socialMediaUploads} handleUpload={handleSocialMediaUpload} handleDeleteUpload={handleSocialMediaDelete} />} />
          <Route path="physical-marketing" element={<PhysicalMarketingReportingPage uploads={physicalMarketingUploads} handleUpload={handlePhysicalMarketingUpload} handleDeleteUpload={handlePhysicalMarketingDelete} />} />
          {/* Placeholder for Generated Reports and Operations routes */}
          <Route path="generated-reports" element={<GeneratedReportsPage />} />
          <Route path="operations/dashboard" element={<OperationsDashboardPage />} />

          <Route path="operations/social-media" element={<PrivateRoute allowedRoles={['admin', 'admin2']}><OperationsSocialMediaPage /></PrivateRoute>} />
          <Route path="operations/physical" element={<PrivateRoute allowedRoles={['admin', 'admin2']}><OperationsPhysicalPage /></PrivateRoute>} />
          <Route path="operations/wins" element={<OperationsWinsPage />} />
          <Route path="operations/property-management" element={<OperationsPropertyManagementPage />} />
          <Route path="operations/budget" element={<OperationsBudgetPage />} /> {/* New route for Operations Budget Page */}
          <Route path="admin-project-inputs" element={<PrivateRoute allowedRoles={['admin', 'admin2']}><AdminProjectInputsPage /></PrivateRoute>} />
          <Route path="admin-operations-dashboard" element={<PrivateRoute allowedRoles={['admin', 'admin2']}><AdminOperationsDashboardPage /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default ReportingPage;