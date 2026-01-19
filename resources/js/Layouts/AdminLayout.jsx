import React from 'react';
import AppLayout from './AppLayout';
import Sidebar from '../Components/Common/Sidebar';
import { PERMISSIONS } from '../Utils/permissions';
import PermissionGate from '../Components/Common/PermissionGate';
import { IoGrid, IoSchool, IoDocumentText, IoDocument, IoCall } from 'react-icons/io5';

const AdminLayout = ({ title, children, pendingCount = 0 }) => {
  const sidebarLinks = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: <IoGrid />
    },
    {
      href: '/admin/hei-accounts',
      label: 'HEI Accounts',
      icon: <IoSchool />
    },
    {
      label: 'Submissions',
      divider: true,
      children: [
        {
          href: '/admin/submissions',
          label: 'All Submissions',
          icon: <IoDocumentText />
        },
        {
          href: '/admin/submissions/requests',
          label: 'Pending Requests',
          icon: <IoDocumentText />,
          badge: pendingCount > 0 ? pendingCount : null
        }
      ]
    },
    {
      href: '/admin/audit-logs',
      label: 'Audit Logs',
      icon: <IoDocument />
    },
    {
      href: '/admin/ched-contacts',
      label: 'CHED Contacts',
      icon: <IoCall />
    }
  ];

  return (
    <PermissionGate permission={PERMISSIONS.MANAGE_HEI_ACCOUNTS}>
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

export default AdminLayout;
