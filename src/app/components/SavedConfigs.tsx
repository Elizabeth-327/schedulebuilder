import { createClient } from "../utils/client";
import { useSession } from "next-auth/react";
// What is this component for? (Elizabeth asking)
export default function SavedConfigs() {
    
    const { data: session } = useSession();
    const token = session?.supabase.access_token || "No Token.";

    //const supabase = createClient();

    // JSX

    return (
        <>
            {/*<h1>{token}</h1>;*/} 
        </>
    );
}