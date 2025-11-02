export type CourseOffering = {
    class_nbr: number // uid-serving
    component: string | null
    course: string | null
    course_nbr: number | null
    course_title: string | null
    course_topic: string | null
    end: string | null
    end_date: string | null
    instructor: string | null
    meeting_days: string | null
    number: string | null
    room: string | null
    section_nbr: number | null
    semester: string | null
    start: string | null
    start_date: string | null
}

export type SupabaseTokens = {
    access_token: string;
    refresh_token: string;
}

export type Schedule = {
    name: string;
    term?: string;
    courses: CourseOffering[];
}

export type LooseSchedule = {
    term?: string;
    courses: Course[];
}

export type Course = {
    code: string;               // e.g. "EECS 168" -- uid-serving
    number: string;
    departmentCode: string;
    name: string;               // e.g. "Programming I"
    sections: CourseOffering[];
    lectureSections?: CourseOffering[];
    labSections?: CourseOffering[];    // optional
    discussionSections?: CourseOffering[]; // optional
};

export type Semester = Schedule[];