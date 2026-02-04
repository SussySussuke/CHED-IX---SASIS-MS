import React from 'react';
import { useTheme } from '../../Context/ThemeContext';

/**
 * Reusable Form Section Wrapper
 * Provides consistent styling for form sections with title, subtitle, and optional divider
 * 
 * @param {string} title - Section title
 * @param {string|string[]} subtitle - Optional subtitle (string for paragraph, array for bullet list)
 * @param {string} type - Section type: 'section', 'divider', or 'table'
 * @param {React.ReactNode} children - Section content
 */
const FormSection = ({ 
  title, 
  subtitle, 
  type = 'section',
  children 
}) => {
  const { isDark } = useTheme();

  // Divider-only section
  if (type === 'divider') {
    return (
      <div className="my-8">
        <div className={`
          border-t-2 pt-4
          ${isDark ? 'border-blue-600' : 'border-blue-500'}
        `}>
          <h3 className={`
            text-lg font-bold tracking-wide
            ${isDark ? 'text-blue-400' : 'text-blue-700'}
          `}>
            {title}
          </h3>
        </div>
      </div>
    );
  }

  // Regular section with content
  return (
    <div className="mb-6">
      {title && (
        <div className="mb-4">
          <h3 className={`
            text-lg font-semibold
            ${isDark ? 'text-gray-200' : 'text-gray-800'}
          `}>
            {title}
          </h3>
          {subtitle && (
            Array.isArray(subtitle) ? (
              <ul className={`
                list-disc list-inside text-sm mt-1 space-y-1
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {subtitle.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className={`
                text-sm mt-1
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {subtitle}
              </p>
            )
          )}
        </div>
      )}
      
      <div className={type === 'table' ? '' : 'space-y-4'}>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
