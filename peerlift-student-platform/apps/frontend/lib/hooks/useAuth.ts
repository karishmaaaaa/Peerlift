'use client';

import { useCallback } from 'react';
import useAuthStore from '@/lib/stores/authStore';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

// Local type definitions
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: string;
  schoolId?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, setAuth, setLoading, setError, logout, clearError } =
    useAuthStore();

  const register = useCallback(
    async (input: RegisterInput) => {
      setLoading(true);
      clearError();

      try {
        const response = await apiClient.post('/auth/register', input);
        const data: AuthResponse = response.data.data;

        setAuth(data);
        toast.success('Account created successfully');
        return { success: true, data };
      } catch (err: any) {
        const message = err.response?.data?.error?.message || 'Registration failed';
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, setError, clearError]
  );

  const login = useCallback(
    async (input: LoginInput) => {
      setLoading(true);
      clearError();

      try {
        const response = await apiClient.post('/auth/login', input);
        const data: AuthResponse = response.data.data;

        setAuth(data);
        toast.success('Logged in successfully');
        return { success: true, data };
      } catch (err: any) {
        const message = err.response?.data?.error?.message || 'Login failed';
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, setError, clearError]
  );

  const logoutUser = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
  }, [logout]);

  const updateProfile = useCallback(
    async (data: { firstName?: string; lastName?: string; avatar?: string }) => {
      setLoading(true);
      clearError();

      try {
        const response = await apiClient.put('/auth/profile', data);
        const updatedUser = response.data.data;

        useAuthStore.setState({ user: { ...user, ...updatedUser } });
        toast.success('Profile updated successfully');
        return { success: true, data: updatedUser };
      } catch (err: any) {
        const message = err.response?.data?.error?.message || 'Update failed';
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, setError, clearError]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout: logoutUser,
    updateProfile,
    clearError,
  };
};
