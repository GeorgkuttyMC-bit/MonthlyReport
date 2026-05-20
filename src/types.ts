export interface EmployeeData {
  Name: string;
  Email: string;
  Department: string;
  Q1_Score: number;
  Q2_Score: number;
  Q3_Score: number;
  Q4_Score: number;
  YTD_Sales: string | number;
  Leaves_Taken: number;
  Technical_Skill: number;
  Leadership_Skill: number;
  Communication_Skill: number;
  [key: string]: any;
}

export type UserRole = 'ADMIN' | 'EMPLOYEE' | null;

export interface AppState {
  role: UserRole;
  currentUser: EmployeeData | null;
  employees: EmployeeData[];
  lastUpdated: string | null;
}
