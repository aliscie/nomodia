import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  Paper,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  CssBaseline
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleIcon from '@mui/icons-material/People';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import HomePage from "@/pages/HomePage";
import { GoogleAuthProvider } from "./services/googleAuthService";
import ProfilePage from './pages/ProfilePage';
import EnhancedQuizPage from '../pages/EnhancedQuizPage';

// Home Page Component

// People Page Component
const PeoplePage = () => {
  return (
    <Container>
      <Box sx={{ p: 2 }}>
        <h1>People Page</h1>
        <p>Connect with people!</p>
      </Box>
    </Container>
  );
};

// Places Page Component
const PlacesPage = () => {
  return (
    <Container>
      <Box sx={{ p: 2 }}>
        <h1>Places Page</h1>
        <p>Discover new places!</p>
      </Box>
    </Container>
  );
};



// Theme Hook
const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return theme;
};

// Navigation Component
const BottomNav = ({ value, onChange }) => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={onChange}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Quiz" icon={<QuizIcon />} />
        <BottomNavigationAction label="People" icon={<PeopleIcon />} />
        <BottomNavigationAction label="Places" icon={<PlaceIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

// Main App Component
const App = () => {
  const [navValue, setNavValue] = useState(0);
  const theme = useAppTheme();

  // Handle navigation change
  const handleNavChange = (event, newValue) => {
    setNavValue(newValue);
  };

  // Render content based on navigation value
  const renderContent = () => {
    switch (navValue) {
      case 0:
        return <HomePage />;
      case 1:
        return <EnhancedQuizPage />;
      case 2:
        return <PeoplePage />;
      case 3:
        return <PlacesPage />;
      case 4:
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GoogleAuthProvider>
        <Box sx={{ pb: 7 }}>
          {renderContent()}
          <BottomNav value={navValue} onChange={handleNavChange} />
        </Box>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
};

export default App;
