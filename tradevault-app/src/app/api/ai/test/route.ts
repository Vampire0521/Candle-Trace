// =============================================
// CANDLE TRACE - AI TEST ENDPOINT
// Simple endpoint to test AI connectivity
// =============================================

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    const results: Record<string, unknown> = {
        geminiKey: geminiKey ? 'SET' : 'NOT SET',
        groqKey: groqKey ? 'SET' : 'NOT SET',
    };

    // Test Groq (now our primary provider)
    if (groqKey) {
        try {
            const groq = new Groq({ apiKey: groqKey });
            const completion = await groq.chat.completions.create({
                model: 'openai/gpt-oss-safeguard-20b',
                messages: [{ role: 'user', content: 'Say "Hello from Candle Trace AI!" in exactly those words.' }],
                max_tokens: 50,
            });

            results['groq_success'] = true;
            results['groq_response'] = completion.choices[0]?.message?.content;
            results['groq_model'] = 'openai/gpt-oss-safeguard-20b';
        } catch (error) {
            results['groq_success'] = false;
            results['groq_error'] = error instanceof Error ? error.message : String(error);
        }
    }

    return NextResponse.json(results);
}
