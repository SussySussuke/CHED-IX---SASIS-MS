import React from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import TextInput from '../../../Components/Forms/TextInput';
import SelectInput from '../../../Components/Forms/SelectInput';

const Edit = ({ hei }) => {
  const { data, setData, put, processing, errors } = useForm({
    name: hei.name || '',
    type: hei.type || '',
    email: hei.email || ''
  });

  const heiTypes = [
    { value: 'university', label: 'University' },
    { value: 'college', label: 'College' },
    { value: 'technical', label: 'Technical Institute' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/admin/hei-accounts/${hei.id}`);
  };

  return (
    <AdminLayout title="Edit HEI Account">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Edit HEI Account
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="HEI Name"
              name="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={errors.name}
              required
            />

            <SelectInput
              label="HEI Type"
              name="type"
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              options={heiTypes}
              error={errors.type}
              required
            />

            <TextInput
              label="Email Address"
              name="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              required
            />

            <div className="flex justify-end gap-4">
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
                {processing ? 'Updating...' : 'Update Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Edit;
