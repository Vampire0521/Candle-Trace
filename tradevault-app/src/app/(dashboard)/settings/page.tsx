// =============================================
// CANDLE TRACE - SETTINGS PAGE
// User can set initial balance and preferences
// =============================================

import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './components/SettingsClient';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const supabase = await createClient();

    // Fetch current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <SettingsClient
            profile={profile || { id: user.id, initial_balance: 10000 }}
            userId={user.id}
            userEmail={user.email || ''}
        />
    );
}
