import React from 'react';
import { IoClose, IoMail, IoCall, IoInformationCircle } from 'react-icons/io5';

const ContactAdminModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-slide-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <IoClose size={24} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <IoInformationCircle className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Contact Administrator
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need access to the system? Please contact your administrator using the information below:
          </p>

          {/* Contact Information */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <IoMail className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <a
                  href="mailto:admin@ched.gov.ph"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  admin@ched.gov.ph
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <IoCall className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                <a
                  href="tel:+6328441143"
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  +63 (2) 8441-1143
                </a>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please provide your institution details and contact information when requesting access.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactAdminModal;
