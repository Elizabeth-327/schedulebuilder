import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CourseOffering, Schedule } from "../types/custom";
import { getSchedules } from "../supabaseAccess";

export default function SavedConfigs() {
    
    // CONSTANTS

    const { data: session } = useSession();

    // STATE

    const [savedSchedules, setSavedSchedules] = useState([] as Schedule[]);

    // LIFECYCLE

    useEffect(() => {
            // after load
            const loadSchedules = async () => {
                if (session) {
                    const courses = await getSchedules(session?.supabase, session?.user?.id);
                    setSavedSchedules(courses);
                }
            };

            loadSchedules();
        }, []);

    // JSX

    return (
        <>
            <h1>Logged in as: {session?.user?.email || "None"}</h1>
            {/* <section id="savedSchedulesSelector">
                <select name="savedSchedules" size={savedSchedules.length}>
                    {savedSchedules.map(sch => <option value={sch.name}>{sch.name}</option>)}
                </select>
            </section> */}
        </>
    );
}