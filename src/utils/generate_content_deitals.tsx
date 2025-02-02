const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const apiKey = "AIzaSyAFXgfwMlJkqSa330Fcl7G7Se81jENmDQw"

async function generateVideoMetadata(script) {
    try {
        const response = await fetch(
            `${GEMINI_API_ENDPOINT}?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: ` Act as a marketing export and Generate YouTube video metadata in JSON format for this script: ${script}
                            
                            Requirements:
                            1. Title should be catchy and SEO-optimized (max 70 chars)
                            2. Description should be engaging (max 5000 chars)
                            3. Tags should be relevant keywords and used on the internet to help me getting viral (max 500 chars total)
                            
                            Format the response as:
                            {
                                "title": "your title here",
                                "description": "your description here",
                                "tags": ["tag1", "tag2", "tag3"]
                            }`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if we have a valid response
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response format from Gemini API');
        }

        // Extract JSON from the response text
        const responseText = data.candidates[0].content.parts[0].text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from response');
        }
        const cleanJsonString = jsonMatch[0]
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
            .replace(/\\"/g, '"')                  // Handle escaped quotes
            .replace(/\r?\n|\r/g, ' ')            // Replace newlines with spaces
            .replace(/\s+/g, ' ')                 // Normalize whitespace
            .trim();

        const metadata = JSON.parse(cleanJsonString);

        // Clean and validate the metadata
        const cleanedMetadata = {
            title: (metadata.title || '').slice(0, 70),
            description: (metadata.description || '').slice(0, 5000),
            tags: (metadata.tags || [])
                .filter(tag => typeof tag === 'string')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
        };

        // Ensure total tags length doesn't exceed 500 characters
        let totalTagLength = 0;
        cleanedMetadata.tags = cleanedMetadata.tags.filter(tag => {
            if (totalTagLength + tag.length <= 500) {
                totalTagLength += tag.length;
                return true;
            }
            return false;
        });

        return cleanedMetadata;
    } catch (error) {
        console.error('Error generating video metadata:', error);
        throw error;
    }
}

// Example usage:
/*
const script = `Your video script goes here...`;
const apiKey = 'your-gemini-api-key'; // Get API key from Google AI Studio

generateVideoMetadata(script, apiKey)
    .then(metadata => {
        console.log('Generated Metadata:', metadata);
    })
    .catch(error => {
        console.error('Error:', error);
    });
*/

export {generateVideoMetadata};
