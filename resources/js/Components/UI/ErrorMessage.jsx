export function ErrorMessage({ error, retry, className = '' }) {
  const errorMessage = error?.response?.data?.message 
    || error?.message 
    || 'An unexpected error occurred';

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-600 dark:text-red-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Something went wrong
          </h3>
          <p className="mt-2 text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
