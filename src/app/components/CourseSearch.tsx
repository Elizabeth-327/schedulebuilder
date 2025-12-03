/* 
 * Author(s): Hunter Long, Anya Combs
 * Date: 11/02/25
 * Description: Component for searching and selecting courses.
 * Sources: 
 */

"use client";

import { useState, useEffect, FormEventHandler, useRef } from "react";
import { CourseOffering } from "../types/custom";
import { getCourses } from "../supabaseAccess";
import CourseInfoPopUp from "./CourseInfoPopUp";
import { Course, Schedule } from "../types/custom";

interface CourseSearchProps {
  allCourses: Course[];
  onScheduleUpdate?: (course: Course) => void;
  currentSemester: string;
}

export default function CourseSearch({
  allCourses,
  onScheduleUpdate,
  currentSemester,
}: CourseSearchProps) {

  // STATE

  // const [courses, setCourses] = useState<CourseOffering[]>([]);
  // const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(
    null
  );

  // LIFECYCLE

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultRef.current &&
        !resultRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const trimmed = query.trim().toLowerCase();
  const filteredCourses = trimmed
    ? allCourses.filter(c => c.sections.some(s => s.semester === currentSemester)).filter((course) => {
		/*
        const num = Number(trimmed);
        if (!Number.isNaN(num)) {
          return course.class_nbr === num || course.course_nbr === num;
        }
		*/
        return (
          (course.name.toLowerCase().includes(trimmed) ?? false) ||
          (course.code.toLowerCase().includes(trimmed) ?? false)
        );
      })
    : [];

  return (
    <div>
      <form action="submit">
        <div className="relative top-full left-0 w-full inline-block sm:w-150 ">
          <input
            type="text"
            name="coursesearch"
            id="coursesearch"
            className="border border-gray-300 bg-sky-100 rounded py-1 px-2"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder=" Search Courses"
          />
          {isSearchOpen && (
            <div
              ref={resultRef}
              className="absolute top-full left-0 w-full z-30 mt-1 bg-white rounded border max-h-64 overflow-y-auto"
            >
              <ul role="listbox" aria-label="Course results" className="p-2 ">
                {filteredCourses.map((course) => (
                  <li key={course.code} role="option">
                    <div
                      className="rounded border p-3 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsSearchOpen(false);
                      }}
                    >
                      <strong>
                        {course.code}
                      </strong>
                      : {course.name}
                    </div>
                  </li>
                ))}
                {filteredCourses.length == 0 && (
                  <li>No courses found.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </form>
      {selectedCourse && (
        <CourseInfoPopUp
          //course={selectedCourse.sections[0]} // fix
          // Elizabeth's fix
          section={
            selectedCourse.lectureSections.filter(s => s.semester == currentSemester).length > 0 // if a lecture section exists for the current semester 
              ? selectedCourse.lectureSections.filter(s => s.semester == currentSemester)[0] // show the first occurring lecture section info for the current semester
              : selectedCourse.sections.filter(s => s.semester == currentSemester)[0] // else show the first occurring section for the current semester
          }
          onClose={() => setSelectedCourse(null)}
          onAddtoSchedule={(course) => {
            const CourseCode = `${course.course} ${course.number}`;
            const matchCourse = allCourses.find((c) => c.code === CourseCode);
            if (course && onScheduleUpdate) {
              onScheduleUpdate(matchCourse!);
              setSelectedCourse(null);
            } else {
              alert(`Course: ${CourseCode} not found in master list.`);
            }
          }}
          courseBank={allCourses}
        />
      )}
    </div>
  );
}

