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
import { addSchedule } from "../supabaseAccess";
type ScheduleBuilderProps = {
    allCourses: Course[],
    allSections: CourseOffering[],
    schedules: Schedule[],
    currentSemester: string,
    currentSchedule: Schedule,
    setSchedules: Dispatch<SetStateAction<Schedule[]>>
}

export default function ScheduleBuilder({ allCourses, allSections, schedules, currentSemester, currentSchedule, setSchedules }: ScheduleBuilderProps) {
    const [activeSemester, setActiveSemester] = useState(currentSemester);
    const [activeSchedule, setActiveSchedule] = useState(currentSchedule)
    const {data: session} = useSession();

    // Schedules (array of Schedule types filtered by currently active semester 
    console.log("SchedulesBuilder schedules:", schedules);
    const schedulesInSemester = useMemo(() => schedules.filter(s => s.term === activeSemester), [activeSemester, schedules]); // updates when either activeSemester or schedules change
    console.log("schedulesInSemester:", schedulesInSemester);
    const semesters = [...(new Set<string>(allSections.map(s => s.semester || "Spring 2026")))];
    
    // When URL query changes, update tabs' visual state
    useEffect(() => {
        setActiveSemester(currentSemester);
        setActiveSchedule(currentSchedule);
    }, [currentSemester, currentSchedule]);

    const addCourseToSchedule = async (course: Course) => {
        const user_uuid = session!.user.id;
        const tokens = session!.supabase;

        // Update local schedules state
        const updatedSchedules = schedules.map(schedule => {
            if (schedule.name === activeSchedule.name && schedule.term === activeSemester) {
                // Avoid adding duplicate courses
                const courseExists = schedule.courses.some(c => c.code === course.code);
                if (courseExists) return schedule;

                // Returns updated schedule with new course added
                return {
                    ...schedule,
                    courses: [...schedule.courses, course]
                };
            };
            return schedule;
        });
        setSchedules(updatedSchedules);

        // Update schedules in Supabase
        const updatedSchedule = updatedSchedules.find(s => s.name === activeSchedule.name && s.term === activeSemester);
        if (!updatedSchedule) return;
        const success = await addSchedule(tokens, user_uuid, updatedSchedule); // from src/app/supabaseAccess.ts
        if (!success) {
            alert("Failed to save schedule.");
        }
    };
    
    return (
        <div>
            <Tabs
                semesters={semesters}
                activeSemester={activeSemester}
                //schedulesInSemester={schedulesInSemester}
                schedules = {schedules}
                activeSchedule={currentSchedule || schedulesInSemester[0] || []}
            />
            <CourseSearch />
            <SessionProvider>
                <SavedConfigs />
            </SessionProvider>
            {<WeeklyScheduleGrid
                allCourses={allCourses}
                schedulesInSemester={schedulesInSemester}
                currentSemester={activeSemester}
                currentSchedule={currentSchedule || schedulesInSemester[0] || []}
            />}
            
        </div>
    );
}

