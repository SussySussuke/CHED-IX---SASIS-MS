export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  HEI: 'hei'
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.ADMIN]: 'CHED Administrator',
  [ROLES.HEI]: 'HEI User'
};

export const hasRole = (user, role) => {
  if (!user) return false;
  return user.role === role;
};

export const isSuperAdmin = (user) => hasRole(user, ROLES.SUPER_ADMIN);
export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);
export const isHEI = (user) => hasRole(user, ROLES.HEI);
