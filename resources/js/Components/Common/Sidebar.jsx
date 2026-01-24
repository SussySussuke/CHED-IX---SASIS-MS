import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';

const Sidebar = ({ links }) => {
  const { url } = usePage();
  const [expandedParents, setExpandedParents] = useState({});

  const isActive = (href) => {
    // Remove query parameters for comparison
    const cleanUrl = url.split('?')[0];
    const cleanHref = href.split('?')[0];
    return cleanUrl === cleanHref || cleanUrl.startsWith(cleanHref + '/');
  };

  const isParentActive = (children) => {
    return children.some(child => {
      if (child.href) return isActive(child.href);
      if (child.children) return isParentActive(child.children);
      return false;
    });
  };

  const toggleParent = (label) => {
    setExpandedParents(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <nav className="p-4 space-y-2 overflow-y-auto h-full">
        {links.map((link) => {
          if (link.divider) {
            return (
              <div key={link.label} className="pt-4 first:pt-0 pb-3">
                <div className="px-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {link.label}
                </div>
                <div className="space-y-1 ml-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                  {link.children.map((child) => {
                    if (child.children) {
                      const childExpanded = expandedParents[child.label] ?? isParentActive(child.children);
                      const childHasActive = isParentActive(child.children);

                      return (
                        <div key={child.label}>
                          <button
                            onClick={() => toggleParent(child.label)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full ${
                              childHasActive
                                ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {child.icon && (
                              <span className="text-lg">
                                {typeof child.icon === 'string' ? child.icon : child.icon}
                              </span>
                            )}
                            <span className="flex-1 text-left">{child.label}</span>
                            {childExpanded ? (
                              <IoChevronDown className="text-sm" />
                            ) : (
                              <IoChevronForward className="text-sm" />
                            )}
                          </button>
                          {childExpanded && (
                            <div className="ml-4 mt-1 space-y-1">
                              {child.children.map((grandchild) => (
                                <Link
                                  key={grandchild.href}
                                  href={grandchild.href}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                                    isActive(grandchild.href)
                                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {grandchild.icon && (
                                    <span className="text-base">
                                      {typeof grandchild.icon === 'string' ? grandchild.icon : grandchild.icon}
                                    </span>
                                  )}
                                  <span>{grandchild.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          isActive(child.href)
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {child.icon && (
                          <span className="text-lg">
                            {typeof child.icon === 'string' ? child.icon : child.icon}
                          </span>
                        )}
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (link.children) {
            const isExpanded = expandedParents[link.label] ?? isParentActive(link.children);
            const hasActiveChild = isParentActive(link.children);

            return (
              <div key={link.label}>
                <button
                  onClick={() => toggleParent(link.label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${
                    hasActiveChild
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.icon && (
                    <span className="text-xl">
                      {typeof link.icon === 'string' ? link.icon : link.icon}
                    </span>
                  )}
                  <span className="flex-1 text-left">{link.label}</span>
                  {isExpanded ? (
                    <IoChevronDown className="text-lg" />
                  ) : (
                    <IoChevronForward className="text-lg" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          isActive(child.href)
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {child.icon && (
                          <span className="text-lg">
                            {typeof child.icon === 'string' ? child.icon : child.icon}
                          </span>
                        )}
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(link.href)
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {link.icon && (
                <span className="text-xl">
                  {typeof link.icon === 'string' ? link.icon : link.icon}
                </span>
              )}
              <span>{link.label}</span>
              {link.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
