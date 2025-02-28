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

// Import page components from pages folder
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import PeoplePage from './pages/PeoplePage';
import PlacesPage from './pages/PlacesPage';
import ProfilePage from './pages/ProfilePage';

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
        return <QuizPage />;
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
      <Box sx={{ pb: 7 }}>
        {renderContent()}
        <BottomNav value={navValue} onChange={handleNavChange} />
      </Box>
    </ThemeProvider>
  );
};

export default App;