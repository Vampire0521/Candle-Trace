// =============================================
// CANDLE TRACE - GROQ AI CLIENT (BACKUP)
// Ultra-fast inference for Llama models
// =============================================

import Groq from 'groq-sdk';

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.warn('GROQ_API_KEY not set. Groq backup will be disabled.');
}

const groq = apiKey ? new Groq({ apiKey }) : null;

// Default model: GPT-OSS Safeguard 20B (user preference)
const DEFAULT_MODEL = 'openai/gpt-oss-safeguard-20b';

// Generate text response
export async function generateText(
    prompt: string,
    model: string = DEFAULT_MODEL
): Promise<string | null> {
    if (!groq) {
        console.error('Groq client not available');
        return null;
    }

    try {
        const completion = await groq.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
        });

        return completion.choices[0]?.message?.content || null;
    } catch (error) {
        console.error('Groq API error:', error);
        return null;
    }
}

// Generate structured JSON response
export async function generateJSON<T>(
    prompt: string,
    model: string = DEFAULT_MODEL
): Promise<T | null> {
    if (!groq) return null;

    try {
        const completion = await groq.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that responds only with valid JSON. No markdown, no explanation, just JSON.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 2048,
            response_format: { type: 'json_object' },
        });

        const text = completion.choices[0]?.message?.content;
        if (!text) return null;
        return JSON.parse(text) as T;
    } catch (error) {
        console.error('Groq JSON generation error:', error);
        return null;
    }
}

// Chat interface
export async function chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    model: string = DEFAULT_MODEL
): Promise<string | null> {
    if (!groq) return null;

    try {
        const completion = await groq.chat.completions.create({
            model,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
            temperature: 0.7,
            max_tokens: 2048,
        });

        return completion.choices[0]?.message?.content || null;
    } catch (error) {
        console.error('Groq chat error:', error);
        return null;
    }
}

// Check if Groq is available
export function isGroqAvailable(): boolean {
    return groq !== null;
}

// Available models
export const GROQ_MODELS = {
    LLAMA_70B: 'llama-3.1-70b-versatile',
    LLAMA_8B: 'llama-3.1-8b-instant',
    MIXTRAL: 'mixtral-8x7b-32768',
    GEMMA: 'gemma2-9b-it',
} as const;
