"use client";
import Popup from "./PopUp";
import { CourseOffering } from "../types/custom";
import { on } from "events";

interface CourseInfoPopUpProps {
  course: CourseOffering;
  onClose: () => void;
  onAddtoSchedule: (course: CourseOffering) => void;
}

export default function CourseInfoPopUp({
  course,
  onClose,
  onAddtoSchedule,
}: CourseInfoPopUpProps) {
  return (
    <Popup title={course.course_title || "Course Info"} onClose={onClose}>
      <div className="space-y-4">
        <p>
          <strong>Class Number:</strong> {course.class_nbr}
        </p>
        <p>
          <strong>Course Code:</strong> {course.course} {course.number}
        </p>
        <p>
          <strong>Course Number:</strong> {course.course_nbr}
        </p>
        <p>
          <strong>Course Title:</strong> {course.course_title}
        </p>
        <p>
          <strong>Section:</strong> {course.section_nbr}
        </p>
        <p>
          <strong>Course Topic:</strong> {course.course_topic}
        </p>
        <p>
          <strong> Time:</strong> {course.start} -{course.end}
        </p>
        <p>
          <strong>Meeting Days:</strong> {course.meeting_days}
        </p>
        <p>
          <strong>Dates:</strong> Start: {course.start_date}, End:{" "}
          {course.end_date}
        </p>
        <p>
          <strong>Semester:</strong> {course.semester}
        </p>
        <p>
          <strong>Instructor:</strong> {course.instructor}
        </p>
        <p>
          <strong>Component:</strong> {course.component}
        </p>
        <p>
          <strong>Room:</strong> {course.room}
        </p>

        {onAddtoSchedule && (
          <div className="pt-4">
            <button
              onClick={() => {
                onAddtoSchedule(course);
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