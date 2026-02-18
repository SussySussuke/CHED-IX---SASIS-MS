import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../Context/ThemeContext';
import { IoChevronDown, IoSearchOutline } from 'react-icons/io5';

export default function SelectCellEditor(props) {
  const { isDark } = useTheme();
  
  const {
    value,
    onValueChange,
    selectOptions = [],
    allowCustom = true,
    placeholder = 'Select or type...'
  } = props;
  
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(selectOptions);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [canOpen, setCanOpen] = useState(false);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  
  // Focus input on mount and select text
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  
  // Small delay to prevent dropdown from opening immediately on cell navigation
  useEffect(() => {
    const timer = setTimeout(() => setCanOpen(true), 150);
    return () => clearTimeout(timer);
  }, []);
  
  // Filter options based on input
  useEffect(() => {
    if (!inputValue) {
      setFilteredOptions(selectOptions);
      setSelectedIndex(-1);
      return;
    }
    
    const filtered = selectOptions.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
    
    // Auto-highlight first option when filtering
    if (filtered.length > 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(-1);
    }
  }, [inputValue, selectOptions]);
  
  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300;
      
      // Decide whether to show dropdown above or below
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      setDropdownPosition({
        top: showAbove ? rect.top + window.scrollY - dropdownHeight - 4 : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        showAbove
      });
    }
  }, [isOpen]);
  
  // Scroll selected option into view
  useEffect(() => {
    if (selectedIndex >= 0 && isOpen && dropdownRef.current) {
      const options = Array.from(dropdownRef.current.children).filter(el => el.hasAttribute('data-option'));
      const selectedElement = options[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, isOpen]);
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
          return;
        }
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // DON'T call onValueChange yet - only commit on Enter or selection
    
    if (!isOpen && canOpen) {
      setIsOpen(true);
    }
  };
  
  const selectOption = (option) => {
    setInputValue(option);
    onValueChange(option); // Commit the value to AG Grid
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canOpen) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleKeyDown = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Escape'].includes(e.key)) {
      if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && canOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        return;
      }
      
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
        
        switch (e.key) {
          case 'ArrowDown':
            setSelectedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
            break;
          case 'Escape':
            setIsOpen(false);
            setSelectedIndex(-1);
            break;
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      if (isOpen) {
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          selectOption(filteredOptions[selectedIndex]);
        } else if (filteredOptions.length === 1) {
          selectOption(filteredOptions[0]);
        } else {
          onValueChange(inputValue);
          setIsOpen(false);
        }
      } else {
        onValueChange(inputValue);
      }
    } else if (e.key === 'Tab') {
      // Just close dropdown and let Tab do its thing - don't try to be smart
      if (isOpen) {
        setIsOpen(false);
      }
      // Let default Tab behavior proceed
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full h-full px-3 py-1.5 pr-8 text-sm border-0 outline-none
            ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}
          `}
        />
        
        <button
          type="button"
          onClick={toggleDropdown}
          onMouseDown={(e) => e.preventDefault()}
          tabIndex={-1}
          className={`
            absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-colors
            ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}
          `}
        >
          <IoChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            } ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      
      {/* Portal dropdown to document.body to escape AG Grid's overflow clipping */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            minWidth: `${dropdownPosition.width}px`,
            maxWidth: '500px',
            maxHeight: '300px',
            zIndex: 99999,
            overflowY: 'auto'
          }}
          className={`
            rounded-lg shadow-2xl border animate-in fade-in slide-in-from-top-2 duration-200
            ${isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
            }
          `}
        >
          {filteredOptions.length > 0 ? (
            <>
              {filteredOptions.map((option, index) => (
                <div
                  key={index}
                  data-option="true"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectOption(option);
                  }}
                  className={`
                    px-4 py-2.5 cursor-pointer text-sm transition-all duration-150
                    ${selectedIndex === index 
                      ? 'bg-blue-500 text-white font-medium' 
                      : isDark
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-900 hover:bg-gray-100'
                    }
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === filteredOptions.length - 1 && !allowCustom ? 'rounded-b-lg' : ''}
                  `}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {option}
                </div>
              ))}
              {allowCustom && (
                <div className={`
                  px-4 py-3 text-center text-xs border-t rounded-b-lg
                  ${isDark 
                    ? 'text-gray-400 border-gray-600 bg-gray-750' 
                    : 'text-gray-500 border-gray-200 bg-gray-50'
                  }
                `}>
                  Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Enter</kbd> to use custom value
                </div>
              )}
            </>
          ) : (
            <div className={`
              px-4 py-8 text-center rounded-lg
              ${isDark ? 'text-gray-400' : 'text-gray-500'}
            `}>
              <IoSearchOutline className="w-8 h-8 mx-auto mb-3 opacity-50" />
              {allowCustom ? (
                <>
                  <p className="text-sm font-semibold mb-2">No matches found</p>
                  <p className="text-xs opacity-75">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded font-mono">Enter</kbd> to use "{inputValue}"
                  </p>
                </>
              ) : (
                <p className="text-sm">No options available</p>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
