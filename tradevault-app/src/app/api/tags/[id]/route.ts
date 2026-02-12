// =============================================
// CANDLE TRACE - SINGLE TAG API ROUTE
// Update and delete operations for tags
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TagFormData } from '@/types';

interface Params {
    params: Promise<{ id: string }>;
}

// PUT - Update a tag
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: TagFormData = await request.json();

        const { data: tag, error } = await supabase
            .from('trade_tags')
            .update({
                name: body.name.trim(),
                color: body.color,
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ data: tag });
    } catch (error) {
        console.error('Tag PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a tag
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('trade_tags')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Tag DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
