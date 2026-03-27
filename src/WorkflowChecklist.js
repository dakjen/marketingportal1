import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { isInternalOrAbove } from './roles';

const CATEGORY_ORDER = [
  'Preparation',
  'Social Media Setup',
  'Social Media Campaigns',
  'Apartment Listings',
  'Physical Marketing',
];

function WorkflowChecklist({ projectName }) {
  const { currentUser } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState(CATEGORY_ORDER[0]);
  const [newText, setNewText] = useState('');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'admin2';

  useEffect(() => {
    const fetchChecklist = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/workflow/checklist?project_name=${encodeURIComponent(projectName)}`, {
          headers: { 'X-User-Role': currentUser.role },
        });
        if (!response.ok) throw new Error('Failed to load checklist');
        const data = await response.json();
        setItems(data.items);
      } catch (error) {
        console.error('Error fetching checklist:', error);
        alert('Failed to load checklist. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchChecklist();
  }, [projectName, currentUser]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/users', { headers: { 'X-User-Role': currentUser.role } })
      .then(r => r.json())
      .then(data => setUsers(data.users || []))
      .catch(() => {});
  }, [isAdmin, currentUser]);

  const handleToggle = async (item) => {
    if (!isInternalOrAbove(currentUser.role)) return;
    const newChecked = !item.is_checked;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: newChecked } : i));
    try {
      const response = await fetch(`/api/workflow/checklist/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role, 'X-User-Username': currentUser.username },
        body: JSON.stringify({ is_checked: newChecked }),
      });
      if (!response.ok) throw new Error('Failed to update');
      const updated = await response.json();
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: item.is_checked } : i));
      alert('Failed to update item. Please try again.');
    }
  };

  const handleAssign = async (itemId, username) => {
    try {
      const response = await fetch(`/api/workflow/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role, 'X-User-Username': currentUser.username },
        body: JSON.stringify({ assigned_to: username || null }),
      });
      if (!response.ok) throw new Error('Failed to assign');
      const updated = await response.json();
      setItems(prev => prev.map(i => i.id === itemId ? updated : i));
    } catch {
      alert('Failed to assign task.');
    } finally {
      setAssigningId(null);
    }
  };

  const handleEditSave = async (itemId) => {
    if (!editText.trim()) return;
    try {
      const response = await fetch(`/api/workflow/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role, 'X-User-Username': currentUser.username },
        body: JSON.stringify({ item_text: editText.trim() }),
      });
      if (!response.ok) throw new Error('Failed to save');
      const updated = await response.json();
      setItems(prev => prev.map(i => i.id === itemId ? updated : i));
    } catch {
      alert('Failed to save edit.');
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Remove this checklist item?')) return;
    try {
      const response = await fetch(`/api/workflow/checklist/${itemId}`, {
        method: 'DELETE',
        headers: { 'X-User-Role': currentUser.role },
      });
      if (!response.ok) throw new Error('Failed to delete');
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      alert('Failed to delete item.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      const response = await fetch('/api/workflow/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role },
        body: JSON.stringify({ project_name: projectName, category: newCategory, item_text: newText.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add');
      const added = await response.json();
      setItems(prev => [...prev, added]);
      setNewText('');
      setShowAddForm(false);
    } catch {
      alert('Failed to add item.');
    }
  };

  const groupedItems = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {});

  const totalItems = items.length;
  const checkedItems = items.filter(i => i.is_checked).length;
  const progressPct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  if (isLoading) return <p className="workflow-loading">Loading checklist...</p>;

  return (
    <div className="workflow-checklist">
      <div className="checklist-progress">
        <div className="progress-label">
          <span>Overall Progress</span>
          <span>{checkedItems} / {totalItems} completed ({progressPct}%)</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          {showAddForm ? (
            <form onSubmit={handleAddItem} className="workflow-form-card">
              <h4>Add Checklist Item</h4>
              <div className="workflow-form-row">
                <label>Category:</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                  {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="workflow-form-row">
                <label>Task:</label>
                <input type="text" value={newText} onChange={e => setNewText(e.target.value)} placeholder="Describe the task..." autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="submit" className="workflow-save-btn">Add Item</button>
                <button type="button" className="workflow-cancel-btn" onClick={() => { setShowAddForm(false); setNewText(''); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="workflow-add-btn" onClick={() => setShowAddForm(true)}>+ Add Item</button>
          )}
        </div>
      )}

      {CATEGORY_ORDER.map(category => {
        const categoryItems = groupedItems[category] || [];
        const catChecked = categoryItems.filter(i => i.is_checked).length;
        return (
          <div key={category} className="checklist-category">
            <div className="checklist-category-header">
              <h4>{category}</h4>
              <span className="category-count">{catChecked}/{categoryItems.length}</span>
            </div>
            <ul className="checklist-items">
              {categoryItems.map(item => (
                <li key={item.id} className={`checklist-item ${item.is_checked ? 'checked' : ''}`}>
                  <label className="checklist-label">
                    <input
                      type="checkbox"
                      checked={item.is_checked}
                      onChange={() => handleToggle(item)}
                      disabled={!isInternalOrAbove(currentUser.role)}
                    />
                    {editingId === item.id ? (
                      <input
                        className="checklist-edit-input"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEditSave(item.id); if (e.key === 'Escape') setEditingId(null); }}
                        autoFocus
                      />
                    ) : (
                      <span className="item-text">{item.item_text}</span>
                    )}
                  </label>

                  <div className="checklist-item-meta">
                    {item.assigned_to && (
                      <span className="checklist-assigned-badge">@{item.assigned_to}</span>
                    )}
                    {item.is_checked && item.checked_by_username && (
                      <span className="checked-by">
                        ✓ {item.checked_by_username}
                        {item.checked_at && ` · ${new Date(item.checked_at).toLocaleDateString()}`}
                      </span>
                    )}
                    {isAdmin && (
                      <>
                        {editingId === item.id ? (
                          <>
                            <button className="workflow-save-btn small" onClick={() => handleEditSave(item.id)}>Save</button>
                            <button className="workflow-cancel-btn small" onClick={() => setEditingId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            {assigningId === item.id ? (
                              <select
                                className="checklist-assign-select"
                                defaultValue={item.assigned_to || ''}
                                autoFocus
                                onChange={e => handleAssign(item.id, e.target.value)}
                                onBlur={() => setAssigningId(null)}
                              >
                                <option value="">— Unassigned —</option>
                                {users.map(u => (
                                  <option key={u.username} value={u.username}>{u.username}</option>
                                ))}
                              </select>
                            ) : (
                              <button className="checklist-assign-btn" onClick={() => setAssigningId(item.id)}>
                                {item.assigned_to ? 'Reassign' : 'Assign'}
                              </button>
                            )}
                            <button className="checklist-assign-btn" onClick={() => { setEditingId(item.id); setEditText(item.item_text); }}>Edit</button>
                            <button className="checklist-delete-btn" onClick={() => handleDelete(item.id)}>✕</button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default WorkflowChecklist;
