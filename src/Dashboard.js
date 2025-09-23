import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Import the CSS file

function Dashboard({ projects, activeProject, selectProject }) {

  const [totalPhysicalSpend, setTotalPhysicalSpend] = useState(0);
  const [currentMonthPhysicalSpend, setCurrentMonthPhysicalSpend] = useState(0);
  const [firstMonthPhysicalSpend, setFirstMonthPhysicalSpend] = useState(0);
  const [averageMonthlyPhysicalSpend, setAverageMonthlyPhysicalSpend] = useState(0);

  const [totalSocialMediaSpend, setTotalSocialMediaSpend] = useState(0);
  const [currentMonthSocialMediaSpend, setCurrentMonthSocialMediaSpend] = useState(0);
  const [firstMonthSocialMediaSpend, setFirstMonthSocialMediaSpend] = useState(0);
  const [averageMonthlySocialMediaSpend, setAverageMonthlySocialMediaSpend] = useState(0);

  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    if (!activeProject) {
      setTotalPhysicalSpend(0);
      setCurrentMonthPhysicalSpend(0);
      setFirstMonthPhysicalSpend(0);
      setAverageMonthlyPhysicalSpend(0);
      setTotalSocialMediaSpend(0);
      setCurrentMonthSocialMediaSpend(0);
      setFirstMonthSocialMediaSpend(0);
      setAverageMonthlySocialMediaSpend(0);
      setTotalSpend(0);
      return;
    }

    const physicalKey = `${activeProject.name}_physicalMarketingEntries`;

    const savedPhysicalEntries = localStorage.getItem(physicalKey);
    if (savedPhysicalEntries) {
      const parsedPhysicalEntries = JSON.parse(savedPhysicalEntries);

      const calculatedTotalPhysicalSpend = parsedPhysicalEntries.reduce((sum, entry) => {
        const cost = parseFloat(entry.cost);
        return isNaN(cost) ? sum : sum + cost;
      }, 0);
      setTotalPhysicalSpend(calculatedTotalPhysicalSpend);

      // Calculate Current Month Physical Spend
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const calculatedCurrentMonthSpend = parsedPhysicalEntries.reduce((sum, entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
          const cost = parseFloat(entry.cost);
          return isNaN(cost) ? sum : sum + cost;
        }
        return sum;
      }, 0);
      setCurrentMonthPhysicalSpend(calculatedCurrentMonthSpend);

      // Calculate First Month Physical Spend and Average Monthly Spend
      if (parsedPhysicalEntries.length > 0) {
        const sortedEntries = [...parsedPhysicalEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstEntryDate = new Date(sortedEntries[0].date);
        const firstMonth = firstEntryDate.getMonth();
        const firstYear = firstEntryDate.getFullYear();

        const calculatedFirstMonthSpend = sortedEntries.reduce((sum, entry) => {
          const entryDate = new Date(entry.date);
          if (entryDate.getMonth() === firstMonth && entryDate.getFullYear() === firstYear) {
            const cost = parseFloat(entry.cost);
            return isNaN(cost) ? sum : sum + cost;
          }
          return sum;
        }, 0);
        setFirstMonthPhysicalSpend(calculatedFirstMonthSpend);

        // Calculate Average Monthly Spend
        const monthlySpends = {};
        sortedEntries.forEach(entry => {
          const entryDate = new Date(entry.date);
          const monthYear = `${entryDate.getMonth()}-${entryDate.getFullYear()}`;
          const cost = parseFloat(entry.cost);
          if (!isNaN(cost)) {
            monthlySpends[monthYear] = (monthlySpends[monthYear] || 0) + cost;
          }
        });

        const numberOfMonths = Object.keys(monthlySpends).length;
        const totalSpendForAllMonths = Object.values(monthlySpends).reduce((sum, spend) => sum + spend, 0);
        setAverageMonthlyPhysicalSpend(numberOfMonths > 0 ? totalSpendForAllMonths / numberOfMonths : 0);
      }
    }

    const socialKey = `${activeProject.name}_socialMediaEntries`;
    const savedSocialMediaEntries = localStorage.getItem(socialKey);
    if (savedSocialMediaEntries) {
      const parsedSocialMediaEntries = JSON.parse(savedSocialMediaEntries);

      const calculatedTotalSocialMediaSpend = parsedSocialMediaEntries.reduce((sum, entry) => {
        const cost = parseFloat(entry.cost);
        return isNaN(cost) ? sum : sum + cost;
      }, 0);
      setTotalSocialMediaSpend(calculatedTotalSocialMediaSpend);

      // Calculate Current Month Social Media Spend
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const calculatedCurrentMonthSpend = parsedSocialMediaEntries.reduce((sum, entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
          const cost = parseFloat(entry.cost);
          return isNaN(cost) ? sum : sum + cost;
        }
        return sum;
      }, 0);
      setCurrentMonthSocialMediaSpend(calculatedCurrentMonthSpend);

      // Calculate First Month Social Media Spend and Average Monthly Spend
      if (parsedSocialMediaEntries.length > 0) {
        const sortedEntries = [...parsedSocialMediaEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstEntryDate = new Date(sortedEntries[0].date);
        const firstMonth = firstEntryDate.getMonth();
        const firstYear = firstEntryDate.getFullYear();

        const calculatedFirstMonthSpend = sortedEntries.reduce((sum, entry) => {
          const entryDate = new Date(entry.date);
          if (entryDate.getMonth() === firstMonth && entryDate.getFullYear() === firstYear) {
            const cost = parseFloat(entry.cost);
            return isNaN(cost) ? sum : sum + cost;
          }
          return sum;
        }, 0);
        setFirstMonthSocialMediaSpend(calculatedFirstMonthSpend);

        // Calculate Average Monthly Spend
        const monthlySpends = {};
        sortedEntries.forEach(entry => {
          const entryDate = new Date(entry.date);
          const monthYear = `${entryDate.getMonth()}-${entryDate.getFullYear()}`;
          const cost = parseFloat(entry.cost);
          if (!isNaN(cost)) {
            monthlySpends[monthYear] = (monthlySpends[monthYear] || 0) + cost;
          }
        });

        const numberOfMonths = Object.keys(monthlySpends).length;
        const totalSpendForAllMonths = Object.values(monthlySpends).reduce((sum, spend) => sum + spend, 0);
        setAverageMonthlySocialMediaSpend(numberOfMonths > 0 ? totalSpendForAllMonths / numberOfMonths : 0);
      }
    }
  }, [activeProject]); // Re-run effect when activeProject changes

  useEffect(() => {
    setTotalSpend(totalPhysicalSpend + totalSocialMediaSpend);
  }, [totalPhysicalSpend, totalSocialMediaSpend]);


