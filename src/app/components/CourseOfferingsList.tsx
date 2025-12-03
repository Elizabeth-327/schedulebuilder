/*
 * Author(s): Marco Martinez( first version of display results)
 * Date: 11/02/25
 * Description: Component to display a list of course offerings from the current permutation of class sections < has been abandoned  after a refactor
 * Sources: CourseList component
 */

"use client";
import { CourseOffering } from "../types/custom";

interface CourseOfferingsProps {
  courses: CourseOffering[];
}

// this doesn't even return JSX
export default function CourseOfferingsList({ courses }: CourseOfferingsProps) {
  const groupedCourses = courses.reduce((acc, offering) => {
    const courseCode = `${offering.course} ${offering.number}`;
    if (!acc[courseCode]) {
      acc[courseCode] = {
        code: courseCode,
        name: offering.course_title || "Unknown Course",
        sections: [],
      };
    }
    acc[courseCode].sections.push(offering);
    return acc;
  }, {} as Record<string, { code: string; name: string; sections: CourseOffering[] }>);

  const courseList = Object.values(groupedCourses);

  //   return (
  //     <div className="bg-white rounded border max-h-[calc(100vh-150px)] overflow-y-auto">
  //       <div className="p-2 bg-gray-100 border-b sticky top-0">
  //         <h3 className="font-bold text-sm">Current Schedule</h3>
  //       </div>
  //       <ul role="list" aria-label="Selected course sections" className="p-2">
  //         {courseList.length === 0 ? (
  //           <li className="text-gray-500 text-sm text-center py-4">
  //             No sections selected
  //           </li>
  //         ) : (
  //           courseList.map((course) => (
  //             <li key={course.code} role="listitem">
  //               <div className="rounded border p-3 mb-2 hover:bg-gray-50 hover:border-gray-300 transition">
  //                 <div className="flex justify-between items-start">
  //                   <div className="flex-1">
  //                     <div>
  //                       <strong>{course.code}</strong>
  //                     </div>
  //                     <div className="text-sm text-gray-600 mt-1">
  //                       {course.name}
  //                     </div>
  //                     <div className="text-xs text-gray-500 mt-2 space-y-1">
  //                       {course.sections.map((section, idx) => (
  //                         <div
  //                           key={idx}
  //                           className="flex items-center gap-2 flex-wrap"
  //                         >
  //                           <span
  //                             className={`px-2 py-0.5 rounded ${
  //                               section.component === "LEC"
  //                                 ? "bg-blue-100 text-blue-800"
  //                                 : section.component === "LBN"
  //                                 ? "bg-green-100 text-green-800"
  //                                 : section.component === "DIS"
  //                                 ? "bg-purple-100 text-purple-800"
  //                                 : "bg-gray-100 text-gray-800"
  //                             }`}
  //                           >
  //                             {section.component}
  //                           </span>
  //                           <span className="text-gray-600">
  //                             {section.meeting_days || "TBA"}
  //                           </span>
  //                           <span className="text-gray-600">
  //                             {section.start && section.end
  //                               ? `${section.start}-${section.end}`
  //                               : ""}
  //                           </span>
  //                         </div>
  //                       ))}
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </li>
  //           ))
  //         )}
  //       </ul>
  //     </div>
  //   );
}
