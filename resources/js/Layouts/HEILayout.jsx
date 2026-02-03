import React from 'react';
import AppLayout from './AppLayout';
import Sidebar from '../Components/Common/Sidebar';
import HEIHeader from '../Components/HEI/HEIHeader';
import { PERMISSIONS } from '../Utils/permissions';
import PermissionGate from '../Components/Common/PermissionGate';
import { IoGrid, IoDocumentText } from 'react-icons/io5';
import { usePage } from '@inertiajs/react';

const HEILayout = ({ title, children, showHeader = true }) => {
  const { props, url } = usePage();
  const { hei, academicYears, selectedYear } = props;
  // Extract year from URL if present, otherwise use selectedYear from props
  const currentYear = new URLSearchParams(window.location.search).get('year') || selectedYear;
  const yearParam = currentYear ? `?year=${currentYear}` : '';

  const sidebarLinks = [
    {
      href: `/hei/dashboard${yearParam}`,
      label: 'Dashboard',
      icon: <IoGrid />
    },
    {
      href: `/hei/submissions/history${yearParam}`,
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
                selectedYear={currentYear || selectedYear}
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
