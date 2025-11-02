import { createClient } from "./utils/client";

const supabase = createClient();

export async function getCourses() {
    const { data } = await supabase.from("Courses").select();
    return data || [];
}

export async function addSchedule() {
    
}