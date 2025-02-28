import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Avatar,
  Button,
  Link
} from '@mui/material';
import { format } from 'date-fns';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import { GeminiEvent } from '../utils/geminiAgent';

// Map spiral levels to colors
const spiralColors: Record<string, string> = {
  'Red': '#f44336',
  'Orange': '#ff9800',
  'Yellow': '#ffeb3b',
  'Green': '#4caf50',
  'Blue': '#2196f3',
  'Purple': '#9c27b0'
};

interface EventCardProps {
  event: GeminiEvent;
  isPast?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isPast = false }) => {
  const { 
    title, 
    description, 
    startDateTime, 
    endDateTime, 
    attendees, 
    spiralLevel, 
    emotionalLevel,
    sourceUrl 
  } = event;

  // Get color for spiral level
  const spiralColor = spiralColors[spiralLevel] || '#757575';

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        opacity: isPast ? 0.7 : 1,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)'
        },
        borderLeft: `4px solid ${spiralColor}`
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {format(startDateTime, 'h:mm a')} - {format(endDateTime, 'h:mm a')}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description.length > 120 ? `${description.substring(0, 120)}...` : description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {attendees} attendees
          </Typography>
        </Box>

        {/* Source URL Link */}
        <Box sx={{ mb: 2 }}>
          <Button 
            variant="text" 
            size="small"
            startIcon={<LinkIcon />}
            component={Link}
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: '0.75rem', textTransform: 'none' }}
          >
            View Source
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Chip 
            label={spiralLevel} 
            size="small" 
            sx={{ 
              bgcolor: spiralColor,
              color: ['Yellow', 'Orange'].includes(spiralLevel) ? 'black' : 'white'
            }} 
          />
          
          <Chip 
            label={`Emotional: ${emotionalLevel}/21`} 
            size="small" 
            sx={{ 
              bgcolor: `rgba(33, 150, 243, ${emotionalLevel / 21})`,
              color: emotionalLevel > 10 ? 'white' : 'black'
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;