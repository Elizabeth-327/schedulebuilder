"use client";

import { useState, useEffect, FormEventHandler, useRef } from "react";
import { CourseOffering } from "../types/custom";
import { getCourses } from "../supabaseAccess";
import CourseInfoPopUp from "./CourseInfoPopUp";
import { Course, Schedule } from "../types/custom";

interface CourseSearchProps {
  allCourses: Course[];
  onScheduleUpdate?: (course: Course) => void;
}

export default function CourseSearch({
  allCourses,
  onScheduleUpdate,
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
    ? allCourses.filter((course) => {
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
            className="border"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder=" Search Courses"
          />
          {isSearchOpen && filteredCourses.length > 0 && (
            <div
              ref={resultRef}
              className="absolute top-full left-0 w-full z-30 mt-1 bg-white rounded border max-h-64 overflow-y-auto"
            >
              <ul role="listbox" aria-label="Course results" className="p-2 ">
                {filteredCourses.map((course) => (
                  <li key={course.code} role="option">
                    <div
                      className="rounded border  p-3 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
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
              </ul>
            </div>
          )}
        </div>
      </form>
      {selectedCourse && (
        <CourseInfoPopUp
          course={selectedCourse.sections[0]} // fix
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
        />
      )}
    </div>
  );
}

