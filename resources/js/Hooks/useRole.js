import { useAuth } from './useAuth';
import { isSuperAdmin, isAdmin, isHEI } from '../Utils/roles';

export const useRole = () => {
  const { user } = useAuth();

  return {
    role: user?.role || null,
    isSuperAdmin: isSuperAdmin(user),
    isAdmin: isAdmin(user),
    isHEI: isHEI(user)
  };
};
