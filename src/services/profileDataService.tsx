import { useState, useCallback } from 'react';

interface ProfileData {
  username: string;
  email: string;
  telegram: string;
  instagram: string;
  xAccount: string;
  location: string;
  socialMediaVisibility: 'everyone' | 'contacts' | 'close_friends' | 'no_one';
  avatarUrl?: string;
}

interface ProfileDataServiceState {
  isLoading: boolean;
  error: string | null;
  saveProfile: (data: ProfileData) => Promise<void>;
  loadProfile: () => Promise<ProfileData | null>;
}

// Custom hook for profile data management
export const useProfileData = (): ProfileDataServiceState => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save profile data to localStorage (simulating server storage)
  const saveProfile = useCallback(async (data: ProfileData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an API call to save data to the server
      // For demo purposes, we'll save to localStorage
      localStorage.setItem('profileData', JSON.stringify(data));
      
      // Log for debugging
      console.log('Profile data saved:', data);
    } catch (err) {
      console.error('Error saving profile data:', err);
      setError('Failed to save profile data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load profile data from localStorage (simulating server storage)
  const loadProfile = useCallback(async (): Promise<ProfileData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, this would be an API call to fetch data from the server
      // For demo purposes, we'll load from localStorage
      const storedData = localStorage.getItem('profileData');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData) as ProfileData;
        return parsedData;
      }
      
      return null;
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    saveProfile,
    loadProfile
  };
};