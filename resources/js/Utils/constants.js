export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  REQUEST: 'request',
  OVERWRITTEN: 'overwritten'
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
  [SUBMISSION_STATUS.PUBLISHED]: 'green',
  [SUBMISSION_STATUS.REQUEST]: 'yellow',
  [SUBMISSION_STATUS.OVERWRITTEN]: 'gray',
  [OVERWRITE_STATUS.PENDING]: 'yellow',
  [OVERWRITE_STATUS.APPROVED]: 'green',
  [OVERWRITE_STATUS.REJECTED]: 'red',
  'not_started': 'gray',
  'not_submitted': 'gray'
};

export const STATUS_LABELS = {
  [SUBMISSION_STATUS.DRAFT]: 'Draft',
  [SUBMISSION_STATUS.SUBMITTED]: 'Submitted',
  [SUBMISSION_STATUS.APPROVED]: 'Approved',
  [SUBMISSION_STATUS.REJECTED]: 'Rejected',
  [SUBMISSION_STATUS.PUBLISHED]: 'Published',
  [SUBMISSION_STATUS.REQUEST]: 'Under Review',
  [SUBMISSION_STATUS.OVERWRITTEN]: 'Overwritten',
  [OVERWRITE_STATUS.PENDING]: 'Pending',
  [OVERWRITE_STATUS.APPROVED]: 'Approved',
  [OVERWRITE_STATUS.REJECTED]: 'Rejected',
  'not_started': 'Not Started',
  'not_submitted': 'Not Submitted'
};

// Note: This should ideally be fetched from settings, not hardcoded
// For now, defaults to current year if settings are not available
export const CURRENT_YEAR = window.__ACADEMIC_YEAR_START__ || new Date().getFullYear();

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};
