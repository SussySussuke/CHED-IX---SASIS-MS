import React from 'react';
import { useForm } from '@inertiajs/react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import TextInput from '../../Components/Forms/TextInput';
import SelectInput from '../../Components/Forms/SelectInput';

const Settings = ({ settings }) => {
  const { data, setData, post, processing, errors } = useForm({
    annual_submission_deadline: settings?.annual_submission_deadline || '',
    maintenance_mode: settings?.maintenance_mode === '1' || settings?.maintenance_mode === true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/superadmin/settings');
  };

  return (
    <SuperAdminLayout title="System Settings">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Submission Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="annual_submission_deadline"
                value={data.annual_submission_deadline}
                onChange={(e) => setData('annual_submission_deadline', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.annual_submission_deadline && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.annual_submission_deadline}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set the deadline date and time (e.g., September 1, 12:00 AM). The year shown is just for reference - only the month, day, and time matter. This deadline repeats annually.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={data.maintenance_mode}
                onChange={(e) => setData('maintenance_mode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="maintenance_mode"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enable Maintenance Mode
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Settings;
