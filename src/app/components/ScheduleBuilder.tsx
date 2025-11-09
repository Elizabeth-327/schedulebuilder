"use client";
import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import { Course, CourseOffering, Schedule } from "../types/custom";
import Tabs from "./Tabs";
// import WeeklyScheduleGrid from "../components/WeeklyScheduleGrid";
import CourseSearch from "../components/CourseSearch";
import SavedConfigs from "./SavedConfigs";
import { SessionProvider } from "next-auth/react";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";
import { useSession } from "next-auth/react";
import { addSchedule, updateSchedule } from "../supabaseAccess";
import CourseList from "./CourseList";
type ScheduleBuilderProps = {
  allCourses: Course[];
  allSections: CourseOffering[];
  schedules: Schedule[];
  currentSemester: string;
  currentSchedule: Schedule;
  setSchedules: Dispatch<SetStateAction<Schedule[]>>;
};

export default function ScheduleBuilder({
  allCourses,
  allSections,
  schedules,
  currentSemester,
  currentSchedule,
  setSchedules,
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

  const addCourseToSchedule = async (courseOffering: CourseOffering) => {
    // Find the Course object from allCourses (includes all sections: lectures, labs, discussions)
    const courseCode = `${courseOffering.course} ${courseOffering.number}`;
    const course = allCourses.find((c) => c.code === courseCode);

    if (!course) {
      alert(`Course ${courseCode} not found!`);
      return;
    }

    // Check for duplicates
    const courseExists = currentSchedule?.courses?.some(
      (c) => c.code === course.code
    );
    if (courseExists) {
      alert(`${course.code} is already in your schedule!`);
      return;
    }

    // Update local schedules state
    const updatedSchedules = schedules.map((schedule) => {
      if (
        schedule.name === activeSchedule.name &&
        schedule.term === activeSemester
      ) {
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

    // Only sync to Supabase if user is logged in
    if (session?.user?.id && session?.supabase) {
      const success = await updateSchedule(
        session.supabase,
        session.user.id,
        updatedSchedule
      );
      if (!success) {
        alert("Failed to save schedule.");
      } else {
        alert(`Successfully added ${course.code} to your schedule!`);
      }
    } else {
      // User not logged in, just update local state
      alert(`Added ${course.code} to your schedule (not saved to account)`);
    }
  };

  return (
    <div>
      <Tabs
        semesters={semesters}
        activeSemester={activeSemester}
        //schedulesInSemester={schedulesInSemester}
        schedules={schedules}
        activeSchedule={currentSchedule || schedulesInSemester[0] || []}
      />
      <CourseSearch onAddCourse={addCourseToSchedule} />
      <SessionProvider>
        <SavedConfigs />
      </SessionProvider>
      {
        <WeeklyScheduleGrid
          allCourses={allCourses}
          schedulesInSemester={schedulesInSemester}
          currentSemester={activeSemester}
          currentSchedule={currentSchedule || schedulesInSemester[0] || []}
        />
      }
    </div>
  );
}
