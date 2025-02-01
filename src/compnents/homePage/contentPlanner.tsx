import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ContentSection, NewSection } from './types';
import ContentCard from "@/compnents/homePage/contentCard";
import ContentDialog from "@/compnents/homePage/contentDialog";

// Constants
const PLATFORMS = [
    { value: 'twitter', label: 'Twitter/X', icon: 'Twitter' },
    { value: 'youtube', label: 'YouTube', icon: 'YouTube' },
    { value: 'youtube_short', label: 'YouTube Short', icon: 'YouTube' },
    { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
    { value: 'instagram_story', label: 'Instagram Story', icon: 'Instagram' },
    { value: 'tiktok', label: 'TikTok', icon: 'TikTok' },
];

const defaultNewSection: NewSection = {
    platform: '',
    goal: '',
    title: '',
    description: '',
    tags: [],
};

interface ContentPlannerProps {
    transcript?: string | null;
}

// Custom hook for managing sections
const useSections = () => {
    const [sections, setSections] = useState<ContentSection[]>(() => {
        try {
            const savedSections = localStorage.getItem('contentSections');
            return savedSections ? JSON.parse(savedSections) : [];
        } catch (error) {
            console.error('Error loading saved sections:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('contentSections', JSON.stringify(sections));
        } catch (error) {
            console.error('Error saving sections:', error);
        }
    }, [sections]);

    return { sections, setSections };
};

const ContentPlanner: React.FC<ContentPlannerProps> = ({ transcript }) => {
    const { sections, setSections } = useSections();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<ContentSection | null>(null);

    const handleAddSection = (newSectionData: NewSection) => {
        const section: ContentSection = {
            id: Date.now().toString(),
            ...newSectionData,
            timestamp: new Date().toISOString(),
        };
        setSections(prevSections => [...prevSections, section]);
    };

    const handleUpdateSection = (updatedSection: ContentSection) => {
        setSections(prevSections =>
            prevSections.map(section =>
                section.id === updatedSection.id ? updatedSection : section
            )
        );
    };

    const handleDeleteSection = (id: string) => {
        setSections(prevSections => prevSections.filter(section => section.id !== id));
    };

    const handleEditClick = (section: ContentSection) => {
        setEditingSection(section);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingSection(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Content Planner</Typography>
                <Button 
                    variant="contained" 
                    onClick={() => setIsDialogOpen(true)}
                >
                    Create New Content
                </Button>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                },
                gap: 3
            }}>
                {sections.length > 0 ? (
                    sections.map((section) => (
                        <ContentCard
                            key={section.id}
                            section={section}
                            onDelete={handleDeleteSection}
                            onEdit={handleEditClick}
                            platforms={PLATFORMS}
                        />
                    ))
                ) : (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{
                            textAlign: 'center',
                            width: '100%',
                            gridColumn: '1 / -1',
                            p: 4
                        }}
                    >
                        No content sections yet. Create one above!
                    </Typography>
                )}
            </Box>

            <ContentDialog
                open={isDialogOpen}
                onClose={handleDialogClose}
                onSubmit={editingSection ? handleUpdateSection : handleAddSection}
                editingSection={editingSection}
                platforms={PLATFORMS}
                defaultValues={defaultNewSection}
            />
        </Box>
    );
};

export default ContentPlanner;
