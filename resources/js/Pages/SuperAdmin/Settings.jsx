import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import ConfirmationModal from '../../Components/Common/ConfirmationModal';
import { IoCloudUploadOutline, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import axios from 'axios';

const Settings = ({ settings }) => {
  const { data, setData, post, processing, errors } = useForm({
    annual_submission_deadline: settings?.annual_submission_deadline || '',
    maintenance_mode: settings?.maintenance_mode === '1' || settings?.maintenance_mode === true,
  });

  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null); // { success, message }

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/superadmin/settings');
  };

  const handlePublishNow = async () => {
    setPublishing(true);
    setPublishConfirmOpen(false);
    setPublishResult(null);

    try {
      const response = await axios.post('/superadmin/settings/publish-now');
      setPublishResult({ success: true, message: response.data.message });
    } catch (error) {
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      setPublishResult({ success: false, message });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <SuperAdminLayout title="System Settings">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>

        {/* Settings Form */}
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
                Set the deadline date and time (e.g., September 1, 12:00 AM). The year shown is just for reference — only the month, day, and time matter. This deadline repeats annually.
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
              <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

        {/* Force Publish Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Force Publish Submissions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Immediately publishes all <span className="font-medium text-gray-700 dark:text-gray-300">submitted</span> records
            across every HEI and form type, regardless of whether the deadline has passed.
            Equivalent to running <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">php artisan submissions:publish-past-deadline --force</code>.
          </p>

          {/* Result banner */}
          {publishResult && (
            <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 border ${
              publishResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              {publishResult.success
                ? <IoCheckmarkCircle className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" size={20} />
                : <IoWarning className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={20} />
              }
              <p className={`text-sm font-medium ${
                publishResult.success
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {publishResult.message}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setPublishConfirmOpen(true)}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <IoCloudUploadOutline size={18} />
            {publishing ? 'Publishing...' : 'Force Publish Now'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={handlePublishNow}
        title="Force Publish All Submissions"
        message="This will immediately publish every submitted record across all HEIs and all form types, bypassing the deadline check. This cannot be undone. Are you sure?"
        confirmText="Yes, Publish Now"
        variant="warning"
        processing={publishing}
      />
    </SuperAdminLayout>
  );
};

export default Settings;
