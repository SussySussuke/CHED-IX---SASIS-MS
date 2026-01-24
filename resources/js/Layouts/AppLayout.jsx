import React from 'react';
import { Head } from '@inertiajs/react';
import Topbar from '../Components/Common/Topbar';
import { useNotifications } from '../Hooks/useNotifications';
import NotificationItem from '../Components/Widgets/NotificationItem';

const AppLayout = ({ title, children }) => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
        <Topbar />
        <main>{children}</main>

        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AppLayout;
