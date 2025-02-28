import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import EventList from '../components/EventList';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <EventList />
      </Container>
    </Box>
  );
};

export default HomePage;
