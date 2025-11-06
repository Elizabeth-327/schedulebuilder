"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Course, CourseOffering, Plan, Schedule} from "../types/custom";
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

    // Fetch user info, courses, and sections on mount
    useEffect(() => {
        const fetchData = async () => {
            if (session === null) {
                console.warn("No user found. This is fine.");
            }

            try {
                const user = session ? await getUserInfo(session.supabase) : null;
                setUserData(user);

                const sections = await getCourses(session?.supabase);
                setAllSections(sections);

                const courseCodes = new Set<string>(sections.map(section => section.course + " " + section.number));
                const courses = [...courseCodes].map(code => {
                    const components = code.split(" ", 2);
                    return new Course(
                        code,
                        sections.find(section => section.course + " " + section.number === code)?.course_title || "Untitled Course",
                        sections.filter(section => section.course === components[0] && section.number === components[1])
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
                    const fetchedSchedules = await getSchedules(session.supabase, userData.id);
                    if (fetchedSchedules.length > 0) {
                        setSchedules(fetchedSchedules);
                        return;
                    }
                } catch (error) {
                    console.error("Failed to fetch schedules:", error);
                }
            }
            // Fallback default schedule
            setSchedules([{
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
            }]);
        };
        fetchSchedules();
    }, [session, userData, allSections, allCourses]);

    const semester = searchParams.get("semester") || schedules[0]?.term || "Spring 2026";
    const currentSchedule = schedules.find(s => s.name === searchParams.get("plan")) || schedules[0];

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
            <Suspense fallback={<div>Loading schedule...</div>}>
                <SessionProvider>
                    <PageInner />
                </SessionProvider>
            </Suspense>
        </>
    );
}