export interface Subject {
  id: number;
  name: string;
}

export interface Stage {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  course_name: string;
  students_count: number;
  course_income: number;
  teacher_share: number;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  commission: string;
  students_count: number;
  courses_count: number;
  total_income: number;

  subject?: Subject;
  stage?: Stage;

  courses?: Course[];

  account_holder_name?: string;
  account_number?: string;
  iban?: string;
  swift_code?: string;
  branch_name?: string;

  wallets_name?: string;
  wallets_number?: string;
}
