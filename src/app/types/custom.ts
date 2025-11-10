export type CourseOffering = {
  class_nbr: number; // uid-serving
  component: "LEC" | "LBN" | "DIS" | string | null;
  course: string | null;
  course_nbr: number | null;
  course_title: string | null;
  course_topic: string | null;
  end: string | null;
  end_date: string | null;
  instructor: string | null;
  meeting_days: string | null;
  number: string | null;
  room: string | null;
  section_nbr: number | null;
  semester: string | null;
  start: string | null;
  start_date: string | null;
};

export type SupabaseTokens = {
  access_token: string;
  refresh_token: string;
};

// A plan is a list of classes
// A schedule is a list classes and their sections/times

export type Plan = {
  name: string;
  term: string;
  courses: Course[];
};

export type Schedule = Plan & {
  sections: CourseOffering[];
};

export class Course {
  public number: string;
  public departmentCode: string;
  public lectureSections: CourseOffering[];
  public labSections: CourseOffering[];
  public discussionSections: CourseOffering[];
  public otherSections: CourseOffering[];

  constructor(
    public code: string,
    public name: string,
    public sections: CourseOffering[]
  ) {
    const codeComponents = this.code.split(" ", 2);
    this.number = codeComponents[1];
    this.departmentCode = codeComponents[0];
    this.lectureSections = sections.filter(
      (section) => section.component === "LEC"
    );
    this.labSections = sections.filter(
      (section) => section.component === "LBN"
    );
    this.discussionSections = sections.filter(
      (section) => section.component === "DIS"
    );
    this.otherSections = sections.filter(
      (section) =>
        !section.component || !section.component.match(/^[(LEC)(LBN)(DIS)]$/)
    );
  }
}
