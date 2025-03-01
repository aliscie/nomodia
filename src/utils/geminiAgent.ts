import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Define valid spiral levels as a const array for type safety
export const SPIRAL_LEVELS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'] as const;
export type SpiralLevel = typeof SPIRAL_LEVELS[number];

// Define the GeminiEvent interface with proper types
export interface GeminiEvent {
  id: number;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  attendees: number;
  spiralLevel: SpiralLevel;
  emotionalLevel: number; // Scale from 1-21
  sourceUrl: string;
}

// Raw event data structure from API response
interface RawEventData {
  id?: number;
  title?: string;
  description?: string;
  startDateTime?: string;
  startDate?: string;
  start_date?: string;
  start?: string;
  endDateTime?: string;
  endDate?: string;
  end_date?: string;
  end?: string;
  attendees?: number;
  spiralLevel?: string;
  spiral_level?: string;
  emotionalLevel?: number;
  emotional_level?: number;
  sourceUrl?: string;
  source_url?: string;
  url?: string;
}

// Configuration for the Gemini API
const CONFIG = {
  MODEL_NAME: 'gemini-2.0-flash',
  DEFAULT_PROMPT: 'List of cultural and tourist events in Ubud, Bali for this week',
  FALLBACK_EVENT_COUNT: 8,
  MAX_EMOTIONAL_LEVEL: 21,
  DEFAULT_EVENT_DURATION: 2, // hours
};

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API client only if we have a key
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: CONFIG.MODEL_NAME });
} else {
  console.warn('Gemini API key is missing. Mock data will be used instead.');
}

/**
 * Creates a structured prompt for the Gemini API to generate event data
 * @param basePrompt - The base prompt to send to Gemini
 * @returns A detailed prompt with formatting instructions
 */
function createStructuredPrompt(basePrompt: string): string {
  return `${basePrompt}\n\n
    Please provide the following details for each event and return them in a structured JSON array format with these exact fields:
    - title: Event title
    - description: Full description
    - startDateTime: Start date and time (in ISO format)
    - endDateTime: End date and time (in ISO format)
    - attendees: Estimated number of attendees (numeric value)
    - spiralLevel: A spiral level color (must be one of: Red, Orange, Yellow, Green, Blue, Purple)
    - emotionalLevel: An emotional level rating from 1-21 (numeric value)
    - sourceUrl: IMPORTANT - A complete, valid URL (including https://) to the official event page or a reliable source with more information about the event
    
    Format the response as a valid JSON array of events with these exact field names. Example format:
    [{
      "title": "Event Name",
      "description": "Event description",
      "startDateTime": "2025-06-15T10:00:00",
      "endDateTime": "2025-06-15T12:00:00",
      "attendees": 50,
      "spiralLevel": "Blue",
      "emotionalLevel": 15,
      "sourceUrl": "https://www.ubudpalace.com/events/traditional-dance-performance"
    }]`;
}

/**
 * Extracts JSON from a text response that might contain markdown code blocks
 * @param text - The raw text response from Gemini
 * @returns The extracted JSON string or the original text if no code blocks found
 */
function extractJsonFromResponse(text: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                   text.match(/```([\s\S]*?)```/) ||
                   text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  
  return jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
}

/**
 * Validates and normalizes a date value
 * @param dateValue - The date value to validate (string or Date)
 * @param defaultDate - The default date to use if validation fails
 * @returns A valid Date object
 */
function validateDate(dateValue: any, defaultDate: Date): Date {
  if (!dateValue) return defaultDate;
  
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    return isNaN(date.getTime()) ? defaultDate : date;
  } catch (error) {
    return defaultDate;
  }
}

/**
 * Validates and normalizes a spiral level value
 * @param spiralValue - The spiral level value to validate
 * @returns A valid spiral level string
 */
