export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const OVERWRITE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  SUBMIT: 'submit',
  APPROVE: 'approve',
  REJECT: 'reject',
  REQUEST_OVERWRITE: 'request_overwrite'
};

export const STATUS_COLORS = {
  [SUBMISSION_STATUS.DRAFT]: 'gray',
  [SUBMISSION_STATUS.SUBMITTED]: 'blue',
  [SUBMISSION_STATUS.APPROVED]: 'green',
  [SUBMISSION_STATUS.REJECTED]: 'red',
  [OVERWRITE_STATUS.PENDING]: 'yellow',
  [OVERWRITE_STATUS.APPROVED]: 'green',
  [OVERWRITE_STATUS.REJECTED]: 'red'
};

// Note: This should ideally be fetched from settings, not hardcoded
// For now, defaults to current year if settings are not available
export const CURRENT_YEAR = window.__ACADEMIC_YEAR_START__ || new Date().getFullYear();

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};
