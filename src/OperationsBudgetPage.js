import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ProjectContext } from './ProjectContext'; // Import ProjectContext
import { AuthContext } from './AuthContext'; // Import AuthContext
import './OperationsBudgetPage.css';

const socialMediaTypes = [
  'Facebook', 'Instagram', 'Google Ads', 'LinkedIn', 'Bluesky', 'Other',
];

const physicalMarketingTypes = [
  'Billboards', 'Podcasts', 'Radio Ads', 'Newspaper', 'Jobsite banners', 'Printed collateral'
];

export function OperationsBudgetPage() {
  const { activeProject } = useContext(ProjectContext);
  const { currentUser } = useContext(AuthContext);

  const [socialMediaMarketingType, setSocialMediaMarketingType] = useState('');
  const [socialMediaBudgetAmount, setSocialMediaBudgetAmount] = useState('');
  const [socialMediaBudgetInterval, setSocialMediaBudgetInterval] = useState('Monthly');
  const [socialMediaMonthAllocation, setSocialMediaMonthAllocation] = useState('month 1');

  const [physicalMarketingType, setPhysicalMarketingType] = useState('');
  const [physicalMarketingBudgetAmount, setPhysicalMarketingBudgetAmount] = useState('');
  const [physicalMarketingBudgetInterval, setPhysicalMarketingBudgetInterval] = useState('Monthly');
  const [physicalMarketingMonthAllocation, setPhysicalMarketingMonthAllocation] = useState('month 1');

  const [allBudgetEntries, setAllBudgetEntries] = useState([]);

  const refetchBudgetEntries = useCallback(async () => {
    if (!activeProject) {
      setAllBudgetEntries([]);
      return;
    }
    try {
      const response = await fetch(`/api/budget-entries?project_name=${activeProject.name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllBudgetEntries(data.entries.map(entry => ({
        ...entry,
        amount: parseFloat(entry.amount)
      })));
    } catch (error) {
      console.error("Failed to fetch budget entries:", error);
      alert('Failed to load budget entries. Please try again.');
    }
  }, [activeProject, setAllBudgetEntries]);

  useEffect(() => {
    refetchBudgetEntries();
  }, [activeProject, refetchBudgetEntries]);

  const handleAddSocialMediaEntry = async () => {
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    if (!currentUser) {
      alert('You must be logged in to add a budget entry.');
      return;
    }
    if (!socialMediaMarketingType || !socialMediaBudgetAmount) {
      alert('Please select a social media marketing type and enter a budget amount.');
      return;
    }

    const newEntryData = {
      project_name: activeProject.name,
      type: socialMediaMarketingType,
      amount: parseFloat(socialMediaBudgetAmount),
      interval: socialMediaBudgetInterval,
      month_allocation: socialMediaMonthAllocation,
    };

    try {
      const response = await fetch('/api/budget-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify(newEntryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      alert('Social media budget entry added successfully!');
      setSocialMediaMarketingType('');
      setSocialMediaBudgetAmount('');
      setSocialMediaBudgetInterval('Monthly');
      refetchBudgetEntries(); // Re-fetch entries to update the list
    } catch (error) {
      console.error('Error adding social media budget entry:', error);
      alert('Failed to add social media budget entry. Please try again.');
    }
  };

  const handleAddPhysicalMarketingEntry = async () => {
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    if (!currentUser) {
      alert('You must be logged in to add a budget entry.');
      return;
    }
    if (!physicalMarketingType || !physicalMarketingBudgetAmount) {
      alert('Please select a physical marketing type and enter a budget amount.');
      return;
    }

    const newEntryData = {
      project_name: activeProject.name,
      type: physicalMarketingType,
      amount: parseFloat(physicalMarketingBudgetAmount),
      interval: physicalMarketingBudgetInterval,
      month_allocation: physicalMarketingMonthAllocation,
    };

    try {
      const response = await fetch('/api/budget-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify(newEntryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      alert('Physical marketing budget entry added successfully!');
      setPhysicalMarketingType('');
      setPhysicalMarketingBudgetAmount('');
      setPhysicalMarketingBudgetInterval('Monthly');
      refetchBudgetEntries(); // Re-fetch entries to update the list
    } catch (error) {
      console.error('Error adding physical marketing budget entry:', error);
      alert('Failed to add physical marketing budget entry. Please try again.');
    }
  };

  const handleDeleteEntry = useCallback(async (idToDelete) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('You do not have permission to delete budget entries.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this budget entry?')) {
      try {
        const response = await fetch(`/api/budget-entries/${idToDelete}`, {
          method: 'DELETE',
          headers: {
            'X-User-Role': currentUser.role,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert('Budget entry deleted successfully!');
        refetchBudgetEntries(); // Re-fetch entries to update the list
      } catch (error) {
        console.error('Error deleting budget entry:', error);
        alert('Failed to delete budget entry. Please try again.');
      }
    }
  }, [currentUser, refetchBudgetEntries]);

  const socialMediaFilteredEntries = allBudgetEntries.filter(entry => activeProject && entry.project_name === activeProject.name && socialMediaTypes.includes(entry.type))
    .sort((a, b) => {
      if (a.month_allocation === 'month 1' && b.month_allocation !== 'month 1') return -1;
      if (a.month_allocation !== 'month 1' && b.month_allocation === 'month 1') return 1;
      return 0;
    });
  const physicalMarketingFilteredEntries = allBudgetEntries.filter(entry => activeProject && entry.project_name === activeProject.name && physicalMarketingTypes.includes(entry.type))
    .sort((a, b) => {
      if (a.month_allocation === 'month 1' && b.month_allocation !== 'month 1') return -1;
      if (a.month_allocation !== 'month 1' && b.month_allocation === 'month 1') return 1;
      return 0;
    });

  const socialMediaTotal = socialMediaFilteredEntries.reduce((sum, e) => sum + e.amount, 0);
  const physicalMarketingTotal = physicalMarketingFilteredEntries.reduce((sum, e) => sum + e.amount, 0);
  const grandTotal = socialMediaTotal + physicalMarketingTotal;

  const socialMediaByCategory = socialMediaFilteredEntries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + e.amount;
    return acc;
  }, {});
  const physicalMarketingByCategory = physicalMarketingFilteredEntries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="operations-budget-page">
      <h2>Operations Budget</h2>

      <div className="budget-summary-row">
        <div className="budget-summary-card">
          <div className="budget-summary-label">Social Media Total</div>
          <div className="budget-summary-amount">${socialMediaTotal.toFixed(2)}</div>
        </div>
        <div className="budget-summary-card">
          <div className="budget-summary-label">Physical Marketing Total</div>
          <div className="budget-summary-amount">${physicalMarketingTotal.toFixed(2)}</div>
        </div>
        <div className="budget-summary-card budget-summary-card--total">
          <div className="budget-summary-label">Grand Total</div>
          <div className="budget-summary-amount">${grandTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="budget-columns-container">
        <div className="budget-column">
          <h3>Social Media Budget</h3>
          <div className="budget-input-form">
            <h3>Add New Social Media Budget Entry</h3>
            <div>
              <label htmlFor="socialMediaMarketingType">Marketing Type:</label>
              <select
                id="socialMediaMarketingType"
                value={socialMediaMarketingType}
                onChange={(e) => setSocialMediaMarketingType(e.target.value)}
              >
                <option value="">Select Type</option>
                {socialMediaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="socialMediaBudgetAmount">Budget Amount:</label>
              <input
                type="number"
                id="socialMediaBudgetAmount"
                value={socialMediaBudgetAmount}
                onChange={(e) => setSocialMediaBudgetAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label htmlFor="socialMediaBudgetInterval">Interval:</label>
              <select
                id="socialMediaBudgetInterval"
                value={socialMediaBudgetInterval}
                onChange={(e) => setSocialMediaBudgetInterval(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label htmlFor="socialMediaMonthAllocation">Month Allocation:</label>
              <select
                id="socialMediaMonthAllocation"
                value={socialMediaMonthAllocation}
                onChange={(e) => setSocialMediaMonthAllocation(e.target.value)}
              >
                <option value="month 1">Month 1</option>
                <option value="after">After</option>
              </select>
            </div>

            <button onClick={handleAddSocialMediaEntry}>Add Entry</button>
          </div>

          <div className="budget-entries-list">
            <h3>Current Social Media Budget Entries</h3>
            {socialMediaFilteredEntries.length === 0 ? (
              <p>No social media budget entries added yet for this project.</p>
            ) : (
              <>
                <ul>
                  {socialMediaFilteredEntries.map(entry => (
                    <li key={entry.id} style={{ fontWeight: entry.month_allocation === 'month 1' ? 'bold' : 'normal' }}>
                      {entry.type}: ${entry.amount.toFixed(2)} ({entry.interval}) - {entry.month_allocation}
                      {currentUser && currentUser.role === 'admin' && (
                        <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="budget-category-breakdown">
                  <h4>By Category</h4>
                  {Object.entries(socialMediaByCategory).map(([cat, amt]) => (
                    <div key={cat} className="budget-category-row">
                      <span>{cat}</span>
                      <span>${amt.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="budget-category-row budget-category-row--total">
                    <span>Total</span>
                    <span>${socialMediaTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="budget-column">
          <h3>Physical Marketing Budget</h3>
          <div className="budget-input-form">
            <h3>Add New Physical Marketing Budget Entry</h3>
            <div>
              <label htmlFor="physicalMarketingType">Marketing Type:</label>
              <select
                id="physicalMarketingType"
                value={physicalMarketingType}
                onChange={(e) => setPhysicalMarketingType(e.target.value)}
              >
                <option value="">Select Type</option>
                {physicalMarketingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="physicalMarketingBudgetAmount">Budget Amount:</label>
              <input
                type="number"
                id="physicalMarketingBudgetAmount"
                value={physicalMarketingBudgetAmount}
                onChange={(e) => setPhysicalMarketingBudgetAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label htmlFor="physicalMarketingBudgetInterval">Interval:</label>
              <select
                id="physicalMarketingBudgetInterval"
                value={physicalMarketingBudgetInterval}
                onChange={(e) => setPhysicalMarketingBudgetInterval(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label htmlFor="physicalMarketingMonthAllocation">Month Allocation:</label>
              <select
                id="physicalMarketingMonthAllocation"
                value={physicalMarketingMonthAllocation}
                onChange={(e) => setPhysicalMarketingMonthAllocation(e.target.value)}
              >
                <option value="month 1">Month 1</option>
                <option value="after">After</option>
              </select>
            </div>
            <button onClick={handleAddPhysicalMarketingEntry}>Add Entry</button>
          </div>

          <div className="budget-entries-list">
            <h3>Current Physical Marketing Budget Entries</h3>
            {physicalMarketingFilteredEntries.length === 0 ? (
              <p>No physical marketing budget entries added yet for this project.</p>
            ) : (
              <>
                <ul>
                  {physicalMarketingFilteredEntries.map(entry => (
                    <li key={entry.id} style={{ fontWeight: entry.month_allocation === 'month 1' ? 'bold' : 'normal' }}>
                      {entry.type}: ${entry.amount.toFixed(2)} ({entry.interval}) - {entry.month_allocation}
                      {currentUser && currentUser.role === 'admin' && (
                        <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="budget-category-breakdown">
                  <h4>By Category</h4>
                  {Object.entries(physicalMarketingByCategory).map(([cat, amt]) => (
                    <div key={cat} className="budget-category-row">
                      <span>{cat}</span>
                      <span>${amt.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="budget-category-row budget-category-row--total">
                    <span>Total</span>
                    <span>${physicalMarketingTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
