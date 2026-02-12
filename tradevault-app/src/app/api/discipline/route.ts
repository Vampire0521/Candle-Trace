// =============================================
// CANDLE TRACE - DISCIPLINE STATS API ROUTE
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Get discipline stats for user
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '30', 10);

        // Use the PostgreSQL function we created
        const { data, error } = await supabase.rpc('get_discipline_stats', {
            p_user_id: user.id,
            p_days: days,
        });

        if (error) {
            // If function doesn't exist yet, return empty stats
            if (error.code === '42883') {
                return NextResponse.json({
                    data: {
                        avg_discipline_score: 0,
                        total_trades_with_emotions: 0,
                        followed_plan_count: 0,
                        plan_adherence_percent: 0,
                        top_mistakes: [],
                        avg_pre_confidence: 0,
                        avg_pre_fear: 0,
                        avg_pre_greed: 0,
                        tilt_score: 0,
                    }
                });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data?.[0] || data });
    } catch (error) {
        console.error('Discipline stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
