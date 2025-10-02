import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import './Dashboard.css'; // Import the CSS file

function Dashboard({ projects, activeProject, selectProject }) {
  const { currentUser } = useContext(AuthContext);

  const displayProjects = currentUser && currentUser.role === 'external'
    ? projects.filter(project => currentUser.allowedProjects.includes(project.name))
    : projects;
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
    const fetchEntryData = async () => {
      if (!activeProject || !currentUser) {
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

      const headers = {
        'X-User-Role': currentUser.role,
        'X-User-Allowed-Projects': JSON.stringify(currentUser.allowedProjects || []),
      };

      try {
        // Fetch Physical Marketing Entries
        const physicalResponse = await fetch(`/api/physicalmarketingentries?project_name=${activeProject.name}`, { headers });
        if (!physicalResponse.ok) {
          throw new Error(`HTTP error! status: ${physicalResponse.status}`);
        }
        const physicalData = await physicalResponse.json();
        const unarchivedPhysicalEntries = physicalData.entries.filter(entry => !entry.is_archived);
        const parsedPhysicalEntries = unarchivedPhysicalEntries;

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
        } else {
          setFirstMonthPhysicalSpend(0);
          setAverageMonthlyPhysicalSpend(0);
        }

        // Fetch Social Media Entries
        const socialResponse = await fetch(`/api/socialmediaentries?project_name=${activeProject.name}`, { headers });
        if (!socialResponse.ok) {
          throw new Error(`HTTP error! status: ${socialResponse.status}`);
        }
        const socialData = await socialResponse.json();
        const parsedSocialMediaEntries = socialData.entries;

        const calculatedTotalSocialMediaSpend = parsedSocialMediaEntries.reduce((sum, entry) => {
          const cost = parseFloat(entry.cost);
          return isNaN(cost) ? sum : sum + cost;
        }, 0);
        setTotalSocialMediaSpend(calculatedTotalSocialMediaSpend);

        // Calculate Current Month Social Media Spend
        const calculatedCurrentMonthSpendSocial = parsedSocialMediaEntries.reduce((sum, entry) => {
          const entryDate = new Date(entry.date);
          if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
            const cost = parseFloat(entry.cost);
            return isNaN(cost) ? sum : sum + cost;
          }
          return sum;
        }, 0);
        setCurrentMonthSocialMediaSpend(calculatedCurrentMonthSpendSocial);

        // Calculate First Month Social Media Spend and Average Monthly Spend
        if (parsedSocialMediaEntries.length > 0) {
          const sortedEntries = [...parsedSocialMediaEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
          const firstEntryDate = new Date(sortedEntries[0].date);
          const firstMonth = firstEntryDate.getMonth();
          const firstYear = firstEntryDate.getFullYear();

          const calculatedFirstMonthSpendSocial = sortedEntries.reduce((sum, entry) => {
            const entryDate = new Date(entry.date);
            if (entryDate.getMonth() === firstMonth && entryDate.getFullYear() === firstYear) {
              const cost = parseFloat(entry.cost);
              return isNaN(cost) ? sum : sum + cost;
            }
            return sum;
          }, 0);
          setFirstMonthSocialMediaSpend(calculatedFirstMonthSpendSocial);

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
        } else {
          setFirstMonthSocialMediaSpend(0);
          setAverageMonthlySocialMediaSpend(0);
        }

      } catch (error) {
        console.error('Error fetching dashboard entry data:', error);
        alert('Failed to load dashboard data. Please try again.');
      }
    };
    fetchEntryData();
  }, [activeProject, currentUser]);

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
          {displayProjects.map(project => (
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

      <div className="operations-container">
        <OperationsDashboard activeProject={activeProject} />
        <PropertyManagementDashboard activeProject={activeProject} />
      </div>
    </div>
  );
}

function OperationsDashboard({ activeProject }) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [importantDetails, setImportantDetails] = useState('');

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      fetch(`/api/operations-data?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => {
          setProjectDescription(data.project_description || '');
          setImportantDetails(data.important_details || '');
        })
        .catch(err => console.error("Error fetching operations data:", err));
    }
  }, [activeProject]);

  return (
    <div className="operations-column">
      <h2>Operations Dashboard</h2>
      <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <h4>Current Project Details:</h4>
        <p><strong>Project Name:</strong> {projectName || 'N/A'}</p>
        <p><strong>Description:</strong> {projectDescription || 'N/A'}</p>
      </div>
      <div>
        <h4>Important Details:</h4>
        <p>{importantDetails || 'N/A'}</p>
      </div>
    </div>
  );
}

function PropertyManagementDashboard({ activeProject }) {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (activeProject) {
      fetch(`/api/operations-data?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => {
          setContactName(data.contact_name || '');
          setContactPhone(data.contact_phone || '');
          setContactEmail(data.contact_email || '');
          setLinks(data.important_links || []);
        })
        .catch(err => console.error("Error fetching operations data:", err));
    }
  }, [activeProject]);

  return (
    <div className="operations-column">
      <h2>Property Management</h2>
      <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <h4>Point of Contact:</h4>
        <p><strong>Name:</strong> {contactName || 'N/A'}</p>
        <p><strong>Phone:</strong> {contactPhone || 'N/A'}</p>
        <p><strong>Email:</strong> {contactEmail || 'N/A'}</p>
      </div>
      <div>
        <h4>Important Links:</h4>
        {links.length === 0 ? (
          <p>No important links added yet.</p>
        ) : (
          <ul>
            {links.map((link, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
