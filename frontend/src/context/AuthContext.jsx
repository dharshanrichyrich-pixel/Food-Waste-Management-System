import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  // Load current user profile on initial mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data.user);
            setProfile(res.data.data.profile);
            localStorage.setItem('user_info', JSON.stringify(res.data.data.user));
            if (res.data.data.profile) {
              localStorage.setItem('user_profile', JSON.stringify(res.data.data.profile));
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Session verification warning:', err.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user: authUser, profile: authProfile, tokens } = res.data.data;
        setUser(authUser);
        setProfile(authProfile);
        setAccessToken(tokens.accessToken);
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
        localStorage.setItem('user_info', JSON.stringify(authUser));
        if (authProfile) {
          localStorage.setItem('user_profile', JSON.stringify(authProfile));
        }
        return { success: true, user: authUser };
      }
      return { success: false, error: res.data?.error?.message || 'Login failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (payload) => {
    try {
      const res = await apiClient.post('/auth/signup', payload);
      if (res.data?.success) {
        const { user: authUser, profile: authProfile, tokens } = res.data.data;
        setUser(authUser);
        setProfile(authProfile);
        setAccessToken(tokens.accessToken);
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
        localStorage.setItem('user_info', JSON.stringify(authUser));
        if (authProfile) {
          localStorage.setItem('user_profile', JSON.stringify(authProfile));
        }
        return { success: true, user: authUser };
      }
      return { success: false, error: res.data?.error?.message || 'Registration failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Registration failed';
      return { success: false, error: errorMsg };
    }
  };

  const quickDemoLogin = async (role) => {
    try {
      const res = await apiClient.post('/auth/demo-login', { role });
      if (res.data?.success) {
        const { user: authUser, profile: authProfile, tokens } = res.data.data;
        setUser(authUser);
        setProfile(authProfile);
        setAccessToken(tokens.accessToken);
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
        localStorage.setItem('user_info', JSON.stringify(authUser));
        if (authProfile) {
          localStorage.setItem('user_profile', JSON.stringify(authProfile));
        }
        return { success: true, user: authUser };
      }
      return { success: false, error: res.data?.error?.message || 'Demo login failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Demo login failed';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (err) {
      // ignore
    } finally {
      setUser(null);
      setProfile(null);
      setAccessToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('user_profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        accessToken,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
