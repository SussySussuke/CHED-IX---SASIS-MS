/**
 * Get submission status info message for a form
 * @param {object|null} existingSubmission - The existing submission/batch for the selected year
 * @returns {object} Object with type ('info', 'warning', 'success') and message
 */
export const getSubmissionStatusMessage = (existingSubmission) => {
  if (!existingSubmission) {
    return {
      type: 'info',
      message: 'No submission yet for this academic year. You can create a new submission.'
    };
  }

  const status = existingSubmission.status;

  if (status === 'published') {
    return {
      type: 'warning',
      message: 'This academic year has a published submission. Any changes will create an update request that requires admin approval before replacing the published version.'
    };
  }

  if (status === 'submitted' || status === 'request') {
    return {
      type: 'success',
      message: 'This academic year has an existing submission. You can edit and resubmit - it will replace the previous version.'
    };
  }

  // Default for any other status
  return {
    type: 'info',
    message: 'You can create or update submission for this academic year.'
  };
};
