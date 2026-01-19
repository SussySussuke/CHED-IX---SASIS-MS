import React from 'react';
import { useForm } from '@inertiajs/react';
import HEILayout from '../../Layouts/HEILayout';
import MultiTextInput from './MultiTextInput';
import InfoBox from '../Widgets/InfoBox';
import { CURRENT_YEAR } from '../../Utils/constants';
import { IoDocumentText } from 'react-icons/io5';

const AnnexFormBase = ({
  annexTitle,
  annexDescription,
  children,
  initialData = {},
  onSubmit,
  isEditing = false
}) => {
  const currentAcademicYear = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`;

  const { data, setData, post, processing, errors } = useForm({
    academic_year: currentAcademicYear,
    notes: initialData?.notes || [''],
    ...initialData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(data, { post, processing });
    }
  };

  return (
    <HEILayout title={`${annexTitle} - ${isEditing ? 'Edit' : 'Submit'}`}>
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {annexTitle}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 uppercase">
          {annexDescription}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          As of Academic Year: <span className="font-semibold text-gray-900 dark:text-white">{currentAcademicYear}</span>
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <InfoBox
            type="info"
            message={isEditing
              ? "You are editing a previous submission. Changes will be submitted for admin approval."
              : "Please fill out the required information for this annex. Data will be locked after the Annual Submission Deadline."}
          />

          <form onSubmit={handleSubmit} className="space-y-8 mt-6">
            {/* Custom Fields from children */}
            {children && typeof children === 'function'
              ? children({ data, setData, errors })
              : children}

            {/* Common Notes Field */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-500 dark:border-gray-400">
                <IoDocumentText className="text-2xl text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notes (Optional)
                </h2>
              </div>

              <MultiTextInput
                label="Additional Notes"
                name="notes"
                values={data.notes}
                onChange={(values) => setData('notes', values)}
                error={errors.notes}
                placeholder="Add any relevant notes or comments"
              />
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Submitting...' : (isEditing ? 'Update' : 'Submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </HEILayout>
  );
};

export default AnnexFormBase;
