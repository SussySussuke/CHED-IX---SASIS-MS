import React from 'react';

/**
 * Modal to display detailed evidence for a specific annex row
 * Supports all Annexes A-O with dynamic field rendering
 */
const EvidenceModal = ({ isOpen, onClose, rowData, annexType }) => {
  if (!isOpen || !rowData) return null;

  // Generic field renderer - displays ALL fields with SQL column names
  const renderAllFields = () => {
    // Exclude system/metadata fields that are already shown in the table
    const fieldsToExclude = ['id', 'batch_id', 'hei_remarks', 'ched_remark', 'ched_remark_id', 'is_missing', 'created_at', 'updated_at', 'face_to_face', 'online'];
    const allFields = Object.entries(rowData).filter(([key]) =>
      !key.startsWith('_') && !fieldsToExclude.includes(key)
    );

    return (
      <div className="space-y-3">
        {allFields.map(([key, value]) => {
          // Display null/undefined as 'NULL' for clarity
          let displayValue = value === null || value === undefined ? 'NULL' : value;

          // Handle boolean values
          if (typeof value === 'boolean') {
            return (
              <div key={key} className="grid grid-cols-3 gap-2 items-center">
                <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{key}</code>
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={value}
                    readOnly
                    className="pointer-events-none"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {value ? 'true' : 'false'}
                  </span>
                </div>
              </div>
            );
          }

          // Handle date/datetime values (ISO 8601 format)
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T|\s)/.test(value)) {
            const date = new Date(value);
            // Format as: Sep 15, 2024 or Sep 15, 2024 12:30 PM
            const hasTime = value.includes('T') || value.includes(':');
            displayValue = hasTime
              ? date.toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
          }

          // Handle all other values
          return (
            <div key={key} className="grid grid-cols-3 gap-2 items-start">
              <code className="text-xs font-mono text-gray-600 dark:text-gray-400 pt-2">{key}</code>
              <p className="col-span-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded break-words">
                {displayValue.toString()}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAnnexAFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Title of the Program
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
          {rowData.title || '-'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Venue
          </label>
          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {rowData.venue || '-'}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Implementation Date
          </label>
          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {rowData.implementation_date || '-'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Target Group
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
          {rowData.target_group || '-'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Face-to-Face Participants
          </label>
          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {rowData.participants_face_to_face || 0}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Online Participants
          </label>
          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {rowData.participants_online || 0}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Organizer
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
          {rowData.organizer || '-'}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          HEI Remarks
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded min-h-[60px]">
          {rowData.hei_remarks || '-'}
        </p>
      </div>
    </div>
  );

  const renderAnnexBFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Course Code
          </label>
          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {rowData.course_code || '-'}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Mode of Delivery
          </label>
          <div className="flex gap-3 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={rowData.face_to_face}
                readOnly
                className="pointer-events-none"
              />
              <span className="text-sm text-gray-900 dark:text-white">Face-to-Face</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={rowData.online}
                readOnly
                className="pointer-events-none"
              />
              <span className="text-sm text-gray-900 dark:text-white">Online</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Course Title
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
          {rowData.course_title || '-'}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          HEI Remarks
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded min-h-[60px]">
          {rowData.hei_remarks || '-'}
        </p>
      </div>
    </div>
  );

  const renderAnnexCFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Course Code
          </label>
          <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {rowData.course_code || '-'}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Mode of Delivery
          </label>
          <div className="flex gap-3 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={rowData.face_to_face}
                readOnly
                className="pointer-events-none"
              />
              <span className="text-sm text-gray-900 dark:text-white">Face-to-Face</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={rowData.online}
                readOnly
                className="pointer-events-none"
              />
              <span className="text-sm text-gray-900 dark:text-white">Online</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Course Title
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
          {rowData.course_title || '-'}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          HEI Remarks
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded min-h-[60px]">
          {rowData.hei_remarks || '-'}
        </p>
      </div>
    </div>
  );

  const renderAnnexDFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Handbook Type
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
          {rowData.handbook_type || '-'}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Mode of Delivery
        </label>
        <div className="flex gap-3 bg-gray-50 dark:bg-gray-700 p-2 rounded">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={rowData.face_to_face}
              readOnly
              className="pointer-events-none"
            />
            <span className="text-sm text-gray-900 dark:text-white">Face-to-Face</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={rowData.online}
              readOnly
              className="pointer-events-none"
            />
            <span className="text-sm text-gray-900 dark:text-white">Online</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          HEI Remarks
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded min-h-[60px]">
          {rowData.hei_remarks || '-'}
        </p>
      </div>
    </div>
  );

  const getAnnexTitle = () => {
    const titles = {
      annex_a: 'Information and Orientation Service',
      annex_b: 'Guidance and Counseling Services',
      annex_c: 'Career and Job Placement Services',
      annex_d: 'Student Handbook Development',
      annex_e: 'Student Activities',
      annex_f: 'Student Discipline',
      annex_g: 'Student Publication/Yearbook',
      annex_h: 'Admission Services',
      annex_i: 'Scholarships and Financial Assistance',
      annex_j: 'Health Services',
      annex_k: 'Safety and Security Services',
      annex_l: 'Student Housing and Residential Services',
      annex_m: 'Services for Students with Special Needs and PWD',
      annex_n: 'Cultural and Arts Program',
      annex_o: 'Social and Community Involvement Programs',
    };
    return titles[annexType] || 'Evidence Details';
  };

  const renderFields = () => {
    // Use raw SQL column view for all annexes
    return renderAllFields();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Evidence Details
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {getAnnexTitle()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {renderFields()}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EvidenceModal;
