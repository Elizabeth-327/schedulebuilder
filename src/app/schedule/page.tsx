"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Components
import ScheduleBuilder from "../components/ScheduleBuilder";

// Hardcoded course data
export type Course = {
    code: string;               // e.g. "EECS 168"
    name: string;               // e.g. "Programming I"
    offerings: Section[];       // at least one lecture offering
    labSections?: Section[];    // optional
    discussionSections?: Section[]; // optional
};

export type Section = {
    classNumber: string;
    times: string;              // e.g. "MWF 10:00 AM - 10:50 AM"
    professor?: string;         // not always present (e.g., labs/discussions)
    location: string;
    seatsAvailable: string;
}

const allCourses: Course[] = [
    { 
        code: "EECS 168", 
        name: "Programming I", 
        offerings: [
            { classNumber: "14320", times: "TuTh 09:30 AM - 10:45 AM", professor: "John Gibbons", location: "LEEP2 G411", seatsAvailable: "30" },
            { classNumber: "15769", times: "MWF 10:00 AM - 10:50 AM", professor: "John Gibbons", location: "LEEP2 2415", seatsAvailable: "65" }
        ],
        labSections: [
            { classNumber: "14877", times: "M 08:00 AM - 09:50 AM", location: "EATN 1005B", seatsAvailable: "7"},
            { classNumber: "18328", times: "F 08:00 AM - 09:50 AM", location: "EATN 1005B", seatsAvailable: "10"}
        ]
    },

    //{
        //code: "EECS 468",
        //name: "Programming Paradigms",
        //offerings: [
            //{ classNumber: "21363", times: "MWF 11:00 AM - 11:50 AM", professor: "David Johnson", location: "LEEP2 2300", seatsAvailable: "14" }
        //]
    //},
    {
        code: "BIOL 636",
        name: "Biochemistry I",
        offerings: [
            { classNumber: "49572", times: "TuTh 09:30 AM - 10:45 AM", professor: "Roberto de Guzman", location: "GL 1146", seatsAvailable: "12" }
        ],
        discussionSections: [
            { classNumber: "49720", times: "M 01:00 PM - 01:50 PM", location: "HAW 1025", seatsAvailable: "0" },
            { classNumber: "49722", times: "W 03:00 PM - 03:50 PM", location: "WES 1049", seatsAvailable: "5" },
            { classNumber: "49721", times: "Tu 04:00 PM - 04:50 PM", location: "WES 4037", seatsAvailable: "7" }
        ]
    },
    {
        code: "EECS 582",
        name: "Computer Science & Interdisciplinary Computing Capstone",
        offerings: [
            { classNumber: "44164", times: "MW 12:00 PM - 12:50 PM", professor: "David Johnson", location: "EATN 2", seatsAvailable: "45" }
        ]
    },
    {
        code: "EECS 465",
        name: "Cyber Defense",
        offerings: [
            { classNumber: "56028", times: "TuTh 02:00 PM - 02:50 PM", professor: "Alexandru Bardas", location: "HAW 1005", seatsAvailable: "59" }
        ],
        labSections: [
            { classNumber: "56029", times: "F 11:00 AM - 11:50 AM", location: "EATN 2003", seatsAvailable: "25" },
            { classNumber: "56030", times: "W 11:00 AM - 11:50 AM", location: "EATN 2003", seatsAvailable: "0" },
            { classNumber: "57402", times: "M 04:00 PM - 04:50 PM", location: "EATN 2003", seatsAvailable: "34" }
        ]
    }
]; 

const semesterPlans: Record<string, string[]> = {
  "Fall 2024": ["With MAE305", "Just 4 courses", "With HIS291"],
  "Spring 2025": ["With COS333", "With PHI203"],
  "Fall 2025": ["With MAT301", "Minimal schedule"],
}

export type ScheduleData = Record<string, Record<string, string[]>>; // string[] corresponds to array of courses for each Semester + SemesterPlan combo

const schedules: ScheduleData = ({
    "Fall 2024": {
        "With MAE305": ["EECS 168", "EECS 468", "BIOL 636"],
        "Just 4 courses": ["EECS 168", "EECS 465", "EECS 468", "BIOL 636"],
        "With HIS291": ["EECS 465", "EECS 468", "BIOL 636"],
    },
    "Spring 2025": {
        "With COS333": ["EECS 582", "EECS 465"],
        "With PHI203": ["EECS 468", "BIOL 636"],
    },
    "Fall 2025": {
        "With MAT301": ["EECS 168", "EECS 582"],
        "Minimal schedule": ["EECS 465"],
    },
});

function PageInner() {
    const searchParams = useSearchParams();

    const semester = searchParams.get("semester") || "Fall 2025"; // fallback semester
    const semesterPlan = searchParams.get("plan") || semesterPlans[semester][0];
    return (
        <main className="p-4">
            <ScheduleBuilder 
                allCourseData={allCourses}
                semesterPlans={semesterPlans}
                schedules={schedules}
                currentSemester={semester}
                currentSemesterPlan={semesterPlan}
            />
        </main>
    );
}

export default function Page() {
    return (
        <>
            <Suspense fallback={<div>Loading schedule...</div>}>
                <PageInner />
            </Suspense>
        </>
    );
}