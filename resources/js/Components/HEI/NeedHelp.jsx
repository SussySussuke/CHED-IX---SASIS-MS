import React, { useState, useEffect } from 'react';
import { IoCall, IoMail, IoLocation, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import axios from 'axios';

const NeedHelp = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/hei/api/ched-contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching CHED contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? contacts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === contacts.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return null;
  }

  const currentContact = contacts[currentIndex];
  const showNavigation = contacts.length > 1;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <IoCall className="text-blue-600 dark:text-blue-400" />
        Need Help?
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Contact CHED support for assistance with your submissions
      </p>

      {/* Contact Card with Slide Animation */}
      <div className="relative overflow-hidden min-h-[180px]">
        <div
          className="transition-all duration-300 ease-in-out"
          key={currentContact.id}
        >
          <div className="space-y-3">
            {/* Office Name */}
            <div className="mb-2">
              <p className="font-semibold text-gray-900 dark:text-white text-base">
                {currentContact.name}
              </p>
            </div>

            {currentContact.address && (
              <div className="flex gap-2 items-start">
                <IoLocation className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-sm text-gray-900 dark:text-white">{currentContact.address}</p>
                </div>
              </div>
            )}

            {currentContact.phone && (
              <div className="flex gap-2 items-start">
                <IoCall className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <a 
                    href={`tel:${currentContact.phone}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {currentContact.phone}
                  </a>
                </div>
              </div>
            )}

            {currentContact.email && (
              <div className="flex gap-2 items-start">
                <IoMail className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <a 
                    href={`mailto:${currentContact.email}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {currentContact.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showNavigation && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              aria-label="Previous contact"
            >
              <IoChevronBack size={18} />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {contacts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`transition-all duration-200 rounded-full ${
                    index === currentIndex
                      ? 'w-6 h-2 bg-blue-600 dark:bg-blue-400'
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500'
                  }`}
                  aria-label={`Go to contact ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              aria-label="Next contact"
            >
              <IoChevronForward size={18} />
            </button>
          </div>

          {/* Counter Text */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Viewing {currentIndex + 1} of {contacts.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default NeedHelp;
