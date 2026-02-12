// =============================================
// CANDLE TRACE - TRADE DETAILS PAGE
// Professional trade view with all details
// =============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TradeDetailsClient } from './TradeDetailsClient';
import type { TradeTag } from '@/types';

interface TradeDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function TradeDetailsPage({ params }: TradeDetailsPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch trade with strategy
    const { data: trade, error } = await supabase
        .from('trades')
        .select(`
            *,
            strategies:strategy_id (
                id,
                name,
                icon,
                description
            )
        `)
        .eq('id', id)
        .single();

    if (error || !trade) {
        notFound();
    }

    // Fetch emotions for this trade
    const { data: emotions } = await supabase
        .from('trade_emotions')
        .select('*')
        .eq('trade_id', id)
        .single();

    // Fetch tags for this trade
    const { data: tagLinks } = await supabase
        .from('trade_tag_links')
        .select(`
            tag_id,
            trade_tags:tag_id (
                id,
                name,
                color
            )
        `)
        .eq('trade_id', id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tags: TradeTag[] = (tagLinks || []).map((link: any) => link.trade_tags).filter(Boolean) as TradeTag[];

    return (
        <TradeDetailsClient
            trade={trade}
            emotions={emotions}
            tags={tags}
        />
    );
}
