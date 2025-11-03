export type CourseRow = {
  class_nbr: number;
  course: string | null;
  number: string | null;
  course_nbr: number | null;
  course_title: string | null;
  section_nbr: string | null;
  course_topic: string | null;
  start: string | null;
  end: string | null;
  meeting_days: string | null;
  end_date: string | null;
  start_date: string | null;
  semester: string | null;
  instructor: string | null;
  component: string | null;
  room: string | null;
};

export type SupabaseTokens = {
  access_token: string;
  refresh_token: string;
};
