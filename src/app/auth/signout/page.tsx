/* 
 * Author: Janna Dungao
 * Date: 11/02/25
 * Description: 
 * Sources:
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-part-1-of-3-76dc97d3a345 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-a-deep-dive-part-2-5fa43563989a
 */

'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };
    return <button className="text-white bg-blue-600 rounded shadow-xl absolute top-4 right-4 hover:bg-blue-700 p-2"onClick={handleSignOut}>Sign Out</button>;
}