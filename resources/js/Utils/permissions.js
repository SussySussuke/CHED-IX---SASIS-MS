import { ROLES } from './roles';

export const PERMISSIONS = {
  // SuperAdmin permissions
  MANAGE_ADMINS: 'manage_admins',
  VIEW_SYSTEM_AUDIT: 'view_system_audit',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',

  // Admin permissions
  MANAGE_HEI_ACCOUNTS: 'manage_hei_accounts',
  REVIEW_SUBMISSIONS: 'review_submissions',
  APPROVE_OVERWRITES: 'approve_overwrites',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  EXPORT_DATA: 'export_data',

  // HEI permissions
  CREATE_SUBMISSION: 'create_submission',
  VIEW_OWN_SUBMISSIONS: 'view_own_submissions',
  REQUEST_OVERWRITE: 'request_overwrite',
  VIEW_NOTIFICATIONS: 'view_notifications'
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.VIEW_SYSTEM_AUDIT,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_HEI_ACCOUNTS,
    PERMISSIONS.REVIEW_SUBMISSIONS,
    PERMISSIONS.APPROVE_OVERWRITES,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_HEI_ACCOUNTS,
    PERMISSIONS.REVIEW_SUBMISSIONS,
    PERMISSIONS.APPROVE_OVERWRITES,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.HEI]: [
    PERMISSIONS.CREATE_SUBMISSION,
    PERMISSIONS.VIEW_OWN_SUBMISSIONS,
    PERMISSIONS.REQUEST_OVERWRITE,
    PERMISSIONS.VIEW_NOTIFICATIONS
  ]
};

export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

export const canManageAdmins = (user) => hasPermission(user, PERMISSIONS.MANAGE_ADMINS);
export const canManageHEI = (user) => hasPermission(user, PERMISSIONS.MANAGE_HEI_ACCOUNTS);
export const canReviewSubmissions = (user) => hasPermission(user, PERMISSIONS.REVIEW_SUBMISSIONS);
export const canApproveOverwrites = (user) => hasPermission(user, PERMISSIONS.APPROVE_OVERWRITES);
export const canExportData = (user) => hasPermission(user, PERMISSIONS.EXPORT_DATA);
