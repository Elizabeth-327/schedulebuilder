/* 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-part-1-of-3-76dc97d3a345 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-a-deep-dive-part-2-5fa43563989a
 */


import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@/app/utils/server';
import { SupabaseTokens } from '@/app/types/custom';
import { cookies } from 'next/headers';
import { useErrorOverlayReducer } from 'next/dist/next-devtools/dev-overlay/shared';
import { userAgent } from 'next/server';

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
    supabase: SupabaseTokens;
    expires: string;
}

declare module "next-auth" {
    interface User {
        supabaseAccessToken?: string;
        supabaseRefreshToken?: string;
    }

    interface Session {
        supabase: SupabaseTokens;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        supabaseAccessToken?: string;
        supabaseRefreshToken?: string;
    }
}

// Auth handlers for supabase
const authHandlers = {
    async handleSignup(email: string, password: string) {
        const serverDBClient = await createClient(cookies());
        const { data, error } = await serverDBClient.auth.signUp({
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
        const serverDBClient = await createClient(cookies());
        const { data, error } = await serverDBClient.auth.signInWithPassword({
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
        else {
            const {data: userCheck} = await serverDBClient.from("Users").select("user_uuid").eq("user_uuid", data.user.id);
            if (!userCheck || userCheck.length === 0) {
                const {error} = await serverDBClient.from("Users").insert([
                    {user_uuid: data.user.id, user_name: data.user.email}
                ]);
                if (error) {
                    console.error(error.message);
                }
                else {
                    console.log("Add user success?!?!?!");
                }
            }
        }
        
        return data;
    },
    
    async handleResetPassword(email: string) {
        // later
        return;
        const serverDBClient = await createClient(cookies());
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
                    
                    let result;
                    if (lowerMode === 'signup') {
                        const user = await authHandlers.handleSignup(email, password);
                        result = { user };
                    } else {
                        result = await authHandlers.handleSignIn(email, password);
                    }
                    
                    return {
                        id: result.user.id,
                        email: result.user.email ?? email,
                        name: result.user.email ?? email,
                        supabaseAccessToken: result.session?.access_token,
                        supabaseRefreshToken: result.session?.refresh_token,
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
                token.supabaseAccessToken = (user as any).supabaseAccessToken;
                token.supabaseRefreshToken = (user as any).supabaseRefreshToken;
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
                supabase: {
                    access_token: token.supabaseAccessToken as string,
                    refresh_token: token.supabaseRefreshToken as string,
                }
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
                const serverDBClient = await createClient(cookies());
                await serverDBClient.auth.signOut();
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