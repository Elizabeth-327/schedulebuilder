"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Course, CourseOffering, LooseSchedule, Schedule, Semester } from "../types/custom";

// Components
import ScheduleBuilder from "../components/ScheduleBuilder";

const allCourses: Course[] = [
    { 
        code: "EECS 168",
        number: "168",
        departmentCode: "EECS",
        name: "Programming I", 
        sections: [
            { class_nbr: 14320, component: "LEC", course: "EECS 168", course_nbr: 168, course_title: "Programming I", meeting_days: "TuTh", start: "09:30", end: "10:45", instructor: "John Gibbons", room: "LEEP2 G411", number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null },
            { class_nbr: 15769, component: "LEC", course: "EECS 168", course_nbr: 168, course_title: "Programming I", meeting_days: "MWF", start: "10:00", end: "10:50", instructor: "John Gibbons", room: "LEEP2 2415", number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null }
        ],
        labSections: [
            { class_nbr: 14877, component: "LAB", course: "EECS 168", course_nbr: 168, course_title: "Programming I", meeting_days: "M", start: "08:00", end: "09:50", room: "EATN 1005B", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null },
            { class_nbr: 18328, component: "LAB", course: "EECS 168", course_nbr: 168, course_title: "Programming I", meeting_days: "F", start: "08:00", end: "09:50", room: "EATN 1005B", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null }
        ]
    },
    {
        code: "BIOL 636",
        number: "636",
        departmentCode: "BIOL",
        name: "Biochemistry I",
        sections: [
            { class_nbr: 49572, component: "LEC", course: "BIOL 636", course_nbr: 636, course_title: "Biochemistry I", meeting_days: "TuTh", start: "09:30", end: "10:45", instructor: "Roberto de Guzman", room: "GL 1146", number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null }
        ],
        discussionSections: [
            { class_nbr: 49720, component: "DIS", course: "BIOL 636", course_nbr: 636, course_title: "Biochemistry I", meeting_days: "M", start: "13:00", end: "13:50", room: "HAW 1025", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null },
            { class_nbr: 49722, component: "DIS", course: "BIOL 636", course_nbr: 636, course_title: "Biochemistry I", meeting_days: "W", start: "15:00", end: "15:50", room: "WES 1049", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null },
            { class_nbr: 49721, component: "DIS", course: "BIOL 636", course_nbr: 636, course_title: "Biochemistry I", meeting_days: "Tu", start: "16:00", end: "16:50", room: "WES 4037", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null }
        ]
    },
    {
        code: "EECS 582",
        number: "582",
        departmentCode: "EECS",
        name: "Computer Science & Interdisciplinary Computing Capstone",
        sections: [
            { class_nbr: 44164, component: "LEC", course: "EECS 582", course_nbr: 582, course_title: "Computer Science & Interdisciplinary Computing Capstone", meeting_days: "MW", start: "12:00", end: "12:50", instructor: "David Johnson", room: "EATN 2", number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null }
        ]
    },
    {
        code: "EECS 465",
        number: "465",
        departmentCode: "EECS",
        name: "Cyber Defense",
        sections: [
            { class_nbr: 56028, component: "LEC", course: "EECS 465", course_nbr: 465, course_title: "Cyber Defense", meeting_days: "TuTh", start: "14:00", end: "14:50", instructor: "Alexandru Bardas", room: "HAW 1005", number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null }
        ],
        labSections: [
            { class_nbr: 56029, component: "LAB", course: "EECS 465", course_nbr: 465, course_title: "Cyber Defense", meeting_days: "F", start: "11:00", end: "11:50", room: "EATN 2003", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null },
            { class_nbr: 56030, component: "LAB", course: "EECS 465", course_nbr: 465, course_title: "Cyber Defense", meeting_days: "W", start: "11:00", end: "11:50", room: "EATN 2003", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null },
            { class_nbr: 57402, component: "LAB", course: "EECS 465", course_nbr: 465, course_title: "Cyber Defense", meeting_days: "M", start: "16:00", end: "16:50", room: "EATN 2003", instructor: null, number: null, section_nbr: null, semester: null, start_date: null, end_date: null, course_topic: null }
        ]
    }
]; 

const schedules: LooseSchedule[] = [
    {
        term: "Fall 2025",
        courses: [
            allCourses.find(course => course.code === "EECS 186")!,
            allCourses.find(course => course.code === "EECS 465")!
        ]
    }
]

function PageInner() {
    const searchParams = useSearchParams();

    const semester = searchParams.get("semester") || "Fall 2025"; // fallback semester
    const semesterPlan = searchParams.get("plan") || semesterPlans[semester][0];
    return (
        <main className="p-4">
            <ScheduleBuilder 
                allCourseData={allCourses}
                schedules={schedules}
                currentSemester={semester}
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