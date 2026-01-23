import React from 'react';
import AppLayout from './AppLayout';
import Sidebar from '../Components/Common/Sidebar';
import { PERMISSIONS } from '../Utils/permissions';
import PermissionGate from '../Components/Common/PermissionGate';
import { IoGrid, IoCreate, IoLibrary, IoDocumentText, IoTime, IoDocument } from 'react-icons/io5';

const HEILayout = ({ title, children }) => {
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
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </AppLayout>
    </PermissionGate>
  );
};

export default HEILayout;
