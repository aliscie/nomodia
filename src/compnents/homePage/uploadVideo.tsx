import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Paper,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Close as CloseIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
} from '@mui/icons-material';

interface VideoUploadProps {
    onUpload: (file: File) => Promise<void>;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    savedVideo?: File | null;
    savedVideoUrl?: string | null;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
    onUpload,
    maxSizeMB = 100,
    acceptedFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    savedVideo,
    savedVideoUrl
}) => {
    const theme = useTheme();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(savedVideo || null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(savedVideoUrl || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (savedVideo && savedVideoUrl) {
            setSelectedVideo(savedVideo);
            setPreviewUrl(savedVideoUrl);
        }
    }, [savedVideo, savedVideoUrl]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File): string | null => {
        if (!acceptedFormats.includes(file.type)) {
            return 'Invalid file format. Please upload a video file.';
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File size exceeds ${maxSizeMB}MB limit.`;
        }
        return null;
    };

    const handleFile = useCallback(async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setSelectedVideo(file);
        setPreviewUrl(URL.createObjectURL(file));

        try {
            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 10) {
                setUploadProgress(progress);
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            await onUpload(file);
        } catch (err) {
            setError('Failed to upload video. Please try again.');
            console.error('Upload error:', err);
        }
    }, [maxSizeMB, acceptedFormats, onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleClear = useCallback(() => {
        setSelectedVideo(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setError(null);
        localStorage.removeItem('videoData');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    return (
        <Paper
            sx={{
                p: 3,
                backgroundColor: theme.palette.background.paper,
                border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                },
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                style={{display: 'none'}}
                onChange={handleFileSelect}
            />

            {!selectedVideo ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <UploadIcon sx={{fontSize: 48, color: theme.palette.primary.main}}/>
                    <Typography variant="h6">
                        Drag and drop your video here or click to browse
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Supported formats: MP4, MOV, AVI (Max size: {maxSizeMB}MB)
                    </Typography>
                </Box>
            ) : (
                <Box sx={{position: 'relative', width: '100%'}}>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        sx={{
                            position: 'absolute',
                            right: -16,
                            top: -16,
                            zIndex: 1,
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>

                    {previewUrl && (
                        <Box sx={{position: 'relative', width: '100%', aspectRatio: '16/9'}}>
                            <video
                                ref={videoRef}
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: theme.shape.borderRadius,
                                }}
                            />
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlayPause();
                                }}
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    },
                                }}
                            >
                                {isPlaying ? (
                                    <PauseIcon sx={{color: 'white'}}/>
                                ) : (
                                    <PlayIcon sx={{color: 'white'}}/>
                                )}
                            </IconButton>
                        </Box>
                    )}

                    <Box sx={{mt: 2}}>
                        <Typography variant="body2" sx={{mb: 1}}>
                            {selectedVideo.name} ({(selectedVideo.size / (1024 * 1024)).toFixed(2)}MB)
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={uploadProgress}
                            sx={{height: 8, borderRadius: 4}}
                        />
                    </Box>
                </Box>
            )}

            {error && (
                <Typography
                    color="error"
                    variant="body2"
                    sx={{mt: 2, textAlign: 'center'}}
                >
                    {error}
                </Typography>
            )}
        </Paper>
    );
};

export default VideoUpload;