function validateSpiralLevel(spiralValue: any): SpiralLevel {
  if (typeof spiralValue === 'string' && 
      SPIRAL_LEVELS.includes(spiralValue as SpiralLevel)) {
    return spiralValue as SpiralLevel;
  }
  
  // Return a random spiral level if invalid
  return SPIRAL_LEVELS[Math.floor(Math.random() * SPIRAL_LEVELS.length)];
}

/**
 * Validates and normalizes an emotional level value
 * @param emotionalValue - The emotional level value to validate
 * @returns A valid emotional level number
 */
function validateEmotionalLevel(emotionalValue: any): number {
  const level = Number(emotionalValue);
  
  if (!isNaN(level) && level >= 1 && level <= CONFIG.MAX_EMOTIONAL_LEVEL) {
    return level;
  }
  
  // Return a random emotional level if invalid
  return Math.floor(Math.random() * CONFIG.MAX_EMOTIONAL_LEVEL) + 1;
}

/**
 * Transforms raw event data into a properly formatted GeminiEvent
 * @param rawEvent - The raw event data from the API
 * @param index - The index of the event in the array
 * @returns A properly formatted GeminiEvent object
 */
function transformEventData(rawEvent: RawEventData, index: number): GeminiEvent {
  // Create default dates based on the current date and event index
  const today = new Date();
  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(today.getDate() + index);
  defaultStartDate.setHours(10, 0, 0, 0); // Default to 10:00 AM
  
  const defaultEndDate = new Date(defaultStartDate);
  defaultEndDate.setHours(defaultStartDate.getHours() + CONFIG.DEFAULT_EVENT_DURATION);
  
  // Parse and validate dates
  const startDateTime = validateDate(
    rawEvent.startDateTime || rawEvent.startDate || rawEvent.start_date || rawEvent.start,
    defaultStartDate
  );
  
  let endDateTime = validateDate(
    rawEvent.endDateTime || rawEvent.endDate || rawEvent.end_date || rawEvent.end,
    defaultEndDate
  );
  
  // Ensure end date is after start date
  if (endDateTime <= startDateTime) {
    endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + CONFIG.DEFAULT_EVENT_DURATION);
  }
  
  // Validate and normalize other fields
  const title = rawEvent.title?.trim() || `Event ${index + 1}`;
  const description = rawEvent.description?.trim() || '';
  const attendees = typeof rawEvent.attendees === 'number' && rawEvent.attendees > 0 
    ? rawEvent.attendees 
    : Math.floor(Math.random() * 50) + 10;
  
  const spiralLevel = validateSpiralLevel(rawEvent.spiralLevel || rawEvent.spiral_level);
  const emotionalLevel = validateEmotionalLevel(rawEvent.emotionalLevel || rawEvent.emotional_level);
  
  // Validate source URL
  let sourceUrl = rawEvent.sourceUrl || rawEvent.source_url || rawEvent.url || '';
  
  // Check if the URL is valid and has a proper protocol
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  if (!sourceUrl || !isValidUrl(sourceUrl)) {
    // Fallback to a more specific URL based on the event title
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    sourceUrl = `https://www.balitourismboard.org/events/${sanitizedTitle}-${index + 1}`;
  }
  
  return {
    id: rawEvent.id || index + 1,
    title,
    description,
    startDateTime,
    endDateTime,
    attendees,
    spiralLevel,
    emotionalLevel,
    sourceUrl
  };
}

/**
 * Queries the Gemini AI model to generate events based on the provided prompt
 * @param prompt - The text prompt to send to Gemini
 * @returns A Promise that resolves to an array of GeminiEvent objects
 */
