"use client";
import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import { Course, CourseOffering, Schedule, Plan } from "../types/custom";
import Tabs from "./Tabs";
// import WeeklyScheduleGrid from "../components/WeeklyScheduleGrid";
import CourseSearch from "../components/CourseSearch";
import SavedConfigs from "./SavedConfigs";
import { SessionProvider } from "next-auth/react";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";
import { useSession } from "next-auth/react";
import { addSchedule, updateSchedule, removeSchedule, getSchedules } from "../supabaseAccess";
import { SignOutButton } from "../auth/signout/page";

type ScheduleBuilderProps = {
  allCourses: Course[];
  allSections: CourseOffering[];
  schedules: Schedule[];
  currentSemester: string;
  currentSchedule: Schedule;
  setSchedules: Dispatch<SetStateAction<Schedule[]>>;
  userId?: string;
  tokens?: any;
};

export default function ScheduleBuilder({
  allCourses,
  allSections,
  schedules,
  currentSemester,
  currentSchedule,
  setSchedules,
  userId,
  tokens,
}: ScheduleBuilderProps) {
  const [activeSemester, setActiveSemester] = useState(currentSemester);
  const [activeSchedule, setActiveSchedule] = useState(currentSchedule);
  const { data: session } = useSession();

  // Schedules (array of Schedule types filtered by currently active semester
  console.log("SchedulesBuilder schedules:", schedules);
  const schedulesInSemester = useMemo(
    () => schedules.filter((s) => s.term === activeSemester),
    [activeSemester, schedules]
  ); // updates when either activeSemester or schedules change
  console.log("schedulesInSemester:", schedulesInSemester);
  const semesters = [
    ...new Set<string>(allSections.map((s) => s.semester || "Spring 2026")),
  ];

  // When URL query changes, update tabs' visual state
  useEffect(() => {
    setActiveSemester(currentSemester);
    setActiveSchedule(currentSchedule);
  }, [currentSemester, currentSchedule]);

  const addCourseToSchedule = async (course: Course) => {
    // check if session is valid
    if (!session?.user?.id || !session?.supabase) {
      alert("Please log in to add courses to your schedule.");
      return;
    }

    const user_uuid = session.user.id;
    const tokens = session.supabase;

    // Update local schedules state
    const updatedSchedules = schedules.map((schedule) => {
      if (
        schedule.name === activeSchedule.name &&
        schedule.term === activeSemester
      ) {
        // Avoid adding duplicate courses
        const courseExists = schedule.courses.some(
          (c) => c.code === course.code
        );
        if (courseExists) return schedule;

        // Returns updated schedule with new course added
        return {
          ...schedule,
          courses: [...schedule.courses, course],
        };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);

    // Update schedules in Supabase
    const updatedSchedule = updatedSchedules.find(
      (s) => s.name === activeSchedule.name && s.term === activeSemester
    );
    if (!updatedSchedule) return;
    const success = await updateSchedule(tokens, user_uuid, updatedSchedule);
    if (!success) {
      alert("Failed to save schedule.");
    } else {
      alert(`Successfully added ${course.code} to your schedule!`);
    }
  };
  const removeFromSchedule = async (courseCode: string) => {
    // check if session is valid
    if (!session?.user?.id || !session?.supabase) {
      alert("Please log in to remove courses from your schedule.");
      return;
    }
    const user_uuid = session.user.id;
    const tokens = session.supabase;

    const updatedSchedules = schedules.map((schedule) => {
      if (
        schedule.name === activeSchedule.name &&
        schedule.term === activeSemester
      ) {
        return {
          ...schedule,
          courses: schedule.courses.filter((c) => c.code !== courseCode),
        };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);

    const updatedSchedule = updatedSchedules.find(
      (s) => s.name === activeSchedule.name && s.term === activeSemester
    );
    if (!updatedSchedule) return;
    const success = await updateSchedule(tokens, user_uuid, updatedSchedule);
    if (!success) {
      alert("Failed to save schedule.");
    }
  };

  const handleAddPlan = async (planName: string): Promise<Plan | null> => {
    if (!session?.user?.id || !session?.supabase) {
      alert("Log in to add a plan.");
      return null;
    }
    const user_uuid = session.user.id;
    const tokens = session.supabase;

    const newPlan: Plan = {
      name: planName,
      term: activeSemester,
      courses: [],
    };

    const newSchedule: Schedule = {
      ...newPlan,
      sections: [],
    };

    const success = await addSchedule(tokens, user_uuid, newSchedule);
    if (success) {
      setSchedules([...schedules, newSchedule]);
      return newPlan;
    } else {
      alert("Failed to add plan. It may already exist.");
      return null;
    }
  };

  /** True on success */
  const handleRemovePlan = async () => {
    if (!session?.user?.id || !session?.supabase) {
      alert("Log in to delete a plan");
      return false;
    }
    const user_uuid = session.user.id;
    const tokens = session.supabase;
    const success = await removeSchedule(
      tokens,
      user_uuid,
      activeSchedule.name
    );
    if (success) {
      // Fetch updated schedules and update local state
      const updatedSchedules = await getSchedules(tokens, user_uuid);
      if (updatedSchedules) {
        setSchedules(updatedSchedules);
        // Update activeSchedule to the first remaining plan in the semester
        const updatedSchedulesInSemester = updatedSchedules.filter(s => s.term === activeSemester);
        if (updatedSchedulesInSemester.length > 0) {
          setActiveSchedule(updatedSchedulesInSemester[0]);
        } else {
          // Handle case where no plans left, perhaps set to null or default
          setActiveSchedule(null as any); // or handle appropriately
        }
        alert("Plan successfully removed");
        return true;
      } else {
        alert("Failed to refresh schedules after deletion.");
        return false;
      }
    } else {
      alert("Failed to delete plan.");
      return false;
    }
  };

  return (
    <div className="text-black">
      <Tabs
        semesters={semesters}
        activeSemester={activeSemester}
        //schedulesInSemester={schedulesInSemester}
        schedules={schedules}
        activeSchedule={currentSchedule || schedulesInSemester[0] || []}
        onAddPlan={handleAddPlan}
        onRemovePlan={handleRemovePlan}
      />
      <CourseSearch
        allCourses={allCourses}
        onScheduleUpdate={addCourseToSchedule}
        currentSemester={activeSemester}
      />
      <SessionProvider>
        <SavedConfigs />
      </SessionProvider>
      <SignOutButton />
      {
        <WeeklyScheduleGrid
          allCourses={allCourses}
          schedulesInSemester={schedulesInSemester}
          currentSemester={activeSemester}
          currentSchedule={activeSchedule || schedulesInSemester[0] || []}
          onRemoveCourse={removeFromSchedule}
        />
      }
    </div>
  );
}
