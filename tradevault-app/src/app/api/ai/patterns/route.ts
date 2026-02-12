// =============================================
// CANDLE TRACE - AI PATTERNS API ROUTE
// Detect trading patterns in history
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON, isAIAvailable } from '@/lib/ai';
import { getPatternDetectionPrompt } from '@/lib/ai/prompts';
import type { Trade, PatternDetectionResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get stored patterns
        const { data: patterns, error } = await supabase
            .from('ai_patterns')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ data: patterns });
    } catch (error) {
        console.error('Error fetching AI patterns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch patterns' },
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

        const { days = 30 } = await request.json();

        // Fetch trades for analysis
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: trades, error: tradesError } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', user.id)
            .gte('trade_date', startDate.toISOString().split('T')[0])
            .order('trade_date', { ascending: false });

        if (tradesError) throw tradesError;

        if (!trades || trades.length < 5) {
            return NextResponse.json(
                { error: 'Need at least 5 trades to detect patterns' },
                { status: 400 }
            );
        }

        // Generate pattern analysis
        const prompt = getPatternDetectionPrompt(trades as Trade[]);
        const patterns = await generateJSON<PatternDetectionResponse>(prompt);

        if (!patterns) {
            return NextResponse.json(
                { error: 'Failed to detect patterns' },
                { status: 500 }
            );
        }

        // Store winning patterns
        const patternRecords = [];

        for (const pattern of patterns.winning_patterns) {
            patternRecords.push({
                user_id: user.id,
                pattern_type: 'winning',
                name: pattern.name,
                description: pattern.description,
                criteria: { frequency: pattern.frequency },
                occurrence_count: 1,
                is_active: true,
            });
        }

        for (const pattern of patterns.losing_patterns) {
            patternRecords.push({
                user_id: user.id,
                pattern_type: 'losing',
                name: pattern.name,
                description: pattern.description,
                criteria: { frequency: pattern.frequency },
                occurrence_count: 1,
                is_active: true,
            });
        }

        // Deactivate old patterns and insert new ones
        await supabase
            .from('ai_patterns')
            .update({ is_active: false })
            .eq('user_id', user.id);

        if (patternRecords.length > 0) {
            const { error: insertError } = await supabase
                .from('ai_patterns')
                .insert(patternRecords);

            if (insertError) throw insertError;
        }

        return NextResponse.json({
            data: {
                winning_patterns: patterns.winning_patterns,
                losing_patterns: patterns.losing_patterns,
                key_insight: patterns.key_insight,
                trades_analyzed: trades.length,
            }
        });
    } catch (error) {
        console.error('Error detecting patterns:', error);
        return NextResponse.json(
            { error: 'Failed to detect patterns' },
            { status: 500 }
        );
    }
}
