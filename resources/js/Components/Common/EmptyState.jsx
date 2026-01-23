import React from 'react';
import { Link } from '@inertiajs/react';

export default function EmptyState({
    title,
    message,
    icon,
    buttonText,
    buttonHref,
    buttonOnClick
}) {
    const defaultIcon = (
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
            {icon || defaultIcon}
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
            {(buttonText && (buttonHref || buttonOnClick)) && (
                <div className="mt-6">
                    {buttonHref ? (
                        <Link
                            href={buttonHref}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {buttonText}
                        </Link>
                    ) : (
                        <button
                            onClick={buttonOnClick}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
