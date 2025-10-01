import React, { useState, useEffect, useContext } from 'react';


import { ProjectContext } from './ProjectContext'; // Import ProjectContext
import './OperationsBudgetPage.css';

export function OperationsBudgetPage() {
  const { activeProject } = useContext(ProjectContext);

  console.log('OperationsBudgetPage mounted/rendered. Active Project:', activeProject);

  const [socialMediaMarketingType, setSocialMediaMarketingType] = useState('');
  const [socialMediaBudgetAmount, setSocialMediaBudgetAmount] = useState('');
  const [socialMediaBudgetInterval, setSocialMediaBudgetInterval] = useState('Monthly');

  const [physicalMarketingType, setPhysicalMarketingType] = useState('');
  const [physicalMarketingBudgetAmount, setPhysicalMarketingBudgetAmount] = useState('');
  const [physicalMarketingBudgetInterval, setPhysicalMarketingBudgetInterval] = useState('Monthly');

  const [allBudgetEntries, setAllBudgetEntries] = useState([]);
  const [socialMediaBudgetEntries, setSocialMediaBudgetEntries] = useState([]);
  const [physicalMarketingBudgetEntries, setPhysicalMarketingBudgetEntries] = useState([]);

  const socialMediaTypes = [
    'Facebook', 'Instagram', 'Google Ads', 'LinkedIn', 'Bluesky', 'Other',
  ];

  const physicalMarketingTypes = [
    'Billboards', 'Podcasts', 'Radio Ads', 'Newspaper', 'Jobsite banners', 'Printed collateral'
  ];


      const refetchBudgetEntries = async () => {
        console.log('refetchBudgetEntries called. Active Project:', activeProject);
        if (!activeProject) {
          setAllBudgetEntries([]);
          setSocialMediaBudgetEntries([]);
          setPhysicalMarketingBudgetEntries([]);
          return;
        }
        try {
          const response = await fetch(`/api/budget-entries?project_name=${activeProject.name}`);      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched budget entries:', data.entries);
      setAllBudgetEntries(data.entries);
    } catch (error) {
      console.error("Failed to fetch budget entries:", error);
      alert('Failed to load budget entries. Please try again.');
    }
  };

  /* eslint-disable-next-line no-undef */
  useEffect(() => {
    console.log('useEffect for fetchBudgetEntries triggered. Active Project:', activeProject);
    refetchBudgetEntries();
  }, [activeProject]);

  /* eslint-disable-next-line no-undef */
  useEffect(() => {
    console.log('useEffect for filtering budget entries triggered. All Budget Entries:', allBudgetEntries);
    setSocialMediaBudgetEntries(allBudgetEntries.filter(entry => socialMediaTypes.includes(entry.type)));
    setPhysicalMarketingBudgetEntries(allBudgetEntries.filter(entry => physicalMarketingTypes.includes(entry.type)));
  }, [allBudgetEntries, socialMediaTypes, physicalMarketingTypes]);

  const handleAddSocialMediaEntry = async () => {
    console.log('handleAddSocialMediaEntry called. Active Project:', activeProject);
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    if (!socialMediaMarketingType || !socialMediaBudgetAmount) {
      alert('Please select a social media marketing type and enter a budget amount.');
      return;
    }

    const newEntryData = {
      projectName: activeProject.name,
      type: socialMediaMarketingType,
      amount: parseFloat(socialMediaBudgetAmount),
      interval: socialMediaBudgetInterval,
    };

    try {
      console.log('Posting new social media entry:', newEntryData);
      const response = await fetch('/api/budget-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    console.log('handleAddPhysicalMarketingEntry called. Active Project:', activeProject);
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    if (!physicalMarketingType || !physicalMarketingBudgetAmount) {
      alert('Please select a physical marketing type and enter a budget amount.');
      return;
    }

    const newEntryData = {
      projectName: activeProject.name,
      type: physicalMarketingType,
      amount: parseFloat(physicalMarketingBudgetAmount),
      interval: physicalMarketingBudgetInterval,
    };

    try {
      console.log('Posting new physical marketing entry:', newEntryData);
      const response = await fetch('/api/budget-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  return (
    <div className="operations-budget-page">
      <h2>Operations Budget</h2>

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
            <button onClick={handleAddSocialMediaEntry}>Add Entry</button>
          </div>

          <div className="budget-entries-list">
            <h3>Current Social Media Budget Entries</h3>
            {socialMediaBudgetEntries.filter(entry => activeProject && entry.projectName === activeProject.name).length === 0 ? (
              <p>No social media budget entries added yet for this project.</p>
            ) : (
              <ul>
                {socialMediaBudgetEntries.filter(entry => activeProject && entry.projectName === activeProject.name).map(entry => (
                  <li key={entry.id}>
                    {entry.type}: ${entry.amount.toFixed(2)} ({entry.interval})
                  </li>
                ))}
              </ul>
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
            <button onClick={handleAddPhysicalMarketingEntry}>Add Entry</button>
          </div>

          <div className="budget-entries-list">
            <h3>Current Physical Marketing Budget Entries</h3>
            {physicalMarketingBudgetEntries.filter(entry => activeProject && entry.projectName === activeProject.name).length === 0 ? (
              <p>No physical marketing budget entries added yet for this project.</p>
            ) : (
              <ul>
                {physicalMarketingBudgetEntries.filter(entry => activeProject && entry.projectName === activeProject.name).map(entry => (
                  <li key={entry.id}>
                    {entry.type}: ${entry.amount.toFixed(2)} ({entry.interval})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}