// =============================================
// CANDLE TRACE - AI INSIGHTS API ROUTE
// Generate AI-powered trade analysis
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON, isAIAvailable } from '@/lib/ai';
import { getTradeAnalysisPrompt } from '@/lib/ai/prompts';
import type { Trade, TradeAnalysisResponse, AIInsight } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get trade_id from query params
        const { searchParams } = new URL(request.url);
        const tradeId = searchParams.get('trade_id');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (tradeId) {
            // Get insight for specific trade
            const { data: insight, error } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('trade_id', tradeId)
                .eq('insight_type', 'trade_analysis')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return NextResponse.json({ data: insight });
        }

        // Get all recent insights
        const { data: insights, error } = await supabase
            .from('ai_insights')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return NextResponse.json({ data: insights });
    } catch (error) {
        console.error('Error fetching AI insights:', error);
        return NextResponse.json(
            { error: 'Failed to fetch insights' },
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

        // Check if AI is available
        if (!isAIAvailable()) {
            return NextResponse.json(
                { error: 'AI service not configured. Please add API keys.' },
                { status: 503 }
            );
        }

        const { trade_id } = await request.json();

        if (!trade_id) {
            return NextResponse.json(
                { error: 'trade_id is required' },
                { status: 400 }
            );
        }

        // Fetch the trade
        const { data: trade, error: tradeError } = await supabase
            .from('trades')
            .select('*')
            .eq('id', trade_id)
            .eq('user_id', user.id)
            .single();

        if (tradeError || !trade) {
            return NextResponse.json(
                { error: 'Trade not found' },
                { status: 404 }
            );
        }

        // Check if we already have a recent analysis
        const { data: existingInsight } = await supabase
            .from('ai_insights')
            .select('*')
            .eq('trade_id', trade_id)
            .eq('insight_type', 'trade_analysis')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .single();

        if (existingInsight) {
            return NextResponse.json({ data: existingInsight });
        }

        // Generate AI analysis
        const prompt = getTradeAnalysisPrompt(trade as Trade);
        const analysis = await generateJSON<TradeAnalysisResponse>(prompt);

        if (!analysis) {
            return NextResponse.json(
                { error: 'Failed to generate analysis' },
                { status: 500 }
            );
        }

        // Store the insight
        const insightData: Partial<AIInsight> = {
            user_id: user.id,
            trade_id: trade_id,
            insight_type: 'trade_analysis',
            title: analysis.summary,
            content: JSON.stringify({
                strengths: analysis.strengths,
                improvements: analysis.improvements,
                lessons: analysis.lessons,
            }),
            confidence: analysis.score / 10,
            metadata: { score: analysis.score },
            is_read: false,
        };

        const { data: newInsight, error: insertError } = await supabase
            .from('ai_insights')
            .insert(insightData)
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({
            data: {
                ...newInsight,
                analysis, // Include parsed analysis for immediate use
            }
        });
    } catch (error) {
        console.error('Error generating AI insight:', error);
        return NextResponse.json(
            { error: 'Failed to generate insight' },
            { status: 500 }
        );
    }
}
