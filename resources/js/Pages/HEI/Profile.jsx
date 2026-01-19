import React from 'react';
import { useForm } from '@inertiajs/react';
import HEILayout from '../../Layouts/HEILayout';
import TextInput from '../../Components/Forms/TextInput';

const Profile = ({ hei }) => {
  const { data, setData, put, processing, errors } = useForm({
    name: hei.name || '',
    email: hei.email || '',
    type: hei.type || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put('/hei/profile');
  };

  return (
    <HEILayout title="Profile">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          HEI Profile
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="HEI Name"
              name="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={errors.name}
              disabled
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

            <TextInput
              label="HEI Type"
              name="type"
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              error={errors.type}
              disabled
            />

            <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <a
                href="/change-password"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Change Password
              </a>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </HEILayout>
  );
};

export default Profile;
