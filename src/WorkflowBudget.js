import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ROLES } from './roles';

const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'Bluesky', 'Pinterest', 'YouTube'];
const PHYSICAL_TYPES = ['Billboards', 'Podcasts', 'Radio Ads', 'Newspaper', 'Jobsite banners', 'Printed collateral', 'Community Engagement', 'Website'];


const fmt = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function BudgetTable({ rows, actuals, isAdmin, editingId, editAmount, editPeriod, setEditAmount, setEditPeriod, setEditingId, onSave, onDelete }) {
  if (rows.length === 0) return null;

  return (
    <table className="workflow-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Type</th>
          <th>Budgeted</th>
          <th>Actual Spend</th>
          <th>Difference</th>
          <th>% Used</th>
          {isAdmin && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map(b => {
          const actual = actuals[b.category] || 0;
          const budgeted = parseFloat(b.amount);
          const diff = budgeted - actual;
          const pct = budgeted > 0 ? Math.round((actual / budgeted) * 100) : null;
          const overBudget = actual > budgeted && budgeted > 0;

          return (
            <tr key={b.id}>
              <td>{b.category}</td>
              <td><span className={`budget-type-badge ${b.budget_type}`}>{b.budget_type === 'social' ? 'Social' : 'Physical'}</span></td>
              <td>
                {editingId === b.id ? (
                  <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{ width: 80 }} />
                ) : (
                  fmt(budgeted)
                )}
              </td>
              <td>{fmt(actual)}</td>
              <td className={overBudget ? 'over-budget' : 'under-budget'}>
                {budgeted > 0 ? (overBudget ? '-' : '+') + fmt(Math.abs(diff)) : '—'}
              </td>
              <td className={overBudget ? 'over-budget' : ''}>
                {pct !== null ? `${pct}%` : '—'}
              </td>
              {isAdmin && (
                <td>
                  {editingId === b.id ? (
                    <>
                      <button className="workflow-save-btn small" onClick={() => onSave(b.category, b.budget_type, editAmount, b.period)}>Save</button>
                      <button className="workflow-cancel-btn small" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="workflow-edit-btn" onClick={() => { setEditingId(b.id); setEditAmount(b.amount); setEditPeriod(b.period); }}>Edit</button>
                      <button className="workflow-delete-btn" onClick={() => onDelete(b.id)}>Delete</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function WorkflowBudget({ projectName }) {
  const { currentUser } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [actuals, setActuals] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [newBudgetType, setNewBudgetType] = useState('social');
  const [newAmount, setNewAmount] = useState('');
  const [newPeriod, setNewPeriod] = useState('month1');

  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editPeriod, setEditPeriod] = useState('month1');

  const isAdmin = currentUser?.role === ROLES.ADMIN;

  const fetchBudget = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflow/budget?project_name=${encodeURIComponent(projectName)}`, {
        headers: { 'X-User-Role': currentUser.role },
      });
      if (!response.ok) throw new Error('Failed to load budget');
      const data = await response.json();
      setBudgets(data.budgets);
      setActuals(data.actuals);
    } catch (error) {
      console.error('Error fetching budget:', error);
      alert('Failed to load budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [projectName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveBudget = async (category, budget_type, amount, period) => {
    try {
      const response = await fetch('/api/workflow/budget', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({ project_name: projectName, category, budget_type, amount: parseFloat(amount), period }),
      });
      if (!response.ok) throw new Error('Failed to save budget');
      await fetchBudget();
      setEditingId(null);
      setShowAddForm(false);
      setNewCategory('');
      setNewCustomCategory('');
      setNewAmount('');
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget line?')) return;
    try {
      const response = await fetch(`/api/workflow/budget/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Role': currentUser.role },
      });
      if (!response.ok) throw new Error('Failed to delete');
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget line. Please try again.');
    }
  };

  const categoryOptions = newBudgetType === 'social' ? SOCIAL_PLATFORMS : PHYSICAL_TYPES;
  const month1Rows = budgets.filter(b => b.period === 'month1');
  const cadenceRows = budgets.filter(b => b.period === 'cadence' || b.period === 'monthly' || b.period === 'one-time');

  const budgetCategories = new Set(budgets.map(b => b.category));
  const unbudgetedCategories = Object.keys(actuals).filter(cat => !budgetCategories.has(cat));

  const tableProps = { actuals, isAdmin, editingId, editAmount, editPeriod, setEditAmount, setEditPeriod, setEditingId, onSave: handleSaveBudget, onDelete: handleDelete };

  if (isLoading) return <p className="workflow-loading">Loading budget data...</p>;

  return (
    <div className="workflow-budget">
      <div className="workflow-section-header">
        <h3>Budget vs. Actuals</h3>
        {isAdmin && (
          <button className="workflow-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Budget Line'}
          </button>
        )}
      </div>

      {isAdmin && showAddForm && (
        <div className="workflow-form-card">
          <h4>Add Budget Line</h4>
          <div className="workflow-form-row">
            <label>Phase:</label>
            <select value={newPeriod} onChange={e => setNewPeriod(e.target.value)}>
              <option value="month1">Month 1 — Launch</option>
              <option value="cadence">Monthly Cadence</option>
            </select>
          </div>
          <div className="workflow-form-row">
            <label>Type:</label>
            <select value={newBudgetType} onChange={e => { setNewBudgetType(e.target.value); setNewCategory(''); }}>
              <option value="social">Social Media</option>
              <option value="physical">Physical Marketing</option>
            </select>
          </div>
          <div className="workflow-form-row">
            <label>Category:</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              <option value="">Select category</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__custom">Custom...</option>
            </select>
          </div>
          {newCategory === '__custom' && (
            <div className="workflow-form-row">
              <label>Custom name:</label>
              <input type="text" value={newCustomCategory} onChange={e => setNewCustomCategory(e.target.value)} placeholder="e.g. TikTok" />
            </div>
          )}
          <div className="workflow-form-row">
            <label>Amount ($):</label>
            <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} min="0" step="0.01" />
          </div>
          <button
            className="workflow-save-btn"
            onClick={() => {
              const cat = newCategory === '__custom' ? newCustomCategory : newCategory;
              if (!cat || !newAmount) return alert('Please fill in all fields.');
              handleSaveBudget(cat, newBudgetType, newAmount, newPeriod);
            }}
          >
            Save
          </button>
        </div>
      )}

      {budgets.length === 0 && unbudgetedCategories.length === 0 ? (
        <p className="workflow-empty">No budget lines set. {isAdmin ? 'Click "+ Add Budget Line" to get started.' : 'An admin can add budget lines for this project.'}</p>
      ) : (
        <>
          {month1Rows.length > 0 && (
            <div className="budget-phase-section">
              <h4 className="budget-phase-heading">Month 1 — Launch</h4>
              <BudgetTable rows={month1Rows} {...tableProps} />
            </div>
          )}
          {cadenceRows.length > 0 && (
            <div className="budget-phase-section">
              <h4 className="budget-phase-heading">Monthly Cadence</h4>
              <BudgetTable rows={cadenceRows} {...tableProps} />
            </div>
          )}
          {unbudgetedCategories.length > 0 && (
            <div className="budget-phase-section">
              <h4 className="budget-phase-heading">Unbudgeted Actuals</h4>
              <table className="workflow-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Budgeted</th>
                    <th>Actual Spend</th>
                    <th>Difference</th>
                    <th>% Used</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {unbudgetedCategories.map(cat => (
                    <tr key={`unbudgeted-${cat}`} className="unbudgeted-row">
                      <td>{cat}</td>
                      <td>—</td>
                      <td className="unbudgeted-label">No budget set</td>
                      <td>{fmt(actuals[cat] || 0)}</td>
                      <td>—</td>
                      <td>—</td>
                      {isAdmin && <td></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WorkflowBudget;
