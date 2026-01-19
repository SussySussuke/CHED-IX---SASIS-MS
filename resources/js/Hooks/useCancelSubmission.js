import { useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Custom hook to handle cancellation of submissions
 * @param {string} annexType - The annex type (e.g., 'annex-a', 'annex-b')
 * @returns {object} - { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose }
 */
export const useCancelSubmission = (annexType) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleCancel = (id) => {
    setSelectedId(id);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = (id, notes) => {
    router.post(`/hei/${annexType}/${id}/cancel`, {
      cancelled_notes: notes
    });
    setShowCancelModal(false);
    setSelectedId(null);
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setSelectedId(null);
  };

  return {
    showCancelModal,
    selectedId,
    handleCancel,
    handleCancelConfirm,
    handleCancelClose
  };
};
