import React from 'react';

/** White card with an optional section heading. */
export const ProfileCard = ({ heading, footnote, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {heading && (
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {heading}
            </h2>
        )}
        {children}
        {footnote && (
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">{footnote}</p>
        )}
    </div>
);

/** Page-level header: title, subtitle, and optional Edit button. */
export const ProfilePageHeader = ({ title, subtitle, isEditing, onEdit }) => (
    <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
        </div>
        {!isEditing && onEdit && (
            <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
                Edit Profile
            </button>
        )}
    </div>
);

/** Green success banner shown after a successful save. */
export const ProfileSuccessBanner = ({ show }) => {
    if (!show) return null;
    return (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            Profile updated successfully.
        </div>
    );
};

/** Read-only label + value row used in view mode. */
export const ProfileFieldRow = ({ label, value, fallback = 'Not set' }) => (
    <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
            {value || <span className="text-gray-400 dark:text-gray-500 italic">{fallback}</span>}
        </p>
    </div>
);

/** Cancel / Save button row at the bottom of an edit form. */
export const ProfileFormActions = ({ processing, onCancel }) => (
    <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            Cancel
        </button>
        <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
            {processing ? 'Saving...' : 'Save Changes'}
        </button>
    </div>
);

/** Change Password card — identical for all roles. */
export const ProfilePasswordCard = () => (
    <ProfileCard>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Password</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Update your account password
                </p>
            </div>
            <a
                href="/change-password"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                Change Password
            </a>
        </div>
    </ProfileCard>
);
