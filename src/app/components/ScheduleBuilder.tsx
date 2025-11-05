"use client";
import { useState, useEffect } from "react";
import { Course } from "../schedule/page";
import Tabs from "./Tabs";
import WeeklyScheduleGrid from "../components/WeeklyScheduleGrid";
import { ScheduleData } from "../schedule/page";
import CourseSearch from "../components/CourseSearch";
import SavedConfigs from "./SavedConfigs";
import { SessionProvider } from "next-auth/react";

type ScheduleBuilderProps = {
    allCourseData: Course[],
    semesterPlans: Record<string, string[]>,
    schedules: ScheduleData,
    currentSemester: string,
    currentSemesterPlan: string
}

export default function ScheduleBuilder({ allCourseData, semesterPlans, schedules, currentSemester, currentSemesterPlan }: ScheduleBuilderProps) {
    const [activeSemester, setActiveSemester] = useState(currentSemester);
    const [activeSemesterPlan, setActiveSemesterPlan] = useState(currentSemesterPlan);

    const semesters = Object.keys(semesterPlans);

    // When URL query changes, update tabs' visual state
    useEffect(() => {
        setActiveSemester(currentSemester);
        setActiveSemesterPlan(currentSemesterPlan);
    }, [currentSemester, currentSemesterPlan]); 
    
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    
    return (
        <div>
            <Tabs
                semesters={semesters}
                semesterPlans={semesterPlans}
                activeSemester={activeSemester}
                activePlan={activeSemesterPlan}
            />
            <CourseSearch />
            <SessionProvider>
                <SavedConfigs />
            </SessionProvider>
            <WeeklyScheduleGrid
                allCourseData={allCourseData}
                schedules={schedules}
                currentSemester={activeSemester}
                currentSemesterPlan={activeSemesterPlan}
            />
        </div>
    );
}