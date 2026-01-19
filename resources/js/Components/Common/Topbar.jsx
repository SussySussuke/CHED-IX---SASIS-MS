import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useAuth } from '../../Hooks/useAuth';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import ThemeEditor from './ThemeEditor';

const Topbar = () => {
  const { user } = useAuth();
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);

  return (
    <>
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
            <button
              onClick={() => setIsThemeEditorOpen(true)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Theme Editor"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>

            <ThemeToggle />

            {user && <UserMenu user={user} />}
          </div>
        </div>
      </header>

      <ThemeEditor isOpen={isThemeEditorOpen} onClose={() => setIsThemeEditorOpen(false)} />
    </>
  );
};

export default Topbar;
