import { useState, useEffect } from 'react';
import { getCurrentUser, signOut, initializeGoogleAuth } from '../lib/googleAuth';

export const useAuth = () => {
  // Mock user for development bypass
  const mockUser = {
    name: 'Demo Student',
    email: 'demo@university.edu',
    picture: 'https://via.placeholder.com/40'
  };

  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Skip Google Auth initialization in bypass mode
        // await initializeGoogleAuth();
        // const currentUser = getCurrentUser();
        // setUser(currentUser);
        setUser(mockUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Fallback to mock user on error
        setUser(mockUser);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    // signOut();
    // setUser(null);
    console.log('Logout clicked (bypassed for demo)');
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: true // Always authenticated in bypass mode
  };
};