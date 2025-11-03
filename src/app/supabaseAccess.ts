import { userAgent } from "next/server";
import { Schedule, SupabaseTokens } from "./types/custom";
import { databaseClient } from "./utils/client";

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

export async function getCourses(tokens?: SupabaseTokens) {
    if (tokens) {
        databaseClient.auth.setSession(tokens);
    }
    const { data } = await databaseClient.from("Courses").select();
    return data || [];
}

export async function addSchedule(tokens: SupabaseTokens, schedule: Schedule) {
    databaseClient.auth.setSession(tokens);
    // databaseClient.from("Users").insert()
}

export async function getSchedules(tokens: SupabaseTokens) {
    const {data: session, error: authError} = await databaseClient.auth.setSession(tokens);
    if (authError) {
        throw new Error("Failed to authenticate token." + authError.message);
    }
    else {
        // request the raw column (no alias) so we get the JSON value
        const { data: rows, error } = await databaseClient
          .from("Users")
          .select("schedules")
          .eq("user_uuid", session.user!.id);

        if (error) {
          console.error("supabaseAccess.getSchedules query error:", error);
          return [] as Schedule[];
        }

        if (!rows || rows.length === 0) return [] as Schedule[];

        // each row.schedules may be an object, array, or JSON string
        const parsed: Schedule[] = rows.flatMap((row: any) => {
          const val = parseJson<Schedule | Schedule[] | null>(row.schedules);
          if (!val) return [];
          return Array.isArray(val) ? val : [val];
        });

        return parsed;
    }
}