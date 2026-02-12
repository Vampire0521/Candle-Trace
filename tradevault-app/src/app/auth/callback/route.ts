// =============================================
// CANDLE TRACE - AUTH CALLBACK ROUTE
// Handles OAuth and email confirmation redirects
// =============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    // Use forwarded headers from Render's reverse proxy (not the internal Docker address)
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
    const origin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login on error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
