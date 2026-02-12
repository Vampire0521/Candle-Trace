// =============================================
// CANDLE TRACE - UNIFIED AI CLIENT
// Auto-selects best available AI provider
// Now prioritizing Groq (more reliable free tier)
// =============================================

import * as gemini from './gemini';
import * as groq from './groq';

export type AIProvider = 'gemini' | 'groq';

// Get the best available AI provider (Groq first - more reliable)
export function getAvailableProvider(): AIProvider | null {
    if (groq.isGroqAvailable()) return 'groq';
    if (gemini.isGeminiAvailable()) return 'gemini';
    return null;
}

// Generate text using best available provider
export async function generateText(prompt: string): Promise<string | null> {
    // Try Groq first (more reliable free tier)
    if (groq.isGroqAvailable()) {
        const result = await groq.generateText(prompt);
        if (result) return result;
    }

    // Fall back to Gemini
    if (gemini.isGeminiAvailable()) {
        return gemini.generateText(prompt);
    }

    console.error('No AI provider available');
    return null;
}

// Generate JSON using best available provider
export async function generateJSON<T>(prompt: string): Promise<T | null> {
    // Try Groq first
    if (groq.isGroqAvailable()) {
        const result = await groq.generateJSON<T>(prompt);
        if (result) return result;
    }

    // Fall back to Gemini
    if (gemini.isGeminiAvailable()) {
        return gemini.generateJSON<T>(prompt);
    }

    console.error('No AI provider available');
    return null;
}

// Chat using best available provider
export async function chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string
): Promise<string | null> {
    // Try Groq first
    if (groq.isGroqAvailable()) {
        const groqMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

        if (systemPrompt) {
            groqMessages.push({ role: 'system', content: systemPrompt });
        }

        groqMessages.push(...messages);
        const result = await groq.chat(groqMessages);
        if (result) return result;
    }

    // Fall back to Gemini
    if (gemini.isGeminiAvailable()) {
        const geminiMessages = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
        })) as Array<{ role: 'user' | 'model'; content: string }>;

        return gemini.chat(geminiMessages, systemPrompt);
    }

    console.error('No AI provider available');
    return null;
}

// Check if any AI is available
export function isAIAvailable(): boolean {
    return groq.isGroqAvailable() || gemini.isGeminiAvailable();
}

// Export individual providers
export { gemini, groq };
