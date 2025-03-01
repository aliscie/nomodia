import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import { useGoogleAuth } from '../services/googleAuthService';
import { useLocationService } from '@/services/locationService';
import { useProfileData } from '@/services/profileDataService';

type VisibilityOption = 'everyone' | 'contacts' | 'close_friends' | 'no_one';

interface ProfileData {
  username: string;
  email: string;
  telegram: string;
  instagram: string;
  xAccount: string;
  location: string;
  socialMediaVisibility: VisibilityOption;
  avatarUrl?: string;
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, user, login, logout, renderGoogleButton, isLoading: authLoading } = useGoogleAuth();
  const { currentLocation, detectLocation, isLoading: locationLoading } = useLocationService();
  const { saveProfile, loadProfile, isLoading: dataLoading } = useProfileData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: '',
    telegram: '',
    instagram: '',
    xAccount: '',
    location: '',
    socialMediaVisibility: 'everyone',
    avatarUrl: ''
  });
  
  // Flag to track if profile data has been loaded
  const profileLoadedRef = useRef(false);

  // Load profile data when authenticated
  useEffect(() => {
    // Only load profile data if authenticated, user exists, and profile hasn't been loaded yet
    if (isAuthenticated && user && !profileLoadedRef.current) {
      console.log('Authentication successful, user data:', user);
      profileLoadedRef.current = true; // Mark as loaded to prevent infinite loop
      
      loadProfile().then(data => {
        console.log('Profile data loaded:', data);
        if (data) {
          setProfileData(prev => ({
            ...prev,
            ...data,
            email: user.email || prev.email,
            avatarUrl: user.photoURL || data.avatarUrl || prev.avatarUrl
          }));
        } else {
          // If no profile data exists yet, set email and avatar from Google account
          setProfileData(prev => ({
            ...prev,
            email: user.email || '',
            username: user.displayName || '',
            avatarUrl: user.photoURL || ''
          }));
        }
      }).catch(error => {
        console.error('Error loading profile:', error);
        setSnackbar({ open: true, message: 'Failed to load profile data', severity: 'error' });
      });
    } else if (isAuthenticated && !user) {
      console.error('Authentication is successful but user data is missing');
      setSnackbar({ 
        open: true, 
        message: 'Authentication successful but user data is missing', 
        severity: 'error' 
      });
    } else if (!isAuthenticated) {
      // Reset the flag when user logs out
      profileLoadedRef.current = false;
      // Clear profile data when logged out
      setProfileData({
        username: '',
        email: '',
        telegram: '',
        instagram: '',
        xAccount: '',
        location: '',
        socialMediaVisibility: 'everyone',
        avatarUrl: ''
      });
    }
  }, [isAuthenticated, user, loadProfile]);

  // Update location when detected
  useEffect(() => {
    if (currentLocation && !profileData.location) {
      setProfileData(prev => ({
        ...prev,
        location: currentLocation
      }));
    }
  }, [currentLocation, profileData.location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleVisibilityChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setProfileData(prev => ({
      ...prev,
      socialMediaVisibility: event.target.value as VisibilityOption
    }));
  };

  const handleDetectLocation = async () => {
    try {
      await detectLocation();
      setSnackbar({ open: true, message: 'Location detected successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to detect location', severity: 'error' });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await saveProfile(profileData);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Profile saved successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save profile', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const isLoading = authLoading || locationLoading || dataLoading;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !isAuthenticated ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h5" gutterBottom>Sign in to manage your profile</Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                {renderGoogleButton("signin_with")}
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                  Profile
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                  >
                    Logout
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar 
                    src={profileData.avatarUrl || user?.photoURL || undefined} 
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  {isEditing && (
                    <Button variant="outlined" size="small">
                      Change Photo
                    </Button>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={profileData.email}
                        disabled
                        variant="outlined"
                        helperText="Email is provided by Google account"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Location</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Current Location"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mr: 2 }}
                    />
                    {isEditing && (
                      <Button 
                        variant="contained" 
                        startIcon={<LocationOnIcon />}
                        onClick={handleDetectLocation}
                      >
                        Detect
                      </Button>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Social Media</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telegram"
                        name="telegram"
                        value={profileData.telegram}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                        placeholder="@username"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Instagram"
                        name="instagram"
                        value={profileData.instagram}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                        placeholder="@username"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="X (Twitter)"
                        name="xAccount"
                        value={profileData.xAccount}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                        placeholder="@username"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel id="visibility-label">Social Media Visibility</InputLabel>
                    <Select
                      labelId="visibility-label"
                      value={profileData.socialMediaVisibility}
                      onChange={handleVisibilityChange}
                      label="Social Media Visibility"
                    >
                      <MenuItem value="everyone">Everyone can see</MenuItem>
                      <MenuItem value="contacts">Only contacts</MenuItem>
                      <MenuItem value="close_friends">Only close friends</MenuItem>
                      <MenuItem value="no_one">No one</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setIsEditing(false)} 
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveProfile}
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;