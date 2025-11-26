"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Course, CourseOffering, Plan, Schedule } from "../types/custom";
import { getCourses, getSchedules, getUserInfo } from "../supabaseAccess";
import { SessionProvider, useSession } from "next-auth/react";
import { User } from "next-auth";

// Components
import ScheduleBuilder from "../components/ScheduleBuilder";

function PageInner() {
  const { data: session } = useSession();
  const [allSections, setAllSections] = useState<CourseOffering[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const searchParams = useSearchParams();

  // Fetch user info, courses, and sections on mount (when user session changes)
  useEffect(() => {
    const fetchData = async () => {
      if (session === null) {
        console.warn("No user found. This is fine.");
      }

      try {
        const user = session ? await getUserInfo(session.supabase) : null;
        setUserData(user);

        const sections = await getCourses(session?.supabase); // Fetch all course section offerings from "Courses" table in Supabase
        setAllSections(sections);

        const courseCodes = new Set<string>(
          sections.map((section) => section.course + " " + section.number)
        ); // Get all the unique course codes
        // courses is an array of Course objects constructed from unique course codes
        const courses = [...courseCodes].map((code) => {
          const components = code.split(" ", 2);
          return new Course(
            code,
            sections.find(
              (section) => section.course + " " + section.number === code
            )?.course_title || "Untitled Course",
            sections.filter(
              (section) =>
                section.course === components[0] &&
                section.number === components[1]
            )
          );
        });
        setAllCourses(courses);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [session]);

  // Fetch schedules when user data is available
  useEffect(() => {
    const fetchSchedules = async () => {
      if (session && userData) {
        try {
          const fetchedSchedules = await getSchedules(
            session.supabase,
            userData.id
          );
          if (fetchedSchedules.length > 0) {
            setSchedules(fetchedSchedules);
            return;
          } else {
            // If no schedules exist, create a default first schedule
            const firstSchedule: Schedule = {
              name: "first Schedule",
              term: searchParams.get("semester") || "Spring 2026",
              sections: [],
              courses: [],
            };

            const { addSchedule } = await import("../supabaseAccess");
            const success = await addSchedule(
              session.supabase,
              userData.id,
              firstSchedule
            );

            if (success) {
              setSchedules([firstSchedule]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch schedules:", error);
        }
      }
      // Fallback default schedule
      /*setSchedules([{
                name: "Default",
                term: "Spring 2026",
                sections: [
                    allSections.find(s => s.course === "EECS" && s.number === "662")!,
                    allSections.find(s => s.course === "EECS" && s.number === "510")!,
                ],
                courses: [
                    allCourses.find(c => c.code === "EECS 662")!,
                    allCourses.find(c => c.code === "EECS 510")!,
                ]
            }]);*/
    };
    fetchSchedules();
  }, [session, userData, allSections, allCourses]);

  // Default empty schedule for UI display only (when user has selected no courses) Commented out as I foudn an erro that keeps the default shcedule name
  //   const defaultSchedule: Schedule = {
  //     name: "Default Plan",
  //     term: "Spring 2026",
  //     sections: [],
  //     courses: [],
  //   };

  //   const displaySchedules = schedules.length > 0 ? schedules : [defaultSchedule];

  //   const semester = searchParams.get("semester") || displaySchedules[0].term;
  //   const currentSchedule =
  //     schedules.length > 0
  //       ? schedules.find((s) => s.name === searchParams.get("plan")) ||
  //         schedules[0]
  //       : defaultSchedule;

  //   console.log("Schedules array:", schedules);
  //   return (
  //     <main className="p-4">
  //       <ScheduleBuilder
  //         allCourses={allCourses}
  //         allSections={allSections}
  //         schedules={displaySchedules}
  //         currentSemester={semester}
  //         currentSchedule={currentSchedule}
  //         setSchedules={setSchedules}
  //       />
  //     </main>
  //   );
  // }
  const semester =
    searchParams.get("semester") || schedules[0]?.term || "Spring 2026";
  const currentSchedule =
    schedules.find((s) => s.name === searchParams.get("plan")) || schedules[0];

  console.log("Schedules array:", schedules);

  if (schedules.length === 0) {
    return (
      <main className="p-4">
        <div className="flex h-screen flex-col justify-center items-center m-auto max-w-sm p-4">
            <svg className="mx-auto size-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 font-medium text-gray-700">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4">
      <ScheduleBuilder
        allCourses={allCourses}
        allSections={allSections}
        schedules={schedules}
        currentSemester={semester}
        currentSchedule={currentSchedule}
        setSchedules={setSchedules}
      />
    </main>
  );
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<div className="text-black text-4xl font-bold items-center justify-center">Loading schedule...</div>}>
        <SessionProvider>
          <PageInner />
        </SessionProvider>
      </Suspense>
    </>
  );
}
