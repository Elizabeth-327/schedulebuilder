/*
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-password-reset-recovery-part-3-of-3-0859f89a9ad1
 */

import { NextResponse } from 'next/server';
import { databaseClient } from '@client/utils/client';


export async function POST(request: Request) {
    try {
        const { password, access_token, refresh_token } = await request.json();

        if (!password || password.trim().length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long.'},
                { status: 400 }
            );
        }
        if (!access_token || !refresh_token) {
            return NextResponse.json(
                { error: 'Missing access or refresh token.' },
                { status: 401 }
            );
        }
        
        //establish session
        const { error: sessionError } = await databaseClient.auth.setSession({
            access_token,
            refresh_token,
        });
        if(sessionError) {
            console.error('[API] setSession error:', sessionError);
            return NextResponse.json(
                { error: sessionError.message },
                { status: 401 }
            );
        }

        //update password
        const { error } = await databaseClient.auth.updateUser({
            password,
        });
        if(error) {
            console.error('[API] updateUser error: ', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error in update-password API:', err);
        return NextResponse.json(
            { error: 'Unexpected error occured.' },
            { status: 500 }
        );
    }
}