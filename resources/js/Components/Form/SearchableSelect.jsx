import React, { useState, useRef, useEffect } from 'react';
import { IoChevronDown, IoClose } from 'react-icons/io5';

/**
 * Searchable Select Component
 * A custom select dropdown with search functionality
 * Supports both flat options and grouped options
 * 
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback when value changes (receives new value)
 * @param {Array} options - Array of {value, label} OR [{group, options: [{value, label}]}]
 * @param {string} placeholder - Placeholder text (default: "Select...")
 * @param {string} label - Label text (optional)
 * @param {string} className - Additional container classes
 */
export default function SearchableSelect({
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    label,
    className = "",
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Detect if options are grouped or flat
    const isGrouped = options.length > 0 && options[0].hasOwnProperty('group');

    // Flatten grouped options for searching and finding selected
    const flatOptions = isGrouped
        ? options.flatMap(group => group.options)
        : options;

    // Get display text for selected value
    const selectedOption = flatOptions.find(opt => opt.value === value);
    const displayText = selectedOption ? selectedOption.label : '';

    // Filter options based on search query
    const getFilteredOptions = () => {
        if (!searchQuery) {
            return isGrouped ? options : flatOptions;
        }

        const query = searchQuery.toLowerCase();

        if (isGrouped) {
            // Filter grouped options
            return options
                .map(group => ({
                    ...group,
                    options: group.options.filter(opt =>
                        opt.label.toLowerCase().includes(query)
                    )
                }))
                .filter(group => group.options.length > 0); // Only show groups with matches
        } else {
            // Filter flat options
            return flatOptions.filter(opt =>
                opt.label.toLowerCase().includes(query)
            );
        }
    };

    const filteredOptions = getFilteredOptions();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSearchQuery('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Render grouped options
    const renderGroupedOptions = () => {
        if (filteredOptions.length === 0) {
            return (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No options found
                </div>
            );
        }

        return filteredOptions.map((group, groupIndex) => (
            <div key={groupIndex}>
                {/* Group Header */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {group.group}
                </div>
                {/* Group Options */}
                {group.options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`pl-8 pr-4 py-2 text-sm cursor-pointer transition-colors ${
                            option.value === value
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        ));
    };

    // Render flat options
    const renderFlatOptions = () => {
        if (filteredOptions.length === 0) {
            return (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No options found
                </div>
            );
        }

        return filteredOptions.map((option) => (
            <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    option.value === value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
            >
                {option.label}
            </div>
        ));
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            
            <div className="relative" ref={containerRef}>
                {/* Trigger Button/Input */}
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-blue-500 border-blue-300 dark:border-blue-600 flex items-center justify-between ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    {isOpen ? (
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Type to search..."
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClear}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <IoClose className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className={`flex-1 text-sm ${!displayText ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                            {displayText || placeholder}
                        </span>
                    )}
                    
                    <IoChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>

                {/* Dropdown Options */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {isGrouped ? renderGroupedOptions() : renderFlatOptions()}
                    </div>
                )}
            </div>
        </div>
    );
}
