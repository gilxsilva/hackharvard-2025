// Google OAuth integration for Next.js
interface User {
  accessToken: string;
  name: string;
  email: string;
  picture?: string;
}

// Mock user for development
const mockUser: User = {
  accessToken: 'mock_token',
  name: 'Demo Student',
  email: 'demo@university.edu',
  picture: 'https://via.placeholder.com/40'
};

export const getCurrentUser = (): User | null => {
  // In development, return mock user
  if (process.env.NODE_ENV === 'development') {
    return mockUser;
  }
  
  // In production, get from localStorage or session
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('scholarly_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  return null;
};

export const signOut = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('scholarly_user');
  }
};

// This will be replaced with proper Next.js OAuth implementation
export const initializeGoogleAuth = async (): Promise<void> => {
  // Mock initialization for now
  return Promise.resolve();
};