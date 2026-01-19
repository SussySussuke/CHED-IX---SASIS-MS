import React, { useRef, useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import HEILayout from '../../../Layouts/HEILayout';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import StatusBadge from '../../../Components/Widgets/StatusBadge';
import { formatDateTime } from '../../../Utils/formatters';
import CancelSubmissionModal from '../../../Components/Modals/CancelSubmissionModal';

// Register Handsontable modules
registerAllModules();

const History = ({ submissions }) => {
  const hotTableRef = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleEdit = (id) => {
    router.visit(`/hei/general-information/${id}/edit`);
  };

  const handleCancel = (id) => {
    setSelectedSubmissionId(id);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = (id, notes) => {
    router.post(`/hei/general-information/${id}/cancel`, {
      cancelled_notes: notes
    });
    setShowCancelModal(false);
    setSelectedSubmissionId(null);
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setSelectedSubmissionId(null);
  };

  const columns = [
    {
      data: 'academic_year',
      title: 'Academic Year',
      readOnly: true,
      width: 120,
      className: 'htCenter htMiddle'
    },
    {
      data: 'population_male',
      title: 'Male',
      readOnly: true,
      width: 80,
      className: 'htRight htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = (value || 0).toLocaleString();
        td.className = 'htRight htMiddle';
        td.style.color = isDark ? '#60a5fa' : '#2563eb';
        return td;
      }
    },
    {
      data: 'population_female',
      title: 'Female',
      readOnly: true,
      width: 80,
      className: 'htRight htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = (value || 0).toLocaleString();
        td.className = 'htRight htMiddle';
        td.style.color = isDark ? '#f472b6' : '#db2777';
        return td;
      }
    },
    {
      data: 'population_intersex',
      title: 'Intersex',
      readOnly: true,
      width: 80,
      className: 'htRight htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = (value || 0).toLocaleString();
        td.className = 'htRight htMiddle';
        td.style.color = isDark ? '#c084fc' : '#9333ea';
        return td;
      }
    },
    {
      data: 'population_total',
      title: 'Total',
      readOnly: true,
      width: 100,
      className: 'htRight htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = `<strong>${(value || 0).toLocaleString()}</strong>`;
        td.className = 'htRight htMiddle';
        td.style.fontWeight = 'bold';
        return td;
      }
    },
    {
      data: 'submitted_org_chart',
      title: 'Org Chart',
      readOnly: true,
      width: 90,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        const badge = value === 'yes'
          ? `<span class="px-2 py-1 rounded text-xs ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}">Yes</span>`
          : `<span class="px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}">No</span>`;
        td.innerHTML = badge;
        td.className = 'htCenter htMiddle';
        return td;
      }
    },
    {
      data: 'hei_website',
      title: 'HEI Website',
      readOnly: true,
      width: 150,
      className: 'htLeft htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        if (value) {
          td.innerHTML = `<a href="${value}" target="_blank" class="${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline">${value.substring(0, 30)}...</a>`;
        } else {
          td.innerHTML = `<span class="${isDark ? 'text-gray-500' : 'text-gray-400'}">-</span>`;
        }
        td.className = 'htLeft htMiddle';
        return td;
      }
    },
    {
      data: 'sas_website',
      title: 'SAS Website',
      readOnly: true,
      width: 150,
      className: 'htLeft htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        if (value) {
          td.innerHTML = `<a href="${value}" target="_blank" class="${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline">${value.substring(0, 30)}...</a>`;
        } else {
          td.innerHTML = `<span class="${isDark ? 'text-gray-500' : 'text-gray-400'}">-</span>`;
        }
        td.className = 'htLeft htMiddle';
        return td;
      }
    },
    {
      data: 'student_handbook',
      title: 'Handbook',
      readOnly: true,
      width: 150,
      className: 'htLeft htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = value || `<span class="${isDark ? 'text-gray-500' : 'text-gray-400'}">-</span>`;
        td.className = 'htLeft htMiddle';
        return td;
      }
    },
    {
      data: 'student_publication',
      title: 'Publication',
      readOnly: true,
      width: 150,
      className: 'htLeft htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = value || `<span class="${isDark ? 'text-gray-500' : 'text-gray-400'}">-</span>`;
        td.className = 'htLeft htMiddle';
        return td;
      }
    },
    {
      data: 'status',
      title: 'Status',
      readOnly: true,
      width: 100,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        const statusColors = {
          submitted: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
          request: isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800',
          overwritten: isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
          rejected: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800',
          cancelled: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
        };
        const colorClass = statusColors[value] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
        td.innerHTML = `<span class="px-2 py-1 rounded-full text-xs font-semibold ${colorClass}">${value}</span>`;
        td.className = 'htCenter htMiddle';
        return td;
      }
    },
    {
      data: 'request_notes',
      title: 'Request Notes',
      readOnly: true,
      width: 200,
      className: 'htLeft htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        if (value) {
          const truncated = value.length > 100 ? value.substring(0, 100) + '...' : value;
          td.innerHTML = `<span class="${isDark ? 'text-gray-300' : 'text-gray-700'}" title="${value.replace(/"/g, '&quot;')}">${truncated}</span>`;
        } else {
          td.innerHTML = `<span class="${isDark ? 'text-gray-600' : 'text-gray-400'}">-</span>`;
        }
        td.className = 'htLeft htMiddle';
        return td;
      }
    },
    {
      data: 'created_at',
      title: 'Submitted At',
      readOnly: true,
      width: 160,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = formatDateTime(value);
        td.className = 'htCenter htMiddle';
        return td;
      }
    },
    {
      data: 'id',
      title: 'Actions',
      readOnly: true,
      width: 100,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        const rowData = submissions[row];
        // Only allow editing submitted or request status (not cancelled, overwritten, or rejected)
        const canEdit = rowData.status === 'submitted' || rowData.status === 'request';
        // Only allow cancelling request status
        const canCancel = rowData.status === 'request';

        td.innerHTML = `
          <div class="flex gap-2 justify-center items-center">
            ${canEdit ? `
              <button
                class="edit-btn ${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-800'}"
                data-id="${value}"
                title="Edit Submission"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            ` : `
              <span class="${isDark ? 'text-gray-600' : 'text-gray-400'}" title="Cannot edit">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            `}
            ${canCancel ? `
              <button
                class="cancel-btn ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}"
                data-id="${value}"
                title="Cancel Request"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ` : ''}
          </div>
        `;
        td.className = 'htCenter htMiddle';
        return td;
      }
    }
  ];

  useEffect(() => {
    // Add click handlers for buttons
    const handleClick = (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const cancelBtn = e.target.closest('.cancel-btn');

      if (editBtn) {
        const id = editBtn.dataset.id;
        handleEdit(id);
      } else if (cancelBtn) {
        const id = cancelBtn.dataset.id;
        handleCancel(id);
      }
    };

    const tableElement = hotTableRef.current?.hotInstance?.rootElement;
    if (tableElement) {
      tableElement.addEventListener('click', handleClick);
      return () => tableElement.removeEventListener('click', handleClick);
    }
  }, [submissions]);

  return (
    <HEILayout title="Submission History">
      <style>{`
        .handsontable td,
        .handsontable th {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-height: 50px !important;
          vertical-align: middle !important;
        }

        .handsontable .htMiddle {
          vertical-align: middle !important;
        }

        ${isDark ? `
          .handsontable {
            color: #e5e7eb !important;
          }
          .handsontable th {
            background-color: #374151 !important;
            color: #f3f4f6 !important;
            border-color: #4b5563 !important;
          }
          .handsontable td {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
            color: #e5e7eb !important;
          }
          .handsontable td.area {
            background-color: #111827 !important;
          }
          .ht_clone_top th,
          .ht_clone_left th {
            background-color: #374151 !important;
          }
          .handsontable .htDimmed {
            color: #9ca3af !important;
          }
        ` : ''}
      `}</style>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Submission History
          </h1>
          <Link
            href="/hei/general-information/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Submission
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          {submissions && submissions.length > 0 ? (
            <HotTable
              ref={hotTableRef}
              data={submissions}
              columns={columns}
              colHeaders={true}
              rowHeaders={true}
              width="100%"
              height={600}
              rowHeights={50}
              licenseKey="non-commercial-and-evaluation"
              className="htCenter htMiddle"
              stretchH="all"
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No submissions found. Start by submitting your first data.
            </p>
          )}
        </div>
      </div>

      {/* Cancel Submission Modal */}
      <CancelSubmissionModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        submissionId={selectedSubmissionId}
      />
    </HEILayout>
  );
};

export default History;
