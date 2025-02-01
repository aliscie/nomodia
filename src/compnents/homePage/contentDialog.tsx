import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    MenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { ContentSection, NewSection } from './types';

interface Platform {
    value: string;
    label: string;
    icon: string;
}

interface ContentDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ContentSection | NewSection) => void;
    editingSection: ContentSection | null;
    platforms: Platform[];
    defaultValues: NewSection;
}

const useFormData = (editingSection: ContentSection | null, defaultValues: NewSection) => {
    const [formData, setFormData] = useState<NewSection>(defaultValues);

    useEffect(() => {
        if (editingSection) {
            setFormData({
                platform: editingSection.platform,
                goal: editingSection.goal,
                title: editingSection.title,
                description: editingSection.description,
                tags: editingSection.tags,
            });
        } else {
            setFormData(defaultValues);
        }
    }, [editingSection, defaultValues]);

    return { formData, setFormData };
};

const ContentDialog: React.FC<ContentDialogProps> = ({
    open,
    onClose,
    onSubmit,
    editingSection,
    platforms,
    defaultValues,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { formData, setFormData } = useFormData(editingSection, defaultValues);

    const handleInputChange = (field: keyof NewSection) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (field === 'tags') {
            const tagsArray = event.target.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== '');
            setFormData(prev => ({
                ...prev,
                tags: tagsArray
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: event.target.value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSection) {
            onSubmit({
                ...formData,
                id: editingSection.id,
                timestamp: editingSection.timestamp,
            });
        } else {
            onSubmit(formData);
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {editingSection ? 'Edit Content' : 'Create New Content'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        mt: 2
                    }}>
                        <TextField
                            select
                            fullWidth
                            label="Platform"
                            value={formData.platform}
                            onChange={handleInputChange('platform')}
                            required
                        >
                            {platforms.map((platform) => (
                                <MenuItem key={platform.value} value={platform.value}>
                                    {platform.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Goal"
                            value={formData.goal}
                            onChange={handleInputChange('goal')}
                            placeholder="E.g., Increase engagement, Drive traffic"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={handleInputChange('title')}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange('description')}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Tags"
                            value={formData.tags.join(', ')}
                            onChange={handleInputChange('tags')}
                            helperText="Enter tags separated by commas"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!formData.title.trim() || !formData.description.trim()}
                    >
                        {editingSection ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContentDialog;
