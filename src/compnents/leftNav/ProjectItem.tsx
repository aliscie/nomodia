import React from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    Box,
    Typography,
    useTheme,
} from '@mui/material';
import { Movie } from '@mui/icons-material';
import { VideoProject } from './types';

interface ProjectItemProps {
    project: VideoProject;
    open: boolean;
    selected: boolean;
    onSelect: () => void;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
    project,
    open,
    selected,
    onSelect,
}) => {
    const theme = useTheme();

    const getStatusColor = (status: VideoProject['status']) => {
        switch (status) {
            case 'published':
                return theme.palette.success.main;
            case 'processing':
                return theme.palette.warning.main;
            case 'draft':
                return theme.palette.info.main;
            default:
                return theme.palette.text.secondary;
        }
    };

    return (
        <ListItem
            disablePadding
            sx={{ display: 'block' }}
        >
            <ListItemButton
                selected={selected}
                onClick={onSelect}
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                    },
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                    }}
                >
                    <Movie />
                </ListItemIcon>
                {open && (
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography noWrap variant="body2" sx={{ fontWeight: 500 }}>
                            {project.title}
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 0.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: getStatusColor(project.status),
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary }}
                            >
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </ListItemButton>
        </ListItem>
    );
};

export default ProjectItem;
