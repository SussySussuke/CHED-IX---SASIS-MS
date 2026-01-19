import React from 'react';
import { router } from '@inertiajs/react';

const LogoutButton = () => {
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.post('/logout');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
