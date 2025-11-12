import { SupabaseTokens } from "./types/custom";
import { databaseClient } from "./utils/client";

export async function getCourses(tokens?: SupabaseTokens) {
    if (tokens) {
        databaseClient.auth.setSession(tokens);
    }
    const { data } = await databaseClient.from("Courses").select();
    return data || [];
}

export async function addSchedule() {
    throw new Error("Implement!");
}