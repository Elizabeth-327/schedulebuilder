import { Schedule, SupabaseTokens } from "./types/custom";
import { databaseClient } from "./utils/client";

export async function getCourses(tokens?: SupabaseTokens) {
    if (tokens) {
        await databaseClient.auth.setSession(tokens);
    }
    const { data } = await databaseClient.from("Courses").select();
    return data || [];
}

// true on success
export async function addSchedule(tokens: SupabaseTokens, user_uuid: string, schedule: Schedule) {
    try {
      await databaseClient.auth.setSession(tokens);
      const current = await getSchedules(tokens, user_uuid);
      current.push(schedule);
      const { error } = await databaseClient.from("Users").update({schedules: current as any}).eq("user_uuid", user_uuid);

      if (error) {
        console.error("Could not add schedule:", error.message);
        return false;
      }

      // else
      return true;
    }
    
    catch (e) {
      console.error("Execption in addSchedule", e);
      return false;
    }
}
              
export async function getSchedules(tokens: SupabaseTokens, user_uuid: string) {
    await databaseClient.auth.setSession(tokens);

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