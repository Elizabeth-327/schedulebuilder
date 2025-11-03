export type CourseRow = {
    class_nbr: number;
    component: string | null; 
    course: string | null; 
    course_nbr: number | null; 
    number: string | null;
    course_title: string | null; 
    course_topic: string | null; 
    end: string | null; 
    end_date: string | null; 
    start_date: string | null; 
}

export type SupabaseTokens = {
    access_token: string;
    refresh_token: string;
}