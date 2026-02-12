// =============================================
// CANDLE TRACE - SCREENSHOT UPLOAD API
// Handles trade screenshot uploads to Supabase Storage
// =============================================

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const tradeId = formData.get('tradeId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 });
        }

        // Validate file size (max 2MB - matches Supabase bucket limit)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const filename = `${user.id}/${tradeId || 'temp'}_${Date.now()}.${ext}`;

        // Convert File to ArrayBuffer for server-side upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('Uploading file:', { filename, size: file.size, type: file.type });

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('trade-screenshots')
            .upload(filename, buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type,
            });

        if (error) {
            console.error('Upload error:', error);
            return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 });
        }

        console.log('Upload successful:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('trade-screenshots')
            .getPublicUrl(data.path);

        console.log('Public URL:', publicUrl);

        return NextResponse.json({
            url: publicUrl,
            path: data.path,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { path } = await request.json();

        if (!path) {
            return NextResponse.json({ error: 'No path provided' }, { status: 400 });
        }

        // Verify the file belongs to the user
        if (!path.startsWith(user.id + '/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { error } = await supabase.storage
            .from('trade-screenshots')
            .remove([path]);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
