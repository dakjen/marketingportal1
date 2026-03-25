// Centralized role definitions and permission helpers
export const ROLES = {
  ADMIN: 'admin',
  ADMIN2: 'admin2',
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  VIEW_ONLY: 'view-only',
};

// Can create/edit entries (all staff roles)
export const canEditEntries = (role) =>
  [ROLES.ADMIN, ROLES.ADMIN2, ROLES.INTERNAL].includes(role);

// Can delete entries
export const canDeleteEntries = (role) => role === ROLES.ADMIN;

// Can manage projects
export const canManageProjects = (role) =>
  [ROLES.ADMIN, ROLES.ADMIN2].includes(role);

// Can view messages
export const canViewMessages = (role) =>
  [ROLES.ADMIN, ROLES.INTERNAL].includes(role);

// Can view reporting
export const canViewReporting = (role) => role === ROLES.ADMIN;

// Admin or internal (can see actions column in entry tables)
export const isInternalOrAbove = (role) =>
  [ROLES.ADMIN, ROLES.INTERNAL].includes(role);

// All roles that have any access (for PrivateRoute)
export const ALL_AUTHENTICATED_ROLES = Object.values(ROLES);
