import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ROLES } from './roles';

const DJC_ROLES = [
  'Vision Lead',
  'Operational Lead',
  'Marketing Coordinator',
  'Digital Marketing Manager',
  'Marketing Designer',
  'Photographer',
];

function WorkflowTeam({ projectName }) {
  const { currentUser } = useContext(AuthContext);
  const [team, setTeam] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editUsername, setEditUsername] = useState('');

  const isAdmin = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.ADMIN2;

  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/workflow/team?project_name=${encodeURIComponent(projectName)}`, {
          headers: { 'X-User-Role': currentUser.role },
        });
        if (!response.ok) throw new Error('Failed to load team');
        const data = await response.json();
        setTeam(data.team);
      } catch (error) {
        console.error('Error fetching team:', error);
        alert('Failed to load team assignments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [projectName, currentUser]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          headers: { 'X-User-Role': currentUser.role },
        });
        if (!response.ok) throw new Error('Failed to load users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [isAdmin, currentUser]);

  const handleSave = async (djc_role) => {
    try {
      const response = await fetch('/api/workflow/team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({
          project_name: projectName,
          djc_role,
          assigned_username: editUsername || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to save assignment');
      const updated = await response.json();
      setTeam(prev => {
        const exists = prev.find(t => t.djc_role === djc_role);
        if (exists) return prev.map(t => t.djc_role === djc_role ? updated : t);
        return [...prev, updated];
      });
      setEditingRole(null);
    } catch (error) {
      console.error('Error saving team assignment:', error);
      alert('Failed to save assignment. Please try again.');
    }
  };

  const getAssignment = (djc_role) => team.find(t => t.djc_role === djc_role);

  if (isLoading) return <p className="workflow-loading">Loading team assignments...</p>;

  return (
    <div className="workflow-team">
      <div className="workflow-section-header">
        <h3>Project Team Roles</h3>
      </div>

      <table className="workflow-table">
        <thead>
          <tr>
            <th>DJC Role</th>
            <th>Assigned To</th>
            <th>Assigned At</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {DJC_ROLES.map(role => {
            const assignment = getAssignment(role);
            return (
              <tr key={role}>
                <td><strong>{role}</strong></td>
                {editingRole === role ? (
                  <>
                    <td colSpan={2}>
                      <select
                        value={editUsername}
                        onChange={e => setEditUsername(e.target.value)}
                        style={{ minWidth: 160 }}
                      >
                        <option value="">— Unassigned —</option>
                        {users.map(u => (
                          <option key={u.username} value={u.username}>{u.username}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="workflow-save-btn small" onClick={() => handleSave(role)}>Save</button>
                      <button className="workflow-cancel-btn small" onClick={() => setEditingRole(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {assignment?.assigned_username ? (
                        <span className="team-username">@{assignment.assigned_username}</span>
                      ) : (
                        <span className="team-unassigned">Unassigned</span>
                      )}
                    </td>
                    <td>
                      {assignment?.assigned_at
                        ? new Date(assignment.assigned_at).toLocaleDateString()
                        : '—'}
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="workflow-edit-btn"
                          onClick={() => {
                            setEditingRole(role);
                            setEditUsername(assignment?.assigned_username || '');
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default WorkflowTeam;
