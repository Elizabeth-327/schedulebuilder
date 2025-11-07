import React from "react";
import { useState, useEffect } from "react";
import { Course, CourseOffering, Schedule } from "../types/custom";

interface WeeklyScheduleGridProps {
  allCourses: Course[];
  schedulesInSemester: Schedule[];
  currentSemester: string;
  currentSchedule: Schedule; 
}

type ScheduledCourse = CourseOffering & {
    color?: string;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = Array.from({ length: 14 }, (_, i) => {
    const hour24 = 7 + i;             // 7..20
    const ampm = hour24 >= 12 ? "PM" : "AM"; // 12 or higher is PM
    const hour12 = hour24 % 12 || 12; // Convert 0 → 12 for midnight/noon
    return `${hour12} ${ampm}`;
});

// Map single-letter day abbreviations to full names
const dayMap = {
  M: "Mon",
  Tu: "Tue",
  W: "Wed",
  Th: "Thu",
  F: "Fri",
};

const courseColors = [
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-orange-400",
];

const getCourseColor = (code: string) => {
    const index = Math.abs(code.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0)) % courseColors.length;
    return courseColors[index];
};

const assignColorsToSchedule = (schedule: ScheduledCourse[]) => {
    let colorIndex = 0;
    schedule.forEach(sc => {
        sc.color = courseColors[colorIndex % courseColors.length];
        colorIndex++;
    });
    return schedule;
}

