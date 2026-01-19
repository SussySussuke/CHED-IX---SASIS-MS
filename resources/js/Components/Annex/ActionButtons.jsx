import React from 'react';

const ActionButtons = ({ editUrl, isPublished, canCancel, onCancel }) => {
  return (
    <div className="flex items-center gap-2">
      <a
        href={editUrl}
        className={`inline-flex items-center justify-center w-7 h-7 transition-colors ${
          isPublished
            ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300'
            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
        }`}
        title={isPublished ? "Edit Request" : "Edit"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </a>
      {canCancel && (
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
          title="Cancel Request"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
