const transcribeVideo = async (file) => {
    if (!file) {
        throw new Error('No file provided');
    }

    const API_KEY_ID = import.meta.env.VITE_SPEACH_FLOW_KEY;
    const API_KEY_SECRET = import.meta.env.VITE_SPEACH_FLOW_SECRET_KEY;

    const LANG = "en";
    const RESULT_TYPE = 4; // Plain text format

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', LANG);

    try {
        // Create transcription task
        const createResponse = await fetch('https://api.speechflow.io/asr/file/v1/create', {
            method: 'POST',
            headers: {
                'keyId': API_KEY_ID,
                'keySecret': API_KEY_SECRET,
            },
            body: formData
        });

        const createResult = await createResponse.json();

        if (createResult.code !== 10000) {
            throw new Error(`Failed to create transcription task: ${createResult.msg}`);
        }

        const taskId = createResult.taskId;

        // Poll for results
        while (true) {
            const queryResponse = await fetch(
                `https://api.speechflow.io/asr/file/v1/query?taskId=${taskId}&resultType=${RESULT_TYPE}`,
                {
                    method: 'GET',
                    headers: {
                        'keyId': API_KEY_ID,
                        'keySecret': API_KEY_SECRET,
                    },
                }
            );

            const queryResult = await queryResponse.json();

            if (queryResult.code === 11000) {
                // Success - return the transcript
                return queryResult.result;
            } else if (queryResult.code === 11001) {
                // Still processing - wait 3 seconds before next attempt
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                throw new Error(`Transcription failed: ${queryResult.msg}`);
            }
        }
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
};

export default transcribeVideo;