export default function WeeklyScheduleGrid({ allCourses, schedulesInSemester, currentSemester, currentSchedule}: WeeklyScheduleGridProps) {
    const [scheduleOptions, setScheduleOptions] = useState<ScheduledCourse[][]>([]);
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);

    const hourToDecimal = (hourStr: string) => {
        const [h, meridiem] = hourStr.split(" ");
        let hour = Number(h);
        if (meridiem === "PM" && hour !== 12) hour += 12;
        if (meridiem === "AM" && hour === 12) hour = 0;
        return hour;
    };

    const timeStringToDecimal = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours + minutes / 60;
    };
    
    const parseCourseTimes = (course: Course, offering: CourseOffering): ScheduledCourse => {
        const allTimes: { day: string; start: number; end: number }[] = [];
       
        if (offering.meeting_days && offering.start && offering.end) {
            const daysPart = offering.meeting_days;
            const start = timeStringToDecimal(offering.start);
            const end = timeStringToDecimal(offering.end);

            const daysMap: Record<string, string> = {
            M: "Mon",
            T: "Tue",
            W: "Wed",
            Th: "Thu",
            F: "Fri",
            };

            const daysList: string[] = [];
            if (daysPart) {
                for (let i = 0; i < daysPart.length; i++) {
                    if (daysPart[i] === "T" && daysPart[i + 1] === "h") {
                        daysList.push("Thu");
                        i++;
                    } else if (daysPart[i] === "T") daysList.push("Tue");
                    else if (daysPart[i] === "M") daysList.push("Mon");
                    else if (daysPart[i] === "W") daysList.push("Wed");
                    else if (daysPart[i] === "F") daysList.push("Fri");
                }
            }

            daysList.forEach(d => allTimes.push({ day: d, start, end }));
        }

        return { code: course.code, classNumber: offering.number!, times: allTimes, conflict: false };
    };

    // Function to generate all combinations of lecture + lab + discussion
    const getSectionCombinations = (course: Course) => {
        const lectures = course.lectureSections || [null]; // array of Sections
        const labs = course.labSections || [null]; // array of Sections or array with one null element
        const discussions = course.discussionSections || [null];

        if (!(lectures || labs || discussions)) {
            throw new Error("No sections for this course! This is a database problem.");
        }

        const combinations: {
            lecture: CourseOffering | null,
            lab: CourseOffering | null,
            discussion: CourseOffering | null
        }[] = [];
        lectures.forEach((lecture) => {
            labs.forEach((lab) => {
                discussions.forEach((discussion) => {
                    combinations.push({lecture, lab, discussion});
                })
            })
        });

        return combinations;
    }
    // Generate all possible schedules
    useEffect(() => {
        const courseCodes = schedulesInSemester[currentSemester][currentSchedule];
        const courses = allCourses.filter((course) => courseCodes.includes(course.code));
        
        if (courses.length === 0) {
            setScheduleOptions([]);
            setSelectedScheduleIndex(0);
            return;
        }

        // Generate all combinations recursively
        // result = array of schedules that the student could take given an array of Courses (so it is an array of array of Courses)
        const combineSchedules = (courses: Course[], index = 0, current: ScheduledCourse[] = [], result: ScheduledCourse[][] = []) => {
            if (index === courses.length) {
                result.push([...current]);
                return;
            }

            const course = courses[index];
            const combinations = getSectionCombinations(course); // array of {lec: Section, lab: Section, dis: Section}s

            // outer recursion -> moves through courses
            // inner forEach loop -> iterates through section combinations of current course
            combinations.forEach((combo) => {
                const scheduledLecture = combo.lecture ? {...parseCourseTimes(course, combo.lecture), type: "LEC" as const} : null;
                const scheduledLab = combo.lab ? {...parseCourseTimes(course, combo.lab), type: "LAB" as const} : null;
                const scheduledDiscussion = combo.discussion ? {...parseCourseTimes(course, combo.discussion), type: "DIS" as const} : null;
                
                if (scheduledLecture) current.push(scheduledLecture);
                if (scheduledLab) current.push(scheduledLab);
                if (scheduledDiscussion) current.push(scheduledDiscussion);

                combineSchedules(courses, index + 1, current, result);
                if (scheduledLecture) current.pop();
                if (scheduledLab) current.pop();
                if (scheduledDiscussion) current.pop();
            });
        };

        const allSchedules: ScheduledCourse[][] = [];
        combineSchedules(courses, 0, [], allSchedules);

        // Check conflicts for each schedule
        const markConflicts = (schedule: ScheduledCourse[]) => {
            for (let i = 0; i < schedule.length; i++) {
                for (let j = i + 1; j < schedule.length; j++) {
                    const a = schedule[i];
                    const b = schedule[j];

                    for (const t1 of a.times) {
                        for (const t2 of b.times) {
                            if (t1.day === t2.day && t1.start < t2.end && t2.start < t1.end) {
                                a.conflict = true;
                                b.conflict = true;
                            }
                        }
                    }
                }
            }
            return schedule;
        };

        const schedulesAfterConflictCheck = allSchedules.map((schedule) => {
            const scheduleCopy = [...schedule];
            markConflicts(scheduleCopy);
            assignColorsToSchedule(scheduleCopy);
            return scheduleCopy;
        });

        setScheduleOptions(schedulesAfterConflictCheck);
        setSelectedScheduleIndex(0);
    }, [allCourses, schedulesInSemester, currentSemester, currentSchedule]);

    return (
        <div className="flex items-start gap-2 w-full">
            {/* Navigation bar */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        setSelectedScheduleIndex((prev) => Math.max(prev - 1, 0))
                    } 
                    disabled={selectedScheduleIndex === 0}
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ◀
                </button>
                <span>
                    Schedule {selectedScheduleIndex + 1} of {scheduleOptions.length}
                </span>
                <button
                    onClick={() =>
                        setSelectedScheduleIndex((prev) =>
                            Math.min(prev + 1, scheduleOptions.length - 1)
                        )
                    }
                    disabled={selectedScheduleIndex === scheduleOptions.length - 1}
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ▶
                </button>
            </div>
            
            {/* Grid */}
            <div 
                className="grid border border-gray-300 w-2/3 ml-auto"
                style={{ 
                    gridTemplateColumns: "60px repeat(5, 1fr)", // 60 px width for time column + equal width for day columns
                    gridTemplateRows: `auto repeat(${hours.length}, 60px)` // 60 px height for each hour block
                }}
            >
                {/* Top-left empty cell */} 
                <div className="border-b border-gray-300"></div>

                {/* Day headers */} 
                {days.map(day => ( 
                    <div key={day} className="border-l border-b border-gray-300 text-center font-bold bg-gray-100">
                        {day}
                    </div> 
                ))}

                {/* Hours and course blocks */}
                {hours.map(hour => {
                    const hourDecimal = hourToDecimal(hour); // Conver "8 AM" to 8, "1 PM" to 13, etc.
                    return (
                        // Use React.Fragment to group hour label and day columns (no extra div in DOM)
                        <React.Fragment key={hour}>
                            {/* Hour label */}
                            <div className="border-l border-b border-gray-300 text-right pr-1 text-xs">
                                {hour}
                            </div>

                            {/* Day columns */}
                            {days.map(day => (
                                <div key={`${day}-${hour}`} className="border-l border-b border-gray-300 relative min-h-10">
                                    {/* Course blocks for this day/hour */}
                                    {scheduleOptions[selectedScheduleIndex]?.map((course) => 
                                        course.times
                                            .filter((t) => t.day === day && Math.floor(t.start) === hourToDecimal(hour))
                                            .map((t, idx) => {
                                                const top = ((t.start % 1) * 60); // fractional hours to minutes offset
                                                const height = (t.end - t.start) * 60; // duration in minutes
                                                return (
                                                    <div
                                                        key={`${course.code}-${t.day}-${idx}`}
                                                        className={`absolute left-0 right-0 px-1 text-xs font-bold rounded ${course.conflict ? "bg-red-400" : course.color}`}
                                                        style={{ top: `${top}px`, height: `${height}px` }}
                                                    >
                                                        {course.code} <br />
                                                        <span className="font-bold">{course.type}</span>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            ))}
                        </React.Fragment>
                    )
                })}
            </div>      
        </div>
    );
}