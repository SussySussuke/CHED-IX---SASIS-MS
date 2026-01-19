import React from 'react';
import { Link } from '@inertiajs/react';
import { IoDocument } from 'react-icons/io5';

/**
 * Reusable empty state component for Annex history pages
 * @param {string} title - Title text
 * @param {string} message - Description message
 * @param {string} buttonText - CTA button text
 * @param {string} buttonHref - CTA button link
 */
const EmptyState = ({
  title = 'No Submissions Yet',
  message = 'You haven\'t submitted any data yet.',
  buttonText = 'Create Your First Submission',
  buttonHref
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
      <IoDocument className="mx-auto text-6xl text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      {buttonHref && (
        <Link
          href={buttonHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <IoDocument />
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
