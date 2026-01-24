import React from 'react';
import AppLayout from './AppLayout';
import Sidebar from '../Components/Common/Sidebar';
import HEIHeader from '../Components/HEI/HEIHeader';
import { PERMISSIONS } from '../Utils/permissions';
import PermissionGate from '../Components/Common/PermissionGate';
import { IoGrid, IoDocumentText } from 'react-icons/io5';
import { usePage } from '@inertiajs/react';

const HEILayout = ({ title, children, showHeader = true }) => {
  const { props } = usePage();
  const { hei, academicYears, selectedYear } = props;

  const sidebarLinks = [
    {
      href: '/hei/dashboard',
      label: 'Dashboard',
      icon: <IoGrid />
    },
    {
      href: '/hei/submissions/history',
      label: 'Submissions',
      icon: <IoDocumentText />
    }
  ];

  return (
    <PermissionGate permission={PERMISSIONS.VIEW_OWN_SUBMISSIONS}>
      <AppLayout title={title}>
        <div className="flex">
          <Sidebar links={sidebarLinks} />
          <div className="flex-1">
            {showHeader && hei && academicYears && selectedYear && (
              <HEIHeader
                hei={hei}
                academicYears={academicYears}
                selectedYear={selectedYear}
              />
            )}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </AppLayout>
    </PermissionGate>
  );
};

export default HEILayout;
