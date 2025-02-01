import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    IconButton,
    Button,
    Chip,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ContentSection } from './types';

interface Platform {
    value: string;
    label: string;
    icon: string;
}

interface ContentCardProps {
    section: ContentSection;
    onDelete: (id: string) => void;
    onEdit: (section: ContentSection) => void;
    platforms: Platform[];
}

const ContentCard: React.FC<ContentCardProps> = ({
    section,
    onDelete,
    onEdit,
    platforms
}) => {
    const theme = useTheme();

    const platform = platforms.find(p => p.value === section.platform);

    return (
        <Card 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                            {platform?.label}
                        </Typography>
                    </Box>
                    <Box>
                        <IconButton
                            size="small"
                            onClick={() => onEdit(section)}
                            sx={{ mr: 1 }}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => onDelete(section.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Goal: {section.goal}
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                    {section.title}
                </Typography>

                <Typography 
                    variant="body2" 
                    sx={{ 
                        mt: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {section.description}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {section.tags?.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{ 
                                m: 0.5,
                                bgcolor: theme.palette.primary.light,
                                color: theme.palette.primary.contrastText
                            }}
                        />
                    ))}
                </Box>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 2 }}
                >
                    Created: {new Date(section.timestamp).toLocaleString()}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                >
                    Upload Now
                </Button>
            </CardActions>
        </Card>
    );
};

export default ContentCard;
