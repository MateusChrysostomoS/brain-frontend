// Typed API client. Base URL is inlined at build time from NEXT_PUBLIC_API_URL.

import { getToken } from "./auth";
import type {
  BulkDeleteResponse,
  DemoRequest,
  DemoRequestCreatePayload,
  DemoRequestListResponse,
  LoginResponse,
  MediaUrlResponse,
  MessageResponse,
  Summary,
  SummaryListResponse,
  SummaryMediaListResponse,
  UserInfo,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || res.statusText);
  }
  return res.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(): Promise<UserInfo> {
  return apiFetch<UserInfo>("/me");
}

export function listSummaries(skip = 0, limit = 100): Promise<SummaryListResponse> {
  return apiFetch<SummaryListResponse>(`/summaries?skip=${skip}&limit=${limit}`);
}

export function getSummary(id: number | string): Promise<Summary> {
  return apiFetch<Summary>(`/summaries/${id}`);
}

export function patchSummaryStatus(id: number | string, status: string): Promise<Summary> {
  return apiFetch<Summary>(`/summaries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Exam photos for a summary — returns only media ids (+ type). Empty for
// consultations created before the feature (summary.session_id is NULL).
export function getSummaryMedia(id: number | string): Promise<SummaryMediaListResponse> {
  return apiFetch<SummaryMediaListResponse>(`/summaries/${id}/media`);
}

// Short-lived (~15min) presigned URL for one image. Re-fetched on <img> error.
export function getMediaUrl(mediaId: number | string): Promise<MediaUrlResponse> {
  return apiFetch<MediaUrlResponse>(`/media/${mediaId}/url`);
}

export function deletePatients(ids: number[]): Promise<BulkDeleteResponse> {
  return apiFetch<BulkDeleteResponse>("/patients/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ── Password reset ─────────────────────────────────────────────────────────

// Step 1 — ask the backend to e-mail a reset link. Always returns a generic
// success message; the response shape is intentionally identical whether or
// not the e-mail exists, to avoid account enumeration.
export function requestPasswordReset(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Step 2 — pre-validate the token before showing the new-password form,
// so the user gets immediate feedback on a broken/expired link.
export function verifyResetToken(token: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/auth/password-reset/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// Step 3 — consume the token and set the new password. Backend forces the
// user to log in again afterwards (no auto-login).
export function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

// ── Leads (Inbound — landing page demo requests) ───────────────────────────

// Público — chamado pelo formulário "Agendar demonstração" da landing.
export function submitDemoRequest(
  payload: DemoRequestCreatePayload,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/leads/demo-request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Admin — lista leads para a aba Inbound.
export function listDemoRequests(
  skip = 0,
  limit = 100,
  statusFilter?: string,
): Promise<DemoRequestListResponse> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (statusFilter) params.set("status", statusFilter);
  return apiFetch<DemoRequestListResponse>(`/leads/demo-requests?${params.toString()}`);
}

// Admin — muda status do lead (new → contacted → converted/dismissed).
export function updateDemoRequestStatus(
  id: number,
  status: string,
): Promise<DemoRequest> {
  return apiFetch<DemoRequest>(`/leads/demo-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
