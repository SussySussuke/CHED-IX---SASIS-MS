import { useAuth } from './useAuth';
import { hasPermission } from '../Utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    hasPermission: (permission) => hasPermission(user, permission),
    checkPermissions: (permissions) => {
      return permissions.every((permission) => hasPermission(user, permission));
    }
  };
};
