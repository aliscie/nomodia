import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress,
  Container,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { getUbudBaliEvents, GeminiEvent } from '../utils/geminiAgent';
import EventCard from './EventCard';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<GeminiEvent[]>([]);
  console.log({
    JSON: JSON.stringify(events, null, 2)
  })
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // const data = await getUbudBaliEvents();
        // setEvents(data);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Group events by date
  const eventsByDate: { [key: string]: GeminiEvent[] } = {};
  events.forEach(event => {
    const dateKey = format(event?.startDateTime, 'yyyy-MM-dd');
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  // Get sorted date keys
  const sortedDateKeys = Object.keys(eventsByDate).sort();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography>No events found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Events in Lisbon, Portugal
      </Typography>
      
      {sortedDateKeys.map(dateKey => {
        const date = new Date(dateKey);
        const eventsForDate = eventsByDate[dateKey];
        const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
        
        return (
          <Box key={dateKey} sx={{ mb: 4 }}>
            <Box sx={{
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
              py: 1,
              mb: 2,
              borderLeft: isToday ? '4px solid #f44336' : 'none',
              pl: isToday ? 2 : 0
            }}>
              <Typography 
                variant="h6" 
                component="div"
                sx={{
                  color: isToday ? '#f44336' : (isPastDate ? 'text.secondary' : 'text.primary')
                }}
              >
                {format(date, 'EEEE, MMMM d, yyyy')}
                {isToday && (
                  <Chip
                    label="Today"
                    size="small"
                    color="error"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {eventsForDate.map(event => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard 
                    event={event} 
                    isPast={isPastDate || (isToday && event.endDateTime < new Date())}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Container>
  );
};

export default EventList;
