import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Typography,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Movie,
    Add as AddIcon,
    LightMode,
    DarkMode,
} from '@mui/icons-material';
import { VideoProject } from './types';
import { ProjectItem } from './ProjectItem';

interface LeftNavProps {
    isDarkMode: boolean;
    onThemeToggle: () => void;
    children: React.ReactNode;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72; // 7 spacing units from theme

export const LeftNav: React.FC<LeftNavProps> = ({ isDarkMode, onThemeToggle, children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(!isMobile);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    // Mock data - replace with your actual projects data
    const projects: VideoProject[] = [
        {id: '1', title: 'Marketing Campaign Video', date: '2024-01-29', status: 'published'},
        {id: '2', title: 'Product Tutorial', date: '2024-01-28', status: 'processing'},
        {id: '3', title: 'Company Overview', date: '2024-01-27', status: 'draft'},
    ];

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
                        boxSizing: 'border-box',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: open ? 'space-between' : 'center',
                        padding: theme.spacing(2),
                    }}
                >
                    {open && (
                        <Typography variant="h6" noWrap component="div">
                            Video Projects
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            onClick={onThemeToggle}
                            sx={{
                                mr: open ? 1 : 0,
                                color: theme.palette.text.primary
                            }}
                        >
                            {isDarkMode ? <LightMode /> : <DarkMode />}
                        </IconButton>
                        <IconButton onClick={handleDrawerToggle}>
                            {open ? <ChevronLeft /> : <ChevronRight />}
                        </IconButton>
                    </Box>
                </Box>

                <Divider />

                <List>
                    <ListItem
                        disablePadding
                        sx={{
                            display: 'block',
                            mb: 1,
                        }}
                    >
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                backgroundColor: theme.palette.primary.main,
                                margin: '8px',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 2 : 'auto',
                                    justifyContent: 'center',
                                    color: theme.palette.primary.contrastText,
                                }}
                            >
                                <AddIcon />
                            </ListItemIcon>
                            {open && (
                                <ListItemText
                                    primary="New Project"
                                    sx={{ color: theme.palette.primary.contrastText }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>

                    {projects.map((project) => (
                        <ProjectItem
                            key={project.id}
                            project={project}
                            open={open}
                            selected={selectedProject === project.id}
                            onSelect={() => setSelectedProject(project.id)}
                        />
                    ))}
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` },
                    marginLeft: { xs: COLLAPSED_WIDTH, sm: 0 },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default LeftNav;
