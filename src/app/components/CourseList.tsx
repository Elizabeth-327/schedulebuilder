"use client";
import { Course, CourseOffering } from "../types/custom";

interface CourseListProps {
  courses: Course[]; // changed from CourseOffering[] to Course[]
  onRemoveCourse: (courseCode: string) => void;
}
export default function CourseList({
  courses,
  onRemoveCourse,
}: CourseListProps) {
  return (
    <div className="bg-white rounded border border-gray-300 max-h-[calc(100vh-150px)] overflow-y-auto">
      <div className="p-2 bg-gray-100 border-b border-gray-300 sticky top-0">
        <h3 className="font-bold text-sm">Courses in Schedule</h3>
      </div>
      <ul role="list" aria-label="Scheduled courses" className="p-2 border-gray-300">
        {courses.length === 0 ? (
          <li className="text-gray-500 text-sm text-center py-4">
            No courses in this schedule
          </li>
        ) : (
          courses.map((course) => (
            <li key={course.code} role="listitem">
              <div className="rounded border p-3 mb-2 border-gray-300 hover:bg-gray-50 hover:border-gray-500 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div>
                      <strong>{course.code}</strong>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {course.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-1">
                      {course.lectureSections.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {course.lectureSections.length} LEC
                        </span>
                      )}
                      {course.labSections.length > 0 && (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          {course.labSections.length} LAB
                        </span>
                      )}
                      {course.discussionSections.length > 0 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          {course.discussionSections.length} DIS
                        </span>
                      )}
                    </div>
                  </div>
                  {onRemoveCourse && (
                    <button
                      onClick={() => onRemoveCourse(course.code)}
                      className="ml-2 text-gray-400 hover:text-red-600 transition"
                      title="Remove course"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
