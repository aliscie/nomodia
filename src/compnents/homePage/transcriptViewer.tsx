import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    TextField,
    IconButton,
    Button,
    Collapse,
    Paper,
    Divider,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    ContentCopy as ContentCopyIcon,
    ExpandMore as ExpandMoreIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';

interface TranscriptSegment {
    id: string;
    startTime: string;
    endTime: string;
    text: string;
}

interface TranscriptProps {
    transcript: string | null;
    onTranscriptChange?: (newTranscript: string) => void;
    onSegmentSelect?: (segment: TranscriptSegment) => void;
}

interface SegmentEditorProps {
    segment: TranscriptSegment;
    onSave: (updatedSegment: TranscriptSegment) => void;
    onCancel: () => void;
}

const SegmentEditor: React.FC<SegmentEditorProps> = ({ segment, onSave, onCancel }) => {
    const [editedText, setEditedText] = useState(segment.text);

    const handleSave = () => {
        onSave({
            ...segment,
            text: editedText,
        });
    };

    return (
        <Box sx={{ mt: 1 }}>
            <TextField
                fullWidth
                multiline
                rows={3}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                variant="outlined"
                size="small"
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
};

const TranscriptComponent: React.FC<TranscriptProps> = ({
    transcript,
    onTranscriptChange,
    onSegmentSelect,
}) => {
    const theme = useTheme();
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const [expanded, setExpanded] = useState(true);
    const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
    const [showCopyDialog, setShowCopyDialog] = useState(false);

    useEffect(() => {
        if (transcript) {
            // Parse transcript into segments
            // This is a simple example - you might need more complex parsing logic
            const parsedSegments = transcript.split('\n\n').map((segment, index) => ({
                id: `segment-${index}`,
                startTime: '00:00:00',  // You would parse these from actual transcript
                endTime: '00:00:00',
                text: segment.trim(),
            }));
            setSegments(parsedSegments);
        }
    }, [transcript]);

    const handleCopyToClipboard = () => {
        const fullText = segments.map(segment => segment.text).join('\n\n');
        navigator.clipboard.writeText(fullText)
            .then(() => setShowCopyDialog(true))
            .catch(err => console.error('Failed to copy text:', err));
    };

    const handleSegmentEdit = (segmentId: string) => {
        setEditingSegmentId(segmentId);
    };

    const handleSegmentSave = (updatedSegment: TranscriptSegment) => {
        const updatedSegments = segments.map(segment =>
            segment.id === updatedSegment.id ? updatedSegment : segment
        );
        setSegments(updatedSegments);
        setEditingSegmentId(null);

        if (onTranscriptChange) {
            const newTranscript = updatedSegments.map(s => s.text).join('\n\n');
            onTranscriptChange(newTranscript);
        }
    };

    const handleSegmentClick = (segment: TranscriptSegment) => {
        if (onSegmentSelect) {
            onSegmentSelect(segment);
        }
    };

    return (
        <Card sx={{ mt: 2 }}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Video Transcript</Typography>
                        <Box>
                            <IconButton onClick={() => setExpanded(!expanded)}>
                                <ExpandMoreIcon
                                    sx={{
                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: theme.transitions.create('transform'),
                                    }}
                                />
                            </IconButton>
                            <IconButton onClick={handleCopyToClipboard}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Box>
                    </Box>
                }
            />
            <Collapse in={expanded}>
                <CardContent>
                    <Paper
                        variant="outlined"
                        sx={{
                            maxHeight: '400px',
                            overflow: 'auto',
                            p: 2
                        }}
                    >
                        {segments.map((segment, index) => (
                            <Box key={segment.id}>
                                {index > 0 && <Divider sx={{ my: 2 }} />}
                                <Box
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                        p: 1,
                                        borderRadius: 1,
                                    }}
                                    onClick={() => handleSegmentClick(segment)}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" color="textSecondary">
                                            {segment.startTime} - {segment.endTime}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSegmentEdit(segment.id);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    {editingSegmentId === segment.id ? (
                                        <SegmentEditor
                                            segment={segment}
                                            onSave={handleSegmentSave}
                                            onCancel={() => setEditingSegmentId(null)}
                                        />
                                    ) : (
                                        <Typography variant="body2">
                                            {segment.text}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </CardContent>
            </Collapse>

            <Dialog
                open={showCopyDialog}
                onClose={() => setShowCopyDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                    <Typography>
                        Transcript has been copied to clipboard!
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCopyDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default TranscriptComponent;