const containerClassName = activeProject ? "dashboard-container" : "dashboard-container dashboard-disabled";

 return (
  <div className={containerClassName}>
      {console.log('Dashboard: activeProject:', activeProject, 'projects:', projects)}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Marketing Spend Dashboard</h1>
        <select onChange={(e) => selectProject(e.target.value)} value={activeProject ? activeProject.name : ''}>
          <option value="">Select Project</option>
          {projects.map(project => (
            <option key={project.name} value={project.name}>{project.name}</option>
          ))}
        </select>
      </div>

      {activeProject && <h1 className="project-title">Project: {activeProject.name}</h1>}

      <div className="total-spend-box">
        <h3>Total Spend</h3>
        <p>${totalSpend.toFixed(2)}</p>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-column">
          <h4>Social Media Marketing</h4>
          <div className="metric-box column-total-spend-box">
            <h4>Total Spend</h4>
            <p>${totalSocialMediaSpend.toFixed(2)}</p>
          </div>
          <div className="metric-box monthly-spend-box">
            <h4>Monthly Spend</h4>
            <p>${currentMonthSocialMediaSpend.toFixed(2)}</p>
          </div>
          <div className="two-metric-boxes">
            <div className="metric-box">
              <h4>Month 1</h4>
              <p>${firstMonthSocialMediaSpend.toFixed(2)}</p>
            </div>
            <div className="metric-box">
              <h4>Average Monthly</h4>
              <p>${averageMonthlySocialMediaSpend.toFixed(2)}</p>
            </div >
          </div >
        </div >

        <div className="metric-column">
          <h4>Physical Marketing</h4>
          <div className="metric-box column-total-spend-box">
            <h4>Total Spend</h4>
            <p>${totalPhysicalSpend.toFixed(2)}</p>
          </div>
          <div className="metric-box monthly-spend-box">
            <h4>Monthly Spend</h4>
            <p>${currentMonthPhysicalSpend.toFixed(2)}</p>
          </div>
          <div className="two-metric-boxes">
            <div className="metric-box">
              <h4>Month 1</h4>
              <p>${firstMonthPhysicalSpend.toFixed(2)}</p>
            </div>
            <div className="metric-box">
              <h4>Average Monthly</h4>
              <p>${averageMonthlyPhysicalSpend.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
