import React from 'react';
import { usePermissions } from '../../Hooks/usePermissions';

const PermissionGate = ({ permission, permissions, children, fallback = null }) => {
  const { hasPermission, checkPermissions } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (permissions && !checkPermissions(permissions)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGate;
