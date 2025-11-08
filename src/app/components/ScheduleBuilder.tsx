"use client";
import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import { Course, CourseOffering, Schedule } from "../types/custom";
import Tabs from "./Tabs";
// import WeeklyScheduleGrid from "../components/WeeklyScheduleGrid";
import CourseSearch from "../components/CourseSearch";
import SavedConfigs from "./SavedConfigs";
import { SessionProvider } from "next-auth/react";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";

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

