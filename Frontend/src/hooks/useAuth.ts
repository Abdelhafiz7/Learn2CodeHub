import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { authApi } from '@/api';
import { getErrorMessage } from '@/utils';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuth, logout, setLoading } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (data: LoginRequest) => {
      setLoading(true);
      try {
        const response = await authApi.login(data);

        const user = {
          id: response.user.id.toString(),
          email: response.user.email,
          role: response.user.role,
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          Bio: response.user.bio || '',
        };

        setAuth(user, response.token);

        toast.success(`Welcome back!`);

        switch (user.role) {
          case 'Admin':
            navigate('/admin/dashboard');
            break;
          case 'Instructor':
            navigate('/instructor/dashboard');
            break;
          default:
            navigate('/student/dashboard');
        }

        return user;

      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth, setLoading]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setLoading(true);
      try {
        const response = await authApi.register(data);

        // We explicitly do NOT log the user in immediately. They must verify their email first.
        navigate(`/resend-verification?email=${encodeURIComponent(data.email)}`);

      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth, setLoading]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  }, [logout, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
  };
}
