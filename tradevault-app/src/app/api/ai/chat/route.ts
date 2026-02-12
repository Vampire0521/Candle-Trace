// =============================================
// CANDLE TRACE - AI CHAT API ROUTE
// "Ask Candle Trace" natural language queries
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chat, isAIAvailable } from '@/lib/ai';
import { getChatContextPrompt, CANDLETRACE_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import type { Trade } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversation_id');

        if (conversationId) {
            // Get messages for specific conversation
            const { data: messages, error } = await supabase
                .from('ai_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            return NextResponse.json({ data: messages });
        }

        // Get all conversations
        const { data: conversations, error } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ data: conversations });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chat data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isAIAvailable()) {
            return NextResponse.json(
                { error: 'AI service not configured. Please add API keys.' },
                { status: 503 }
            );
        }

        const { message, conversation_id } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        let conversationId = conversation_id;

        // Create new conversation if needed
        if (!conversationId) {
            const { data: newConv, error: convError } = await supabase
                .from('ai_conversations')
                .insert({
                    user_id: user.id,
                    title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
                })
                .select()
                .single();

            if (convError) throw convError;
            conversationId = newConv.id;
        }

        // Store user message
        await supabase
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                role: 'user',
                content: message,
            });

        // Fetch user's trades for context
        const { data: trades } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', user.id)
            .order('trade_date', { ascending: false })
            .limit(50);

        // Get conversation history
        const { data: history } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(20);

        // Build messages for AI
        const messages = (history || []).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        // Add trade context to system prompt
        const contextPrompt = getChatContextPrompt(trades as Trade[] || [], message);
        const systemPrompt = `${CANDLETRACE_SYSTEM_PROMPT}\n\n${contextPrompt}`;

        // Generate AI response
        const response = await chat(messages, systemPrompt);

        if (!response) {
            return NextResponse.json(
                { error: 'Failed to generate response' },
                { status: 500 }
            );
        }

        // Store assistant response
        const { data: assistantMessage, error: msgError } = await supabase
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: response,
            })
            .select()
            .single();

        if (msgError) throw msgError;

        // Update conversation timestamp
        await supabase
            .from('ai_conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return NextResponse.json({
            data: {
                conversation_id: conversationId,
                message: assistantMessage,
            }
        });
    } catch (error) {
        console.error('Error in AI chat:', error);
        return NextResponse.json(
            { error: 'Failed to process chat' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversation_id');

        if (!conversationId) {
            return NextResponse.json(
                { error: 'conversation_id is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('id', conversationId)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return NextResponse.json(
            { error: 'Failed to delete conversation' },
            { status: 500 }
        );
    }
}
