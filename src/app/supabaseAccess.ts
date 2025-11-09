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
export async function addSchedule(
  tokens: SupabaseTokens,
  user_uuid: string,
  schedule: Schedule
) {
  try {
    await databaseClient.auth.setSession(tokens);
    const current = await getSchedules(tokens, user_uuid);
    current.push(schedule);
    const { error } = await databaseClient
      .from("Users")
      .update({ schedules: current as any })
      .eq("user_uuid", user_uuid);

    if (error) {
      console.error("Could not add schedule:", error.message);
      return false;
    }

    // else
    return true;
  } catch (e) {
    console.error("Execption in addSchedule", e);
    return false;
  }
}

// Update an existing schedule (for adding/removing courses)
export async function updateSchedule(
  tokens: SupabaseTokens,
  user_uuid: string,
  schedule: Schedule
) {
  try {
    await databaseClient.auth.setSession(tokens);
    const current = await getSchedules(tokens, user_uuid);

    // Find and replace the schedule with the same name and term
    const index = current.findIndex(
      (s) => s.name === schedule.name && s.term === schedule.term
    );

    if (index !== -1) {
      // Update existing schedule
      current[index] = schedule;
    } else {
      // Schedule doesn't exist, add it
      current.push(schedule);
    }

    const { error } = await databaseClient
      .from("Users")
      .update({ schedules: current as any })
      .eq("user_uuid", user_uuid);

    if (error) {
      console.error("Could not update schedule:", error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Exception in updateSchedule", e);
    return false;
  }
}

export async function getSchedules(
  tokens: SupabaseTokens,
  user_uuid: string
): Promise<Schedule[]> {
  await databaseClient.auth.setSession(tokens);

  const { data, error } = await databaseClient
    .from("Users")
    .select("schedules")
    .eq("user_uuid", user_uuid);

  if (error) {
    console.error("Error in getSchedules:", error.message);
    return []; // Explicitly return empty array on error
  }

  if (!data || data.length === 0 || !data[0].schedules) {
    // This case handles when the user exists but has no schedules, or the query returns no rows.
    return []; // Explicitly return empty array
  }

  return data[0].schedules as any as Schedule[];
}

export async function getUserInfo(tokens: SupabaseTokens) {
  return (await databaseClient.auth.getUser(tokens.access_token)).data.user;
}
