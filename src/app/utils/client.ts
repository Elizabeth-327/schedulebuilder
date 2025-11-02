import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const databaseClient = createBrowserClient<Database>(supabaseUrl!, supabaseKey!); // use globally where possible

// Only if you need to create a client other than the above declearation. Try not to use.
export const createClient = (accessToken?: string) => {
  const client = createBrowserClient<Database>(supabaseUrl!, supabaseKey!);

  if (accessToken) {
    client.auth.setSession({access_token: accessToken, refresh_token: ""})
  }

  return client;
};
