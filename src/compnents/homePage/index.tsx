import {useEffect, useState} from 'react';
import {Box, CircularProgress, Typography} from '@mui/material';
import {useBackendContext} from '@/utils/backendContext';
import transcribeVideo from "@/utils/transcripter";
import VideoUpload from "@/compnents/homePage/uploadVideo";
import ContentPlanner from "@/compnents/homePage/contentPlanner";
import TranscriptComponent from "@/compnents/homePage/transcriptViewer";

interface VideoData {
    videoUrl: string | null;
    transcript: string | null;
    videoName: string | null;
}

function Index() {
    const {login, logout, backendActor} = useBackendContext();
    const [count, setCount] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);
    const [transcriptionLoading, setTranscriptionLoading] = useState(false);
    const [videoData, setVideoData] = useState<VideoData>(() => {
        try {
            const savedData = localStorage.getItem('videoData');
            return savedData ? JSON.parse(savedData) : {
                videoUrl: null,
                transcript: null,
                videoName: null
            };
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return {
                videoUrl: null,
                transcript: null,
                videoName: null
            };
        }
    });

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const fetchCount = async () => {
        try {
            setLoading(true);
            const count = await backendActor.get();
            setCount(count);
        } catch (err) {
            console.error('Error fetching count:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoUpload = async (file: File) => {
        try {
            setTranscriptionLoading(true);
            console.log('Starting video transcription...');

            const videoUrl = await fileToBase64(file);
            const transcript = await transcribeVideo(file);

            const newVideoData = {
                videoUrl,
                transcript,
                videoName: file.name
            };

            setVideoData(newVideoData);
            localStorage.setItem('videoData', JSON.stringify(newVideoData));

            return transcript;
        } catch (error) {
            console.error('Error during video upload and transcription:', error);
            throw error;
        } finally {
            setTranscriptionLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();
    }, []);

    const getVideoFile = (): File | null => {
        if (!videoData.videoUrl) return null;

        try {
            const arr = videoData.videoUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1];
            const bstr = atob(arr[1]);
            const n = bstr.length;
            const u8arr = new Uint8Array(n);

            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.charCodeAt(i);
            }

            return new File([u8arr], videoData.videoName || 'video', {type: mime || 'video/mp4'});
        } catch (error) {
            console.error('Error converting base64 to File:', error);
            return null;
        }
    };

    return (
        <Box sx={{p: 3}}>
            <VideoUpload
                onUpload={handleVideoUpload}
                savedVideo={getVideoFile()}
                savedVideoUrl={videoData.videoUrl}
            />
            <TranscriptComponent
                transcript={videoData.transcript}
                // onTranscriptChange={handleTranscriptChange}
                // onSegmentSelect={handleSegmentSelect}
            />


            {transcriptionLoading && (
                <Box sx={{
                    mt: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                }}>
                    <CircularProgress size={24}/>
                    <Typography variant="body1" color="text.secondary">
                        Transcribing video... Please wait.
                    </Typography>
                </Box>
            )}

            <Box sx={{mt: 4}}>
                <ContentPlanner transcript={videoData.transcript}/>
            </Box>
        </Box>
    );
}

export default Index;
