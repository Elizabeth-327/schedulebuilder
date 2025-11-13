/* 
 * Author: Janna Dungao
 * Date: 11/02/25
 * Description: 
 * Sources:
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-part-1-of-3-76dc97d3a345 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-a-deep-dive-part-2-5fa43563989a
 */

'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await signIn('credentials', {
                email,
                password,
                mode: 'signin',
                redirect: false,
            });
            
            if(result?.error) {
                setError(result.error);
            } else {
                router.push('/schedule');
            }
        } catch (err) {
            setError('Unexpected error occured.');
        }
    };

    return (
        <div className="flex h-screen flex-col justify-center items-center m-auto max-w-sm p-8">
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-4 border-gray-300 bg-white rounded-xl shadow-lg text-black px-20 py-10">
                <h2 className="font-semibold">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 bg-sky-100 rounded p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 bg-sky-100 rounded p-2"
                    required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button className="text-blue-600 p-2" onClick={() => router.push('/auth/reset')}>Forget Password?</button>
                <button className="text-white bg-blue-600 rounded shadow-lg hover:bg-blue-700 p-2" type="submit">Submit</button>
            </form>            
        </div>

    );
}