/* 
 * Author(s): Hunter Long,
 * Date: 11/02/25
 * Description: 
 * Sources: 
 */

"use client";
import { Course, CourseOffering, mapSectionToCourse } from "../types/custom";
import Popup from "./Popup";
import { on } from "events";

interface CourseInfoPopupProps {
  section: CourseOffering;
  onClose: () => void;
  onAddtoSchedule: (course: CourseOffering) => void;
  courseBank: Course[];
}

export default function CourseInfoPopup({
  section,
  onClose,
  onAddtoSchedule,
  courseBank
}: CourseInfoPopupProps) {
  const course = mapSectionToCourse(section, courseBank)!;
  return (
    <Popup title={course.name || "Course Info"} onClose={onClose}>
      <div className="space-y-4">
        <p>
          <strong>Course Code:</strong> {course.code}
        </p>
        <p>
          <strong>Course Title:</strong> {course.name}
        </p>
        {onAddtoSchedule && (
          <div className="pt-4">
            <button
              onClick={() => {
                onAddtoSchedule(section);
                onClose();
              }}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Add to Schedule
            </button>
          </div>
        )}
      </div>
    </Popup>
  );
}