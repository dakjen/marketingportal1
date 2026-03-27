import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ReportingPage.css';
import ReportingSidebar from './ReportingSidebar';
import MonthlyReportsPage from './MonthlyReportsPage';
import SocialMediaReportingPage from './SocialMediaReportingPage';
import PhysicalMarketingReportingPage from './PhysicalMarketingReportingPage';
import GeneratedReportsPage from './GeneratedReportsPage';
import OperationsWinsPage from './OperationsWinsPage';
import OperationsPropertyManagementPage from './OperationsPropertyManagementPage';
import ProjectSwitcher from './ProjectSwitcher';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import PrivateRoute from './PrivateRoute';

function ReportingPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);

  const [wordReports, setWordReports] = useState([]);
  const [projectSpendData, setProjectSpendData] = useState([]);
  const [monthlySpendChartData, setMonthlySpendChartData] = useState([]);
  const [socialMediaSpent, setSocialMediaSpent] = useState(0);
  const [physicalMarketingSpent, setPhysicalMarketingSpent] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);

  const fetchWordReports = useCallback(async () => {
    if (!activeProject) { setWordReports([]); return; }
    try {
      const response = await fetch(`/api/word-reports?project_name=${activeProject.name}`);
      if (!response.ok) return;
      const data = await response.json();
      setWordReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch word reports:", error);
    }
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) {
      setProjectSpendData([]);
      setMonthlySpendChartData([]);
      setSocialMediaSpent(0);
      setPhysicalMarketingSpent(0);
      setTotalSpend(0);
      return;
    }

    const headers = {
      'X-User-Role': currentUser?.role,
      'X-User-Allowed-Projects': JSON.stringify(currentUser?.allowedProjects || []),
    };

    Promise.all([
      fetch(`/api/socialmediaentries?project_name=${encodeURIComponent(activeProject.name)}`, { headers }).then(r => r.json()),
      fetch(`/api/physicalmarketingentries?project_name=${encodeURIComponent(activeProject.name)}`, { headers }).then(r => r.json()),
    ]).then(([socialData, physicalData]) => {
      const socialEntries = (socialData.entries || []).map(e => ({ date: e.date, amount: parseFloat(e.cost) || 0, type: 'socialMedia' }));
      const physicalEntries = (physicalData.entries || []).filter(e => !e.is_archived).map(e => ({ date: e.date, amount: parseFloat(e.cost) || 0, type: 'physicalMarketing' }));
      const combined = [...socialEntries, ...physicalEntries];

      setProjectSpendData(combined);
      setSocialMediaSpent(socialEntries.reduce((s, e) => s + e.amount, 0));
      setPhysicalMarketingSpent(physicalEntries.reduce((s, e) => s + e.amount, 0));
      setTotalSpend(combined.reduce((s, e) => s + e.amount, 0));
    }).catch(err => console.error('Reporting fetch error:', err));

    fetchWordReports();
  }, [activeProject, currentUser, fetchWordReports]);

  useEffect(() => {
    if (projectSpendData.length === 0) { setMonthlySpendChartData([]); return; }
    const monthlyTotals = projectSpendData.reduce((acc, item) => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + item.amount;
      return acc;
    }, {});
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const chartData = Object.entries(monthlyTotals)
      .map(([month, spend]) => ({ month, spend }))
      .filter(({ month }) => {
        const [y, m] = month.split('-').map(Number);
        return new Date(y, m - 1) >= sixMonthsAgo;
      })
      .sort((a, b) => a.month.localeCompare(b.month));
    setMonthlySpendChartData(chartData);
  }, [projectSpendData]);

  return (
    <div className="reporting-page-wrapper">
      <ReportingSidebar />
      <div className="reporting-main-content">
        <ProjectSwitcher />
        <Routes>
          <Route path="/" element={
            <div>
              <div className="reporting-boxes-container">
                <div className="reporting-box">
                  <h4>Total Spend</h4>
                  <p>${totalSpend.toFixed(2)}</p>
                </div>
                <div className="reporting-box">
                  <h4>Social Media</h4>
                  <p>${socialMediaSpent.toFixed(2)}</p>
                </div>
                <div className="reporting-box">
                  <h4>Physical Marketing</h4>
                  <p>${physicalMarketingSpent.toFixed(2)}</p>
                </div>
              </div>
              <div className="budget-container">
                <h3>Monthly Spend (Last 6 Months)</h3>
                {monthlySpendChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlySpendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="spend" fill="#c07481" name="Spend" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>{activeProject ? 'No spend data for this project yet.' : 'Select a project to view spend data.'}</p>
                )}
              </div>
            </div>
          } />
          <Route path="social-media" element={<SocialMediaReportingPage />} />
          <Route path="physical-marketing" element={<PhysicalMarketingReportingPage />} />
          <Route path="monthly-reports" element={<MonthlyReportsPage />} />
          <Route path="generated-reports" element={<GeneratedReportsPage wordReports={wordReports} fetchWordReports={fetchWordReports} />} />
          <Route path="operations/wins" element={<PrivateRoute allowedRoles={['admin', 'admin2']}><OperationsWinsPage /></PrivateRoute>} />
          <Route path="operations/property-management" element={<PrivateRoute allowedRoles={['admin', 'admin2']}><OperationsPropertyManagementPage /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default ReportingPage;
