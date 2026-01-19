import React from 'react';
import { IoInformationCircle, IoCheckmarkCircle, IoWarning, IoCloseCircle } from 'react-icons/io5';

const InfoBox = ({ type = 'info', title, message, children }) => {
  const typeStyles = {
    info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
  };

  const icons = {
    info: <IoInformationCircle />,
    success: <IoCheckmarkCircle />,
    warning: <IoWarning />,
    error: <IoCloseCircle />
  };

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          {message && <p className="text-sm">{message}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
