import React from 'react';
import { Link } from '@inertiajs/react';
import { IoDocument } from 'react-icons/io5';

const HistoryHeader = ({ annexName, submitUrl, entityName = "Batch Submission" }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Annex {annexName} Submission History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage your {entityName.toLowerCase()}s
        </p>
      </div>
      <Link
        href={submitUrl}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg hover:shadow-xl"
      >
        <IoDocument className="text-xl" />
        New {entityName}
      </Link>
    </div>
  );
};

export default HistoryHeader;
