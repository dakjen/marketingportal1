import React, { useState } from 'react';
import './OperationsBudgetPage.css';

function OperationsBudgetPage() {
  const [marketingType, setMarketingType] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetInterval, setBudgetInterval] = useState('Monthly');
  const [budgetEntries, setBudgetEntries] = useState([]);

  const allMarketingTypes = [
    'Facebook', 'Instagram', 'Google Ads', 'LinkedIn', 'Bluesky', 'Other',
    'Billboards', 'Podcasts', 'Radio Ads', 'Newspaper', 'Jobsite banners', 'Printed collateral'
  ];

  const handleAddEntry = () => {
    if (!marketingType || !budgetAmount) {
      alert('Please select a marketing type and enter a budget amount.');
      return;
    }
    const newEntry = {
      id: budgetEntries.length + 1,
      type: marketingType,
      amount: parseFloat(budgetAmount),
      interval: budgetInterval,
    };
    setBudgetEntries(prevEntries => [...prevEntries, newEntry]);
    setMarketingType('');
    setBudgetAmount('');
    setBudgetInterval('Monthly');
  };

  return (
    <div className="operations-budget-page">
      <h2>Operations Budget</h2>

      <div className="budget-input-form">
        <h3>Add New Budget Entry</h3>
        <div>
          <label htmlFor="marketingType">Marketing Type:</label>
          <select
            id="marketingType"
            value={marketingType}
            onChange={(e) => setMarketingType(e.target.value)}
          >
            <option value="">Select Type</option>
            {allMarketingTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budgetAmount">Budget Amount:</label>
          <input
            type="number"
            id="budgetAmount"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label htmlFor="budgetInterval">Interval:</label>
          <select
            id="budgetInterval"
            value={budgetInterval}
            onChange={(e) => setBudgetInterval(e.target.value)}
          >
            <option value="Monthly">Monthly</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
        <button onClick={handleAddEntry}>Add Entry</button>
      </div>

      <div className="budget-entries-list">
        <h3>Current Budget Entries</h3>
        {budgetEntries.length === 0 ? (
          <p>No budget entries added yet.</p>
        ) : (
          <ul>
            {budgetEntries.map(entry => (
              <li key={entry.id}>
                {entry.type}: ${entry.amount.toFixed(2)} ({entry.interval})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="budget-columns-container">
        <div className="budget-column">
          <h3>Social Media Budget</h3>
          <p>Details for Social Media Budget...</p>
        </div>
        <div className="budget-column">
          <h3>Physical Marketing Budget</h3>
          <p>Details for Physical Marketing Budget...</p>
        </div>
      </div>
    </div>
  );
}