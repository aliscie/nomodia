import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin as ReactGoogleLogin, googleLogout } from '@react-oauth/google';

// Define the user interface
interface GoogleUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// Define the credential response interface
interface GoogleCredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

// Define the context interface
interface GoogleAuthContextType {
  isAuthenticated: boolean;
  user: GoogleUser | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  renderGoogleButton: (customText?: string) => JSX.Element;
}

// Create the context with a default value
const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

// Provider props interface
interface GoogleAuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize auth state on component mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem('googleUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError('Failed to restore authentication state');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // Handle successful login
  const handleLoginSuccess = (credentialResponse: GoogleCredentialResponse) => {
    try {
      setIsLoading(true);
      setError(null);

      // Extract basic information from the credential response
      // Note: Without decoding the JWT, you'll need to get user details differently
      // This could be through a backend API call or other Google API methods

      // For now, we'll just create a basic user with the credential as the ID
      const googleUser: GoogleUser = {
        uid: credentialResponse.clientId, // Using clientId as a temporary unique identifier
        displayName: null, // You'll need to get this from a server or Google API
        email: null,       // You'll need to get this from a server or Google API
        photoURL: null     // You'll need to get this from a server or Google API
      };

      // Store credential in localStorage for persistence
      localStorage.setItem('googleCredential', credentialResponse.credential);
      localStorage.setItem('googleUser', JSON.stringify(googleUser));

      setUser(googleUser);
      setIsAuthenticated(true);

      console.log('User logged in successfully:', credentialResponse);

      // You would typically send the credential to your backend here
      // Example: await sendCredentialToBackend(credentialResponse.credential);
    } catch (err) {
      console.error('Error processing login:', err);
      setError('Failed to complete Google sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login error
  const handleLoginError = () => {
    console.error('Login Failed');
    setError('Failed to sign in with Google');
    setIsLoading(false);
  };

  // Login function - kept for compatibility with existing code
  const login = useCallback(async (): Promise<void> => {
    // This function is kept for API compatibility with the existing code
    // The actual login is now handled by the GoogleLogin component
    console.log('Please use the Google Login button');
    setError(null);
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Google logout
      googleLogout();

      // Clear user and credential from localStorage
      localStorage.removeItem('googleUser');
      localStorage.removeItem('googleCredential');

      setUser(null);
      setIsAuthenticated(false);

      console.log('User logged out');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Render Google Login button
  const renderGoogleButton = (customText?: string) => {
    return (
      <ReactGoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        text={customText ? customText : 'signin_with'}
        shape="rectangular"
        logo_alignment="left"
        theme="outline"
        size="large"
      />
    );
  };

  // Context value
  const value: GoogleAuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    renderGoogleButton
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleAuthContext.Provider value={value}>
        {children}
      </GoogleAuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

// Custom hook to use the auth context
export const useGoogleAuth = (): GoogleAuthContextType => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};

// Export the GoogleLogin component for direct use in components
export { ReactGoogleLogin as GoogleLogin };
