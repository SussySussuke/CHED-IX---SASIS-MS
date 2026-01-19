import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const CHEDContacts = () => {
  const contacts = [
    {
      name: 'Central Office',
      address: 'Higher Education Development Center Building, C.P. Garcia Ave., U.P. Campus, Diliman, Quezon City',
      phone: '(02) 8441-1143',
      email: 'ched@ched.gov.ph'
    }
  ];

  return (
    <AdminLayout title="CHED Contacts">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          CHED Contact Information
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {contact.name}
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">{contact.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">{contact.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="mt-1 text-blue-600 dark:text-blue-400">{contact.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CHEDContacts;
