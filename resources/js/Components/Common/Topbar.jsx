import React from 'react';
import { Link } from '@inertiajs/react';
import { useAuth } from '../../Hooks/useAuth';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/images/ched_logo.png"
            alt="CHED Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              CHED HEI SASIS Management System - IX
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Student Affair and Sevices Information System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
