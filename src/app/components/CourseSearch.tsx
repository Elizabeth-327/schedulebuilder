"use client";

import { useState, useEffect, FormEventHandler } from "react";
import { CourseRow } from "../types/custom";
import { getCourses } from "../supabaseAccess";

export default function CourseSearch() {
  // STATE

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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
      <form action="submit" onSubmit={formSubmitHandler} className>
        <div className="relative top-full left-0 w-full inline-block w-80 sm:w-150 ">
          <input
            type="text"
            name="coursesearch"
            id="coursesearch"
            className="border"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder=" Search Courses"
          />
          <div className="absolute top-full left-0 w-full z-30 mt-1 bg-white rounded border max-h-64 overflow-y-auto">
            <ul role="listbox" aria-label="Course results" className="p-2 ">
              {filteredCourses.map((course) => (
                <li key={course.class_nbr} role="option">
                  <div className="rounded border  p-3 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer">
                    <strong>
                      {course.course} {course.number}
                    </strong>
                    : {course.course_title}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
