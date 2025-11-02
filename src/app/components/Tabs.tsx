import { useRouter } from "next/navigation";

type TabsProps = {
    semesters: string[], // e.g. ["Fall 2025", "Spring 2025", etc.]
    semesterPlans: Record<string, string[]>; // e.g., { "Fall 2025": ["Plan A", "Plan B"], "Spring 2025": ["Plan A1, Plan B1"] }
    activeSemester: string // e.g. "Fall 2025"
    activePlan: string // e.g. "Plan A"
};



export default function Tabs({ semesters, semesterPlans, activeSemester, activePlan }: TabsProps) {
    const router = useRouter();
    
    const handleSemesterChange = (semester: string) => {
        // Default to first plan of new semester
        const firstPlan = semesterPlans[semester][0];
        router.replace(`/schedule?semester=${encodeURIComponent(semester)}&plan=${encodeURIComponent(firstPlan)}`);
    };

    const handlePlanChange = (plan: string) => {
        router.replace(`/schedule?semester=${encodeURIComponent(activeSemester)}&plan=${encodeURIComponent(plan)}`);
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
                {semesterPlans[activeSemester].map((semesterPlan) => {
                    const isActivePlan = semesterPlan === activePlan;
                    return (
                        <button
                            key={semesterPlan}
                            onClick={() => handlePlanChange(semesterPlan)}
                            className={`px-3 py-1 rounded-t text-sm ${
                                isActivePlan
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            {semesterPlan}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


