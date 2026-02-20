// API Response Types
export interface Employee {
  EMPL_CODE: string;
  TNAME: string;
}

export interface EvaluationRecord {
  id: number;
  EmplCode: string;
  FullnameTHEmpl: string;
  MainOrgOrgShort: string;
  MainPositionOrgShort: string;
  EmplCode_Evaluator1?: string;
  FullnameTH1?: string;
  EmplCode_Evaluator2?: string;
  FullnameTH2?: string;
  EmplCode_Evaluator3?: string;
  FullnameTH3?: string;
  EmplCode_AdminUpdate?: string;
  EmplCode_AdminUpdateTH?: string;
  UpdateDate?: string;
  CCTR?: string;
  ApproverName?: string;
  ApproverPosition?: string;
}

export interface EvaGetDataRequest {
  EmplCode: string;
}

export interface EvaGetDataResponse {
  data: EvaluationRecord[];
  success: boolean;
  message?: string;
}

export interface EvaSaveDataRequest {
  id: number;
  EmplCode_Evaluator1: string;
  EmplCode_Evaluator2: string;
  EmplCode_Evaluator3: string;
  EmplCode_AdminUpdate: string;
}

export interface EvaSaveDataResponse {
  success: boolean;
  message: string;
}

// User Profile from MS Graph
export interface UserProfile {
  id: string;
  displayName: string;
  jobTitle?: string;
  mail?: string;
  employeeId?: string;
  photo?: string;
}

// Select Option Type
export interface SelectOption {
  value: string;
  label: string;
}
