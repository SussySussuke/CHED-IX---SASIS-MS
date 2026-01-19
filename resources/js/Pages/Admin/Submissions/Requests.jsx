import React, { useRef, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { formatDateTime } from '../../../Utils/formatters';

// Register Handsontable modules
registerAllModules();

const Requests = ({ submissions }) => {
  const hotTableRef = useRef(null);
  const [isDark, setIsDark] = useState(false);

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

  const handleAccept = (id) => {
    if (confirm('Are you sure you want to accept this request? This will replace the current submitted data.')) {
      router.post(`/admin/submissions/${id}/approve`);
    }
  };

  const handleReject = (id) => {
    if (confirm('Are you sure you want to reject this request?')) {
      router.post(`/admin/submissions/${id}/reject`);
    }
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
      data: 'hei.name',
      title: 'HEI Name',
      readOnly: true,
      width: 200,
      className: 'htLeft htMiddle'
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
      width: 120,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = `
          <div class="flex gap-2 justify-center items-center">
            <button
              class="accept-btn px-3 py-1 rounded text-xs font-semibold ${isDark ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-800 hover:bg-green-200'}"
              data-id="${value}"
              title="Accept Request"
            >
              Accept
            </button>
            <button
              class="reject-btn px-3 py-1 rounded text-xs font-semibold ${isDark ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-800 hover:bg-red-200'}"
              data-id="${value}"
              title="Reject Request"
            >
              Reject
            </button>
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
      const acceptBtn = e.target.closest('.accept-btn');
      const rejectBtn = e.target.closest('.reject-btn');

      if (acceptBtn) {
        const id = acceptBtn.dataset.id;
        handleAccept(id);
      } else if (rejectBtn) {
        const id = rejectBtn.dataset.id;
        handleReject(id);
      }
    };

    const tableElement = hotTableRef.current?.hotInstance?.rootElement;
    if (tableElement) {
      tableElement.addEventListener('click', handleClick);
      return () => tableElement.removeEventListener('click', handleClick);
    }
  }, [submissions]);

  return (
    <AdminLayout title="Request Submissions">
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Request Submissions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Pending overwrite requests from HEIs (sorted by oldest first)
            </p>
          </div>
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
              No pending requests found. All submissions are up to date.
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Requests;
