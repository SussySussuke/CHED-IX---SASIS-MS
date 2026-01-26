import React, { useState, useRef, useEffect } from 'react';

/**
 * AddressSearchInput Component
 * 
 * A reusable address input field with Nominatim (OpenStreetMap) autocomplete functionality.
 * Searches for addresses in the Philippines with debounced API calls.
 * 
 * @param {Object} props
 * @param {string} props.value - Current address value
 * @param {Function} props.onChange - Callback when address changes (receives string value)
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.className] - Additional CSS classes for the input
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.required] - Whether the field is required
 * @param {number} [props.debounceMs=500] - Debounce delay in milliseconds
 * @param {number} [props.minSearchLength=3] - Minimum characters before searching
 * @param {number} [props.maxResults=5] - Maximum number of suggestions to show
 */
const AddressSearchInput = ({
  value,
  onChange,
  placeholder = "Start typing to search for an address...",
  className = "",
  error = null,
  required = false,
  debounceMs = 500,
  minSearchLength = 3,
  maxResults = 5,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Search for addresses using Nominatim API
   */
  const searchAddress = async (query) => {
    if (query.length < minSearchLength) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHasSearched(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setShowSuggestions(true);
    setHasSearched(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${maxResults}&countrycodes=ph`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      const results = await response.json();
      setSuggestions(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching address:', error);
      setSuggestions([]);
      setHasSearched(true);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  /**
   * Handle input change with debouncing
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(newValue);
    }, debounceMs);
  };

  /**
   * Handle suggestion selection
   */
  const selectSuggestion = (suggestion) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  /**
   * Handle input focus
   */
  const handleFocus = () => {
    if (value.length >= minSearchLength) {
      setShowSuggestions(true);
    }
  };

  /**
   * Handle input blur with delay to allow click on suggestion
   */
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${className}`}
          placeholder={placeholder}
          required={required}
        />
        {isLoadingSuggestions && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoadingSuggestions ? (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              Searching...
            </div>
          ) : hasSearched && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
              <p className="text-sm">No addresses found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-0 transition-colors"
              >
                <div className="text-sm">{suggestion.display_name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSearchInput;
