'use client';
import { signIn } from 'next-auth/react'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
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
                mode: 'signup',
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/schedule'); // go to schedule page
            }
        } catch (err) {
            setError('An unexpected error occured');
        }
    };

    return(
        <form onSubmit={handleSubmit}>
            <h2>Create an Account</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange = {(e) => setEmail(e.target.value)}
                required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Create Account</button>
        </form>
    );
}