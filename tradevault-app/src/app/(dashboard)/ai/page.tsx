// =============================================
// CANDLE TRACE - AI ANALYTICS PAGE
// AI-powered insights, patterns, and chat
// =============================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AIPageClient } from './AIPageClient';

export const metadata = {
    title: 'AI Analytics | Candle Trace',
    description: 'AI-powered trading insights and analysis',
};

export default async function AIPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch recent patterns
    const { data: patterns } = await supabase
        .from('ai_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    // Fetch active tips
    const { data: tips } = await supabase
        .from('ai_tips')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch recent conversations
    const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

    return (
        <AIPageClient
            initialPatterns={patterns || []}
            initialTips={tips || []}
            conversations={conversations || []}
        />
    );
}
