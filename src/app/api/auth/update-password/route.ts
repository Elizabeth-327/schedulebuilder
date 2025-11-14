/*
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-password-reset-recovery-part-3-of-3-0859f89a9ad1
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { code, password } = await request.json();
        if (!password || password.trim().length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long'},
                { status: 400 }
            );
        }
        if (!code) {
            return NextResponse.json(
                { error: "Missing access or refresh token." },
                { status: 401 }
            );
        }
        const serverDBClient = await createClient(cookies());
        // Clear any existing session first
        await serverDBClient.auth.signOut();
        const { error: exchangeError } = await serverDBClient.auth.exchangeCodeForSession(code);
        if (exchangeError) {
            return NextResponse.json(
                { error: exchangeError.message },
                { status: 401 }
            );
        }
        const { error: updateError } = await serverDBClient.auth.updateUser({ password });
        if (updateError) {
            console.error('[API] updateUser error:', updateError);
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }
        return NextResponse.json({ success: true, message: 'Password updated.' });
    } catch (err: any) {
        console.error("Error in update-password API: ", err);
        return NextResponse.json(
            { error: "Unexpected error occured." },
            { status: 500 }
        );
    }
}
