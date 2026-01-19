import React from 'react';
import AppLayout from './AppLayout';
import Sidebar from '../Components/Common/Sidebar';
import { PERMISSIONS } from '../Utils/permissions';
import PermissionGate from '../Components/Common/PermissionGate';
import { IoGrid, IoPeople, IoDocument, IoSettings } from 'react-icons/io5';

const SuperAdminLayout = ({ title, children }) => {
  const sidebarLinks = [
    {
      href: '/superadmin/dashboard',
      label: 'Dashboard',
      icon: <IoGrid />
    },
    {
      href: '/superadmin/admin-management',
      label: 'Admin Management',
      icon: <IoPeople />
    },
    {
      href: '/superadmin/system-audit-logs',
      label: 'System Audit Logs',
      icon: <IoDocument />
    },
    {
      href: '/superadmin/settings',
      label: 'Settings',
      icon: <IoSettings />
    }
  ];

  return (
    <PermissionGate permission={PERMISSIONS.MANAGE_ADMINS}>
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

export default SuperAdminLayout;
