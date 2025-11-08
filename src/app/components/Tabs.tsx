import { useRouter } from "next/navigation";
import { Plan, Schedule } from "../types/custom";

type TabsProps = {
    semesters: string[], // e.g. ["Fall 2025", "Spring 2025", etc.]
    //schedulesInSemester: Schedule[],
    schedules: Schedule[],
    activeSemester: string, // e.g. "Fall 2025"
    activeSchedule: Schedule,
};

export default function Tabs({ semesters, activeSemester, schedules, activeSchedule }: TabsProps) {
    const router = useRouter();
    const schedulesInSemester = schedules.filter(s => s.term === activeSemester);
    const handleSemesterChange = (semester: string) => {
        // Default to first plan of new semester
        const schedulesForNewSemester = schedules.filter(s => s.term === semester);
        const firstPlan = schedulesForNewSemester[0] || null;
        router.replace(`/schedule?semester=${encodeURIComponent(semester)}&plan=${encodeURIComponent(firstPlan?.name ?? "")}`);
    };

    const handlePlanChange = (plan: Plan) => {
        router.replace(`/schedule?semester=${encodeURIComponent(activeSemester)}&plan=${encodeURIComponent(plan.name)}`);
    };
    return (
        <div className="flex flex-col gap-2">
            {/* Semester Tabs */}
            <div className="flex space-x-1 mb-0.5">
                {semesters.map(semester => {
                    const isActive = semester === activeSemester;
                    return (
                        <button
                            key={semester}
                            onClick={() => handleSemesterChange(semester)}
                            className={`px-4 py-2 rounded-t font-medium transition-colors ${
                                isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {semester}
                        </button>
                    );
                })}
            </div>

            {/* Plan Tabs */}
            {/*<div className="flex gap-2">*/}
            <div className="flex space-x-1 mb-2">
                {schedulesInSemester.map((semesterSchedule) => {
                    const isActivePlan = semesterSchedule === activeSchedule;
                    return (
                        <button
                            key={semesterSchedule.name}
                            onClick={() => handlePlanChange(semesterSchedule)}
                            className={`px-3 py-1 rounded-t text-sm ${
                                isActivePlan
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            {semesterSchedule.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


