/* 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-part-1-of-3-76dc97d3a345 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-a-deep-dive-part-2-5fa43563989a
 */


import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '@client/utils/supabase/client';

// interfaces
interface CustomUser {
    id: string;
    email: string;
    name: string;
}

interface CustomSession {
    user: {
        id: string;
        email: string;
    };
    expires: string;
}

// Auth handlers for supabase
const authHandlers = {
    async handleSignup(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXTAUTH_URL}`,
            },
        });

        if (error) {
            console.error('[AUTH] Signup error: ', error);
            throw new Error(error.message);
        }

        if (!data.user?.id) {
            throw new Error(
                'Signup successful. Please check email for confirmation.'
            );
        }
        return data.user;
    },

    async handleSignIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[AUTH] Signin error: ', error);
            throw new Error(error.message);
        }
        if (!data.user?.id) {
            throw new Error('Invalid credentials');
        }
        return data.user;
    },
    
    async handleResetPassword(email: string) {
        // later
    },
};

// nextauth config
export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: 'Enter email' },
                password: { label: "Password", type: "password", placeholder: 'Enter password' },
                mode: { label: "Mode", type: "text", placeholder: "signin, signup, or resetpassword"},
            },
            async authorize(credentials){
                try {
                    if(!credentials) return null;
                    const { email, password, mode } = credentials;
                    const lowerMode = mode?.toLowerCase();

                    if (!email && !password) {
                        throw new Error('Password is required');
                    }
                    const user = lowerMode === 'signup' ? await authHandlers.handleSignup(email, password) : await authHandlers.handleSignIn(email, password);
                    
                    return {
                        id: user.id,
                        email: user.email ?? email,
                        name: user.email ?? email,
                    };
                } catch (error) {
                    console.error('[AUTH] Authorization error:', {
                        error,
                        email: credentials?.email,
                        mode: credentials?.mode,
                        timestamp: new Date().toISOString(),
                    });
                    throw error;
                }

            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.userId = user.id;
                token.email = user.email;
                token.lastUpdated = new Date().toISOString();
            }
            return token;
        },
        async session({ session, token }): Promise<CustomSession> {
            return {
                ...session,
                user: {
                    id: token.userId as string,
                    email: token.email as string,
                },
            };
        },
    },
    // Configuration
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error'
    },
    events: {
        async signIn({ user }) {
            console.log('[AUTH] Successful sign-in:', {
                userId: user.id,
                email: user.email,
                timestamp: new Date().toISOString(),
            });
        },
        async signOut({ token }) {
            if (token?.userId) {
                await supabase.auth.signOut();
            }
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

const handleAuth = async (req: Request, res: Response) => {
    try {
        return await NextAuth(authOptions)(req,res);
    } catch (error) {
        console.error('[AUTH] Unexpected error:', error);
        throw error;
    }
};
export const GET = handleAuth;
export const POST = handleAuth;