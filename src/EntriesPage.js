import React, { useState } from 'react';
import SocialMediaEntries from './SocialMediaEntries';
import PhysicalMarketingEntries from './PhysicalMarketingEntries';
import './EntriesPage.css';

function EntriesPage() {
  const [tab, setTab] = useState('social');

  return (
    <div className="entries-page">
      <div className="entries-tabs">
        <button
          className={`entries-tab ${tab === 'social' ? 'entries-tab--active' : ''}`}
          onClick={() => setTab('social')}
        >
          Social Media
        </button>
        <button
          className={`entries-tab ${tab === 'physical' ? 'entries-tab--active' : ''}`}
          onClick={() => setTab('physical')}
        >
          Physical Marketing
        </button>
      </div>
      {tab === 'social' ? <SocialMediaEntries /> : <PhysicalMarketingEntries />}
    </div>
  );
}

export default EntriesPage;
