import { useState, useEffect } from 'react';

interface LocationServiceState {
  currentLocation: string | null;
  isLoading: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
}

// Custom hook for location detection
export const useLocationService = (): LocationServiceState => {
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, []);

  // Function to detect user's location
  const detectLocation = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      // Use reverse geocoding to get location name
      const { latitude, longitude } = position.coords;
      
      // In a real app, you would use a geocoding service like Google Maps API
      // For this demo, we'll simulate the geocoding with a mock response
      const locationName = await simulateReverseGeocoding(latitude, longitude);
      
      // Save to localStorage
      localStorage.setItem('userLocation', locationName);
      
      setCurrentLocation(locationName);
    } catch (err) {
      console.error('Error detecting location:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect location');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate reverse geocoding (in a real app, this would call a geocoding API)
  const simulateReverseGeocoding = async (latitude: number, longitude: number): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, return a location based on coordinates
    // In a real app, you would call a geocoding service API
    return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  };

  return {
    currentLocation,
    isLoading,
    error,
    detectLocation
  };
};