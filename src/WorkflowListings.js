import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { isInternalOrAbove, canDeleteEntries } from './roles';

const LISTING_PLATFORMS = ['Zillow', 'Apartments.com', 'Rent.com', 'HotPads', 'Apartment Guide', 'Custom'];
const LISTING_STATUSES = ['Pending', 'Posted', 'Verified', 'Needs Update'];

const STATUS_COLORS = {
  'Pending': '#888',
  'Posted': '#3b82f6',
  'Verified': '#22c55e',
  'Needs Update': '#f97316',
};

function WorkflowListings({ projectName }) {
  const { currentUser } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newCustomPlatform, setNewCustomPlatform] = useState('');
  const [newStatus, setNewStatus] = useState('Pending');
  const [newUrl, setNewUrl] = useState('');
  const [newPostedDate, setNewPostedDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editPlatform, setEditPlatform] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editPostedDate, setEditPostedDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const canWrite = isInternalOrAbove(currentUser?.role);
  const canDelete = canDeleteEntries(currentUser?.role);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/workflow/listings?project_name=${encodeURIComponent(projectName)}`, {
          headers: { 'X-User-Role': currentUser.role },
        });
        if (!response.ok) throw new Error('Failed to load listings');
        const data = await response.json();
        setListings(data.listings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        alert('Failed to load listings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, [projectName, currentUser]);

  const handleAdd = async () => {
    const platform = newPlatform === 'Custom' ? newCustomPlatform : newPlatform;
    if (!platform) return alert('Please select a platform.');
    try {
      const response = await fetch('/api/workflow/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({
          project_name: projectName,
          platform,
          status: newStatus,
          listing_url: newUrl,
          posted_date: newPostedDate || null,
          notes: newNotes,
        }),
      });
      if (!response.ok) throw new Error('Failed to add listing');
      const added = await response.json();
      setListings(prev => [...prev, added]);
      setShowForm(false);
      setNewPlatform('');
      setNewCustomPlatform('');
      setNewStatus('Pending');
      setNewUrl('');
      setNewPostedDate('');
      setNewNotes('');
    } catch (error) {
      console.error('Error adding listing:', error);
      alert('Failed to add listing. Please try again.');
    }
  };

  const handleEdit = (listing) => {
    setEditingId(listing.id);
    setEditPlatform(listing.platform);
    setEditStatus(listing.status);
    setEditUrl(listing.listing_url || '');
    setEditPostedDate(listing.posted_date ? listing.posted_date.slice(0, 10) : '');
    setEditNotes(listing.notes || '');
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`/api/workflow/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({
          platform: editPlatform,
          status: editStatus,
          listing_url: editUrl,
          posted_date: editPostedDate || null,
          notes: editNotes,
        }),
      });
      if (!response.ok) throw new Error('Failed to update listing');
      const updated = await response.json();
      setListings(prev => prev.map(l => l.id === id ? updated : l));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing entry?')) return;
    try {
      const response = await fetch(`/api/workflow/listings/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Role': currentUser.role },
      });
      if (!response.ok) throw new Error('Failed to delete');
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  if (isLoading) return <p className="workflow-loading">Loading listings...</p>;

  return (
    <div className="workflow-listings">
      <div className="workflow-section-header">
        <h3>Apartment Listings Tracker</h3>
        {canWrite && (
          <button className="workflow-add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Listing'}
          </button>
        )}
      </div>

      {canWrite && showForm && (
        <div className="workflow-form-card">
          <h4>Add Listing</h4>
          <div className="workflow-form-row">
            <label>Platform:</label>
            <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)}>
              <option value="">Select platform</option>
              {LISTING_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {newPlatform === 'Custom' && (
            <div className="workflow-form-row">
              <label>Custom name:</label>
              <input type="text" value={newCustomPlatform} onChange={e => setNewCustomPlatform(e.target.value)} />
            </div>
          )}
          <div className="workflow-form-row">
            <label>Status:</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {LISTING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="workflow-form-row">
            <label>URL:</label>
            <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="workflow-form-row">
            <label>Date Posted:</label>
            <input type="date" value={newPostedDate} onChange={e => setNewPostedDate(e.target.value)} />
          </div>
          <div className="workflow-form-row">
            <label>Notes:</label>
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows="2" />
          </div>
          <button className="workflow-save-btn" onClick={handleAdd}>Save Listing</button>
        </div>
      )}

      {listings.length === 0 ? (
        <p className="workflow-empty">No listings tracked yet. {canWrite ? 'Click "+ Add Listing" to start tracking.' : ''}</p>
      ) : (
        <table className="workflow-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Status</th>
              <th>URL</th>
              <th>Date Posted</th>
              <th>Notes</th>
              <th>Last Updated</th>
              {canWrite && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {listings.map(listing => (
              <tr key={listing.id}>
                {editingId === listing.id ? (
                  <td colSpan={canWrite ? 7 : 6}>
                    <div className="workflow-inline-edit">
                      <label>Platform: <input type="text" value={editPlatform} onChange={e => setEditPlatform(e.target.value)} /></label>
                      <label>Status:
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                          {LISTING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label>URL: <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)} /></label>
                      <label>Date Posted: <input type="date" value={editPostedDate} onChange={e => setEditPostedDate(e.target.value)} /></label>
                      <label>Notes: <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows="1" /></label>
                      <button className="workflow-save-btn small" onClick={() => handleSaveEdit(listing.id)}>Save</button>
                      <button className="workflow-cancel-btn small" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </td>
                ) : (
                  <>
                    <td>{listing.platform}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: STATUS_COLORS[listing.status] || '#888' }}>
                        {listing.status}
                      </span>
                    </td>
                    <td>{listing.listing_url ? <a href={listing.listing_url} target="_blank" rel="noopener noreferrer">View</a> : '—'}</td>
                    <td>{listing.posted_date ? new Date(listing.posted_date).toLocaleDateString() : '—'}</td>
                    <td>{listing.notes || '—'}</td>
                    <td>{new Date(listing.updated_at).toLocaleDateString()}</td>
                    {canWrite && (
                      <td>
                        <button className="workflow-edit-btn" onClick={() => handleEdit(listing)}>Edit</button>
                        {canDelete && <button className="workflow-delete-btn" onClick={() => handleDelete(listing.id)}>Delete</button>}
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default WorkflowListings;
