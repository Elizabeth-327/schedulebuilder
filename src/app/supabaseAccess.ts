import { userAgent } from "next/server";
import { Schedule, SupabaseTokens } from "./types/custom";
import { databaseClient } from "./utils/client";

/*
// safe parser: accepts already-parsed objects or JSON strings
function parseJson<T>(v: unknown): T | null {
  if (v == null) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch (e) {
      console.error("supabaseAccess: failed to JSON.parse value", e, v);
      return null;
    }
  }
  return v as T;
}
*/

export async function getCourses(tokens?: SupabaseTokens) {
    if (tokens) {
        databaseClient.auth.setSession(tokens);
    }
    const { data } = await databaseClient.from("Courses").select();
    return data || [];
}

/*
export async function addSchedule(tokens: SupabaseTokens, schedule: Schedule) {
    databaseClient.auth.setSession(tokens);
    // databaseClient.from("Users").insert()
}
*/
              
export async function getSchedules(tokens: SupabaseTokens, user_uuid: string) {
    databaseClient.auth.setSession(tokens);

    const { data, error } = await databaseClient.from("Users").select("schedules").eq("user_uuid", user_uuid);
    if (error) {
        console.error("Error in getSchedules:\n" + error.message);
    }
    else if (!data || !data[0]) {
        console.error("Data not gotten for user.");
    }
    else {
        return data[0].schedules as unknown as Schedule[]
    }
    return [] as Schedule[];
}

export async function getUserInfo(tokens: SupabaseTokens) {
    return (await databaseClient.auth.getUser(tokens.access_token)).data.user;
}