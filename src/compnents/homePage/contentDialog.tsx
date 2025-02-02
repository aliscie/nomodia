import React, {useState, useEffect} from 'react';
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
    CircularProgress,
} from '@mui/material';
import {ContentSection, NewSection} from './types';
import {generateVideoMetadata} from "@/utils/generate_content_deitals";

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
    transcript?: string | null;
}

const useFormData = (editingSection: ContentSection | null, defaultValues: NewSection) => {
    const [formData, setFormData] = useState<NewSection>(defaultValues);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (editingSection) {
            setFormData({
                platform: editingSection.platform,
                goal: editingSection.goal,
                title: editingSection.title,
                description: editingSection.description,
                tags: editingSection.tags,
            });
            setTagInput(editingSection.tags.join(', '));
        } else {
            setFormData(defaultValues);
            setTagInput('');
        }
    }, [editingSection, defaultValues]);

    return {formData, setFormData, tagInput, setTagInput};
};

const ContentDialog: React.FC<ContentDialogProps> = ({
                                                         open,
                                                         onClose,
                                                         onSubmit,
                                                         editingSection,
                                                         platforms,
                                                         defaultValues,
                                                         transcript,
                                                     }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const {formData, setFormData, tagInput, setTagInput} = useFormData(editingSection, defaultValues);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field: keyof NewSection) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (field === 'tags') {
            setTagInput(event.target.value);
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: event.target.value
            }));
        }
    };

    const processFormData = () => {
        // Process tags only during submission
        const processedTags = tagInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        return {
            ...formData,
            tags: processedTags
        };
    };

    const handleRegenerate = async () => {
        if (!transcript) {
            return;
        }

        setIsLoading(true);
        try {
            const contentDetails = await generateVideoMetadata(
                `platform target:${formData.platform} ,Goal: ${formData.goal}\n\nTranscript: ${transcript}`
            );

            setFormData(prev => ({
                ...prev,
                title: contentDetails.title || prev.title,
                description: contentDetails.description || prev.description,
            }));
            setTagInput(contentDetails.tags?.join(', ') || tagInput);
        } catch (error) {
            console.error('Error regenerating metadata:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const processedData = processFormData();

        try {
            onSubmit({
                ...processedData,
                id: editingSection.id,
                timestamp: editingSection.timestamp,
            });

        } catch (error) {
            console.error('Error generating metadata:', error);
            if (editingSection) {
                onSubmit({
                    ...processedData,
                    id: editingSection.id,
                    timestamp: editingSection.timestamp,
                });
            } else {
                onSubmit(processedData);
            }
        } finally {
            setIsLoading(false);
            onClose();
        }
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
                            value={tagInput}
                            onChange={handleInputChange('tags')}
                            helperText="Enter tags separated by commas"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    {transcript && (
                        <Button
                            onClick={handleRegenerate}
                            color="secondary"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20}/> : null}
                        >
                            Regenerate
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!formData.title.trim() || !formData.description.trim() || isLoading}
                        startIcon={isLoading ? <CircularProgress size={20}/> : null}
                    >
                        {editingSection ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContentDialog;
