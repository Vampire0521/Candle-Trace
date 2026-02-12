// =============================================
// CANDLE TRACE - TAGS API ROUTE
// CRUD operations for trade tags
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TradeTag, TagFormData } from '@/types';

// GET - Fetch all tags for the user
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: tags, error } = await supabase
            .from('trade_tags')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: tags });
    } catch (error) {
        console.error('Tags GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new tag
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: TagFormData = await request.json();

        // Validate input
        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
        }

        const { data: tag, error } = await supabase
            .from('trade_tags')
            .insert({
                user_id: user.id,
                name: body.name.trim(),
                color: body.color || '#8b5cf6',
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: tag }, { status: 201 });
    } catch (error) {
        console.error('Tags POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
