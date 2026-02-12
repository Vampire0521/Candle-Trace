// =============================================
// CANDLE TRACE - GOOGLE GEMINI AI CLIENT
// Free AI provider for trade analysis
// =============================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GOOGLE_GEMINI_API_KEY not set. AI features will be disabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Get Gemini model - using gemini-2.0-flash (latest free model)
export function getGeminiModel() {
    if (!genAI) return null;
    // Use gemini-2.0-flash for latest free tier
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// Generate text response
export async function generateText(prompt: string): Promise<string | null> {
    const model = getGeminiModel();
    if (!model) {
        console.error('Gemini model not available');
        return null;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        return null;
    }
}

// Generate structured JSON response
export async function generateJSON<T>(prompt: string): Promise<T | null> {
    const model = getGeminiModel();
    if (!model) return null;

    try {
        // Add explicit JSON instruction to the prompt
        const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.`;

        const result = await model.generateContent(jsonPrompt);
        const text = result.response.text();

        // Clean the response - remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.slice(7);
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.slice(3);
        }
        if (cleanText.endsWith('```')) {
            cleanText = cleanText.slice(0, -3);
        }
        cleanText = cleanText.trim();

        return JSON.parse(cleanText) as T;
    } catch (error) {
        console.error('Gemini JSON generation error:', error);
        return null;
    }
}

// Chat interface for conversational AI
export async function chat(
    messages: Array<{ role: 'user' | 'model'; content: string }>,
    systemPrompt?: string
): Promise<string | null> {
    const model = getGeminiModel();
    if (!model) return null;

    try {
        // For simple single-turn, just use generateContent
        if (messages.length === 1) {
            const prompt = systemPrompt
                ? `${systemPrompt}\n\nUser: ${messages[0].content}`
                : messages[0].content;
            const result = await model.generateContent(prompt);
            return result.response.text();
        }

        // For multi-turn, build the context as a single prompt
        let fullPrompt = systemPrompt ? `${systemPrompt}\n\n` : '';
        for (const msg of messages) {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            fullPrompt += `${role}: ${msg.content}\n\n`;
        }
        fullPrompt += 'Assistant:';

        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (error) {
        console.error('Gemini chat error:', error);
        return null;
    }
}

// Check if Gemini is available
export function isGeminiAvailable(): boolean {
    return genAI !== null && apiKey !== undefined && apiKey.length > 0;
}
