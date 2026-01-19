import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export const useNotifications = () => {
  const { flash } = usePage().props;
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (flash?.success) {
      addNotification('success', flash.success);
    }
    if (flash?.error) {
      addNotification('error', flash.error);
    }
    if (flash?.info) {
      addNotification('info', flash.info);
    }
    if (flash?.warning) {
      addNotification('warning', flash.warning);
    }
  }, [flash]);

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
};