export async function getEventsFromGemini(prompt: string = CONFIG.DEFAULT_PROMPT): Promise<GeminiEvent[]> {
  try {
    // Check if API is properly initialized
    if (!API_KEY || !genAI || !model) {
      console.warn('Gemini API not available. Using mock data instead.');
      return createMockEvents(CONFIG.FALLBACK_EVENT_COUNT);
    }

    // Create a structured prompt for better results
    const detailedPrompt = createStructuredPrompt(prompt);

    // Generate content with error handling
    const result = await model.generateContent(detailedPrompt);
    const response = await result.response;
    const text = response.text();

    // Extract and parse JSON from the response
    const jsonString = extractJsonFromResponse(text);

    try {
      const events = JSON.parse(jsonString);
      
      // Validate that we have an array
      if (!Array.isArray(events)) {
        console.warn('Gemini response is not an array. Using mock data instead.');
        return createMockEvents(CONFIG.FALLBACK_EVENT_COUNT);
      }
      
      // Transform and validate each event
      return events.map(transformEventData);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', text);
      return createMockEvents(CONFIG.FALLBACK_EVENT_COUNT);
    }
  } catch (error) {
    console.error('Error fetching events from Gemini:', error);
    return createMockEvents(CONFIG.FALLBACK_EVENT_COUNT);
  }
}

/**
 * Queries Gemini for events in Lisbon, Portugal
 * @returns A Promise that resolves to an array of GeminiEvent objects
 */
export async function getLisbonEvents(): Promise<GeminiEvent[]> {
  return getEventsFromGemini(
    'List of cultural, traditional, and tourist events happening in Lisbon, Portugal this week and next week'
  );
}

// Keep the original function for backward compatibility
export async function getUbudBaliEvents(): Promise<GeminiEvent[]> {
  return getLisbonEvents();
}

/**
 * Creates mock events when the API response can't be parsed or is unavailable
 * @param count - Number of mock events to create
 * @returns An array of GeminiEvent objects
 */
function createMockEvents(count: number): GeminiEvent[] {
  const events: GeminiEvent[] = [];
  // Ensure we're using the current year (2025)
  const today = new Date();
  
  const eventTitles = [
    'Ubud Art Exhibition',
    'Traditional Dance Performance',
    'Balinese Cooking Class',
    'Temple Ceremony',
    'Yoga Retreat',
    'Rice Terrace Tour',
    'Night Market Festival',
    'Cultural Workshop'
  ];
  
  const descriptions = [
    'Experience the vibrant art scene of Ubud with local artists showcasing their best works.',
    'Watch traditional Balinese dancers perform ancient stories with intricate movements and colorful costumes.',
    'Learn to prepare authentic Balinese dishes with local ingredients and traditional techniques.',
    'Witness a sacred temple ceremony that has been practiced for centuries in Balinese Hindu culture.',
    'Join a peaceful yoga session surrounded by the lush greenery of Ubud.',
    'Explore the famous rice terraces and learn about traditional farming methods.',
    'Enjoy local food, crafts, and performances at this vibrant night market.',
    'Participate in a hands-on workshop learning traditional Balinese crafts.'
  ];
  
  const sourceUrls = [
    'https://www.ubudartmarket.com',
    'https://www.ubudpalace.com/performances',
    'https://www.balicookingclass.com',
    'https://www.ubudtemples.com/ceremonies',
    'https://www.ubudyogahouse.com',
    'https://www.tegalalang-riceterrace.com',
    'https://www.ubudnightmarket.com',
    'https://www.balineseworkshops.com'
  ];
  
  for (let i = 0; i < count; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + i);
    startDate.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 2 + Math.floor(Math.random() * 3));
    
    events.push({
      id: i + 1,
      title: eventTitles[i % eventTitles.length],
      description: descriptions[i % descriptions.length],
      startDateTime: startDate,
      endDateTime: endDate,
      attendees: Math.floor(Math.random() * 50) + 10,
      spiralLevel: SPIRAL_LEVELS[Math.floor(Math.random() * SPIRAL_LEVELS.length)],
      emotionalLevel: Math.floor(Math.random() * CONFIG.MAX_EMOTIONAL_LEVEL) + 1,
      sourceUrl: sourceUrls[i % sourceUrls.length]
    });
  }
  
  return events;
}
