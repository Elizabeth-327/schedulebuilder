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

  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const resultRef = useRef<HTMLUListElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseOffering | null>(
    null
  );

  // LIFECYCLE

  useEffect(() => {
    // after load
    const loadCourses = async () => {
      const courses = await getCourses();
      setCourses(courses);
      setLoading(false);
    };

    loadCourses();
  }, []);
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

  if (loading) {
    return <h2>Loading Courses...</h2>;
  }

  function formSubmitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem(
      "coursesearch"
    ) as HTMLInputElement;
    let query = input.value;
    query = query.trim(); // process more
    // do something -- probably add to the schedule UI.
  }
  const trimmed = query.trim().toLowerCase();
  const filteredCourses = trimmed
    ? courses.filter((course) => {
        const num = Number(trimmed);
        if (!Number.isNaN(num)) {
          return course.class_nbr === num || course.course_nbr === num;
        }
        return (
          (course.course_title?.toLowerCase().includes(trimmed) ?? false) ||
          (course.course?.toLowerCase().includes(trimmed) ?? false)
        );
      })
    : [];

  return (
    <div>
      <form action="submit" onSubmit={formSubmitHandler}>
        <div className="relative top-full left-0 w-full inline-block w-80 sm:w-150 ">
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
                  <li key={course.class_nbr} role="option">
                    <div
                      className="rounded border  p-3 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsSearchOpen(false);
                      }}
                    >
                      <strong>
                        {course.course} {course.number}
                      </strong>
                      : {course.course_title} - {course.component}
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
          course={selectedCourse}
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
