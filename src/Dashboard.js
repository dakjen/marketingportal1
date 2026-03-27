import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import { canEditEntries, canManageProjects, canViewMessages, canViewReporting } from './roles';
import './Dashboard.css';

const NAV_CARDS = (role) => [
  canEditEntries(role) && {
    label: 'Log Entries',
    icon: '✏️',
    desc: 'Add social media or physical marketing entries',
    path: '/social-media',
  },
  canViewReporting(role) && {
    label: 'Reporting',
    icon: '📊',
    desc: 'Campaign analytics, reports, and budget overview',
    path: '/reporting',
  },
  canViewMessages(role) && {
    label: 'Messages',
    icon: '💬',
    desc: 'Team communications and project updates',
    path: '/messages',
  },
  {
    label: 'Workflow',
    icon: '✅',
    desc: 'Campaign checklist, listings, and team assignments',
    path: '/workflow',
  },
  canManageProjects(role) && {
    label: 'Project Management',
    icon: '🏗️',
    desc: 'Manage projects, users, and project settings',
    path: '/project-management',
  },
].filter(Boolean);

function Dashboard({ activeProject, selectProject }) {
  const { currentUser } = useContext(AuthContext);
  const { allProjects } = useContext(ProjectContext);
  const navigate = useNavigate();

  const displayProjects = (() => {
    if (!currentUser || !allProjects) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'admin2') return allProjects;
    if (currentUser.allowedProjects?.includes('*')) return allProjects;
    return allProjects.filter(p => (currentUser.allowedProjects || []).includes(p.name));
  })();

  const [totalSocialSpend, setTotalSocialSpend] = useState(0);
  const [totalPhysicalSpend, setTotalPhysicalSpend] = useState(0);
  const [currentMonthSocialSpend, setCurrentMonthSocialSpend] = useState(0);
  const [currentMonthPhysicalSpend, setCurrentMonthPhysicalSpend] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    if (!activeProject || !currentUser) {
      setTotalSocialSpend(0);
      setTotalPhysicalSpend(0);
      setCurrentMonthSocialSpend(0);
      setCurrentMonthPhysicalSpend(0);
      return;
    }

    const headers = {
      'X-User-Role': currentUser.role,
      'X-User-Allowed-Projects': JSON.stringify(currentUser.allowedProjects || []),
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const sumByMonth = (entries) =>
      entries.reduce((sum, e) => {
        const d = new Date(e.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const c = parseFloat(e.cost);
          return isNaN(c) ? sum : sum + c;
        }
        return sum;
      }, 0);

    const sumAll = (entries) =>
      entries.reduce((sum, e) => {
        const c = parseFloat(e.cost);
        return isNaN(c) ? sum : sum + c;
      }, 0);

    Promise.all([
      fetch(`/api/socialmediaentries?project_name=${activeProject.name}`, { headers }).then(r => r.json()),
      fetch(`/api/physicalmarketingentries?project_name=${activeProject.name}`, { headers }).then(r => r.json()),
    ]).then(([socialData, physicalData]) => {
      const social = socialData.entries || [];
      const physical = (physicalData.entries || []).filter(e => !e.is_archived);
      setTotalSocialSpend(sumAll(social));
      setTotalPhysicalSpend(sumAll(physical));
      setCurrentMonthSocialSpend(sumByMonth(social));
      setCurrentMonthPhysicalSpend(sumByMonth(physical));
    }).catch(err => console.error('Dashboard fetch error:', err));
  }, [activeProject, currentUser]);

  useEffect(() => {
    if (!activeProject || !currentUser) { setPendingTasks([]); return; }
    fetch(`/api/workflow/checklist?project_name=${encodeURIComponent(activeProject.name)}`, {
      headers: { 'X-User-Role': currentUser.role },
    })
      .then(r => r.ok ? r.json() : { items: [] })
      .then(data => setPendingTasks((data.items || []).filter(i => !i.is_checked).slice(0, 5)))
      .catch(() => setPendingTasks([]));
  }, [activeProject, currentUser]);

  const totalSpend = totalSocialSpend + totalPhysicalSpend;
  const currentMonthTotal = currentMonthSocialSpend + currentMonthPhysicalSpend;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-greeting">
            Welcome back{currentUser ? `, ${currentUser.username}` : ''}.
          </h1>
          {activeProject && (
            <p className="dashboard-project-label">Active project: <strong>{activeProject.name}</strong></p>
          )}
        </div>
        <select
          className="dashboard-project-select"
          onChange={(e) => selectProject(e.target.value)}
          value={activeProject ? activeProject.name : ''}
        >
          <option value="">Select Project</option>
          {displayProjects.map(p => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Quick Nav Cards */}
      <div className="dashboard-nav-grid">
        {NAV_CARDS(currentUser?.role).map(card => (
          <button
            key={card.label}
            className="dashboard-nav-card"
            onClick={() => navigate(card.path)}
          >
            <span className="dashboard-nav-icon">{card.icon}</span>
            <span className="dashboard-nav-label">{card.label}</span>
            <span className="dashboard-nav-desc">{card.desc}</span>
          </button>
        ))}
      </div>

      {/* Spend + Pending Tasks */}
      <div className="dashboard-lower">
        {/* Spend Summary */}
        <div className="dashboard-spend-section">
          <h2 className="dashboard-section-title">Spend Summary</h2>
          {activeProject ? (
            <div className="dashboard-spend-grid">
              <div className="dashboard-spend-card dashboard-spend-card--total">
                <div className="dashboard-spend-num">${totalSpend.toFixed(2)}</div>
                <div className="dashboard-spend-lbl">Total Spend</div>
              </div>
              <div className="dashboard-spend-card">
                <div className="dashboard-spend-num">${currentMonthTotal.toFixed(2)}</div>
                <div className="dashboard-spend-lbl">This Month</div>
              </div>
              <div className="dashboard-spend-card">
                <div className="dashboard-spend-num">${totalSocialSpend.toFixed(2)}</div>
                <div className="dashboard-spend-lbl">Social Media Total</div>
              </div>
              <div className="dashboard-spend-card">
                <div className="dashboard-spend-num">${totalPhysicalSpend.toFixed(2)}</div>
                <div className="dashboard-spend-lbl">Physical Marketing Total</div>
              </div>
            </div>
          ) : (
            <p className="dashboard-empty">Select a project to see spend data.</p>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="dashboard-tasks-section">
          <h2 className="dashboard-section-title">
            Pending Workflow Items
            {activeProject && <button className="dashboard-tasks-link" onClick={() => navigate('/workflow')}>View all →</button>}
          </h2>
          {!activeProject ? (
            <p className="dashboard-empty">Select a project to see pending tasks.</p>
          ) : pendingTasks.length === 0 ? (
            <p className="dashboard-empty dashboard-empty--success">✓ All checklist items complete!</p>
          ) : (
            <ul className="dashboard-task-list">
              {pendingTasks.map(task => (
                <li key={task.id} className="dashboard-task-item">
                  <span className="dashboard-task-category">{task.category}</span>
                  <span className="dashboard-task-label">{task.item_text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
