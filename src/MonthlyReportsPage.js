import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './MonthlyReportsPage.css';

function MonthlyReportsPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!activeProject || !currentUser) {
        setMonthlyData([]);
        return;
      }

      const headers = {
        'X-User-Role': currentUser.role,
        'X-User-Allowed-Projects': JSON.stringify(currentUser.allowedProjects || []),
      };

      try {
        const physicalResponse = await fetch(`/api/physicalmarketingentries?project_name=${activeProject.name}`, { headers });
        const socialResponse = await fetch(`/api/socialmediaentries?project_name=${activeProject.name}`, { headers });

        if (!physicalResponse.ok || !socialResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const physicalData = await physicalResponse.json();
        const socialData = await socialResponse.json();

        const combinedData = {};

        physicalData.entries.forEach(entry => {
          const month = new Date(entry.date).toLocaleString('default', { month: 'long', year: 'numeric' });
          if (!combinedData[month]) {
            combinedData[month] = { social: 0, physical: 0 };
          }
          combinedData[month].physical += parseFloat(entry.cost) || 0;
        });

        socialData.entries.forEach(entry => {
          const month = new Date(entry.date).toLocaleString('default', { month: 'long', year: 'numeric' });
          if (!combinedData[month]) {
            combinedData[month] = { social: 0, physical: 0 };
          }
          combinedData[month].social += parseFloat(entry.cost) || 0;
        });

        const formattedData = Object.keys(combinedData).map(month => ({
          month,
          socialSpend: combinedData[month].social,
          physicalSpend: combinedData[month].physical,
          totalSpend: combinedData[month].social + combinedData[month].physical,
        }));

        setMonthlyData(formattedData);
      } catch (error) {
        console.error("Failed to fetch monthly report data:", error);
        alert('Failed to load monthly report data. Please try again.');
      }
    };

    fetchEntries();
  }, [activeProject, currentUser]);

  return (
    <div className="monthly-reports-page-container">
      <h2>Monthly Reports for {activeProject ? activeProject.name : '...'}</h2>
      {monthlyData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Social Media Spend</th>
              <th>Physical Marketing Spend</th>
              <th>Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map(data => (
              <tr key={data.month}>
                <td>{data.month}</td>
                <td>${data.socialSpend.toFixed(2)}</td>
                <td>${data.physicalSpend.toFixed(2)}</td>
                <td>${data.totalSpend.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available for the selected project.</p>
      )}
    </div>
  );
}

export default MonthlyReportsPage;