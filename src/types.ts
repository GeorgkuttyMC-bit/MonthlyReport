export interface ProjectRow {
  Owner: string;
  'Project Name'?: string;
  [key: string]: any;
}

export interface OwnerData {
  Owner: string;
  Rows: ProjectRow[];
}

export type UserRole = 'ADMIN' | 'EMPLOYEE' | null;

export interface AppState {
  role: UserRole;
  currentUser: OwnerData | null;
  employees: OwnerData[];
  lastUpdated: string | null;
}
