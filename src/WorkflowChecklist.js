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

  const handleToggle = async (item) => {
    if (!isInternalOrAbove(currentUser.role)) return;
    const newChecked = !item.is_checked;
    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: newChecked } : i));

    try {
      const response = await fetch(`/api/workflow/checklist/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({ is_checked: newChecked }),
      });
      if (!response.ok) throw new Error('Failed to update');
      const updated = await response.json();
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      // Revert on error
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: item.is_checked } : i));
      alert('Failed to update item. Please try again.');
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
                    <span className="item-text">{item.item_text}</span>
                  </label>
                  {item.is_checked && item.checked_by_username && (
                    <span className="checked-by">
                      ✓ {item.checked_by_username}
                      {item.checked_at && ` · ${new Date(item.checked_at).toLocaleDateString()}`}
                    </span>
                  )}
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
