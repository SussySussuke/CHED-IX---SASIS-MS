import React from 'react';
import { IoInformationCircle, IoCheckmarkCircle, IoWarning, IoCloseCircle } from 'react-icons/io5';

const InfoBox = ({ type = 'info', title, message, children, className = '' }) => {
  const typeStyles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900',
      border: 'border-blue-400',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-400'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900',
      border: 'border-green-400',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900',
      border: 'border-yellow-400',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: 'text-yellow-400'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900',
      border: 'border-red-400',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-400'
    }
  };

  const icons = {
    info: <IoInformationCircle className="text-xl" />,
    success: <IoCheckmarkCircle className="text-xl" />,
    warning: <IoWarning className="text-xl" />,
    error: <IoCloseCircle className="text-xl" />
  };

  const styles = typeStyles[type];

  return (
    <div className={`${styles.bg} border-l-4 ${styles.border} p-4 ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icons[type]}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${styles.text}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`text-sm ${styles.text} ${title ? 'mt-2' : ''}`}>
              {message}
            </div>
          )}
          {children && (
            <div className={`text-sm ${styles.text} ${title || message ? 'mt-2' : ''}`}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
