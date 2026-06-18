// Shared API contract types for the PreCheck frontend.

export interface Patient {
  full_name?: string;
  birth_date?: string;
  sex?: string;
  external_id?: string;
}

export interface Alert {
  level: string; // "RED" | "YELLOW" | "GREEN"
  description: string;
}

// structured_data is highly dynamic (classic vs SOAP shapes) — kept loose on purpose.
export type StructuredData = Record<string, any>;

export interface Summary {
  id: number;
  status: string; // "draft" | "approved" | "rejected"
  created_at?: string;
  patient_id?: number;
  patient?: Patient;
  ai_summary?: string;
  final_summary?: string;
  structured_data?: StructuredData;
}

export interface SummaryListResponse {
  items: Summary[];
}

// Exam photos attached to a summary. The listing endpoint returns only ids +
// type; the signed URL for each is fetched separately (and is short-lived).
export interface SummaryMediaItem {
  media_id: number;
  type?: string | null;
}

export interface SummaryMediaListResponse {
  items: SummaryMediaItem[];
}

export interface MediaUrlResponse {
  url: string;
  expires_at: string;
}

export interface UserInfo {
  name?: string;
  email?: string;
  role?: string; // "admin" | "doctor" | "service"
  clinic_id?: number | null;
  [key: string]: any;
}

export interface DemoRequest {
  id: number;
  name: string;
  email: string;
  clinic_name: string | null;
  profile: string | null;
  message: string | null;
  status: string; // "new" | "contacted" | "converted" | "dismissed"
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DemoRequestListResponse {
  items: DemoRequest[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
}

export interface DemoRequestCreatePayload {
  name: string;
  email: string;
  clinic?: string;
  profile?: string;
  message?: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface BulkDeleteResponse {
  deleted: number;
  requested: number;
  skipped: number;
  summaries_removed: number;
}

// Generic envelope returned by endpoints whose body is intentionally minimal
// (password reset request / verify / confirm).
export interface MessageResponse {
  detail: string;
}
