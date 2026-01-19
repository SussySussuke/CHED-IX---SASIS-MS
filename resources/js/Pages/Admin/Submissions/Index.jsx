import React, { useRef, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { formatDateTime } from '../../../Utils/formatters';

// Register Handsontable modules
registerAllModules();

const Index = ({ submissions, academicYears, currentYear, filters }) => {
  const hotTableRef = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const [selectedYear, setSelectedYear] = useState(filters?.year || currentYear);
  const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'submitted');

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

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    router.get('/admin/submissions', { year, status: selectedStatus }, { preserveState: true });
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    router.get('/admin/submissions', { year: selectedYear, status }, { preserveState: true });
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
      data: 'hei.type',
      title: 'Type',
      readOnly: true,
      width: 100,
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
      data: 'status',
      title: 'Status',
      readOnly: true,
      width: 100,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value) => {
        const statusColors = {
          submitted: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
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
    }
  ];

  return (
    <AdminLayout title="Submissions">
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
              HEI Submissions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View all submitted, overwritten, rejected, and cancelled submissions
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Academic Year:
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {academicYears && academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status:
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="submitted">Submitted</option>
                <option value="overwritten">Overwritten</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
              No submissions found for the selected year.
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Index;
