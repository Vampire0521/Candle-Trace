// =============================================
// CANDLE TRACE - AI TIPS API ROUTE
// Personalized improvement suggestions
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON, isAIAvailable } from '@/lib/ai';
import { getPersonalizedTipsPrompt } from '@/lib/ai/prompts';
import type { Trade, PersonalizedTipsResponse } from '@/types';
import { calculatePnL } from '@/lib/utils';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const includeDismissed = searchParams.get('include_dismissed') === 'true';

        // Get stored tips
        let query = supabase
            .from('ai_tips')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!includeDismissed) {
            query = query.eq('is_dismissed', false);
        }

        const { data: tips, error } = await query.limit(10);

        if (error) throw error;

        return NextResponse.json({ data: tips });
    } catch (error) {
        console.error('Error fetching AI tips:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tips' },
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

        // Fetch trades
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: trades, error: tradesError } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', user.id)
            .gte('trade_date', startDate.toISOString().split('T')[0])
            .order('trade_date', { ascending: false });

        if (tradesError) throw tradesError;

        if (!trades || trades.length < 3) {
            return NextResponse.json(
                { error: 'Need at least 3 trades to generate tips' },
                { status: 400 }
            );
        }

        // Fetch discipline stats
        const { data: emotions } = await supabase
            .from('trade_emotions')
            .select('discipline_score, followed_plan, mistakes')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString());

        // Calculate stats
        const avgDiscipline = emotions?.length
            ? emotions.reduce((sum, e) => sum + (e.discipline_score || 5), 0) / emotions.length
            : 5;

        const planAdherence = emotions?.length
            ? (emotions.filter(e => e.followed_plan).length / emotions.length) * 100
            : 50;

        const allMistakes: string[] = emotions?.flatMap(e => (e.mistakes as string[]) || []) || [];
        const mistakeCounts = allMistakes.reduce<Record<string, number>>((acc, m) => {
            acc[m] = (acc[m] || 0) + 1;
            return acc;
        }, {});
        const commonMistakes = Object.entries(mistakeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([m]) => m);

        // Generate tips
        const prompt = getPersonalizedTipsPrompt(
            trades as Trade[],
            avgDiscipline,
            planAdherence,
            commonMistakes
        );

        const result = await generateJSON<PersonalizedTipsResponse>(prompt);

        if (!result || !result.tips) {
            return NextResponse.json(
                { error: 'Failed to generate tips' },
                { status: 500 }
            );
        }

        // Store tips
        const tipRecords = result.tips.map(tip => ({
            user_id: user.id,
            category: tip.category,
            title: tip.title,
            content: tip.content,
            priority: tip.priority,
            is_dismissed: false,
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        }));

        const { data: insertedTips, error: insertError } = await supabase
            .from('ai_tips')
            .insert(tipRecords)
            .select();

        if (insertError) throw insertError;

        return NextResponse.json({
            data: {
                tips: insertedTips,
                stats: {
                    trades_analyzed: trades.length,
                    avg_discipline: avgDiscipline,
                    plan_adherence: planAdherence,
                    common_mistakes: commonMistakes,
                }
            }
        });
    } catch (error) {
        console.error('Error generating tips:', error);
        return NextResponse.json(
            { error: 'Failed to generate tips' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tip_id, is_dismissed } = await request.json();

        if (!tip_id) {
            return NextResponse.json(
                { error: 'tip_id is required' },
                { status: 400 }
            );
        }

        const { data: tip, error } = await supabase
            .from('ai_tips')
            .update({ is_dismissed })
            .eq('id', tip_id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data: tip });
    } catch (error) {
        console.error('Error updating tip:', error);
        return NextResponse.json(
            { error: 'Failed to update tip' },
            { status: 500 }
        );
    }
}
