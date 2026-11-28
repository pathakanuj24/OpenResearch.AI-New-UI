/**
 * One error type for every API failure, whatever produced it (axios, fetch, the network, a timeout),
 * plus the plain-language message to show the reader.
 *
 * The backend answers errors as {"error": {"code", "message", "request_id"}, "detail"}; older routes
 * send only {"detail"}. Both are understood.
 */
import { isAxiosError } from "axios";

export type ApiErrorKind = "network" | "timeout" | "http" | "aborted" | "unknown";

export class ApiError extends Error {
  constructor(
    message: string,
    public kind: ApiErrorKind,
    public status?: number,
    public code?: string,
    public requestId?: string | null,
    public retryAfter?: number,
    public serverMessage?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
  get isClientError() { return this.kind === "http" && !!this.status && this.status >= 400 && this.status < 500; }
  /** Worth retrying automatically: the network, timeouts, 5xx, 429 and 408. */
  get retryable() {
    return this.kind === "network" || this.kind === "timeout" || (this.status ?? 0) >= 500 || this.status === 429 || this.status === 408;
  }
}

type ErrorBody = { error?: { code?: string; message?: string; request_id?: string }; detail?: unknown };

function serverMessage(body: unknown): { message?: string; code?: string; requestId?: string } {
  if (!body || typeof body !== "object") return {};
  const b = body as ErrorBody;
  const detail = typeof b.detail === "string" ? b.detail : undefined;
  return { message: b.error?.message ?? detail, code: b.error?.code, requestId: b.error?.request_id };
}

/** Plain-language text for the reader. Server messages are used only where they are written for people. */
export function userMessage(status: number | undefined, kind: ApiErrorKind, server?: string, retryAfter?: number, requestId?: string | null) {
  if (kind === "network") return "Can't reach Insightway. Check your connection and try again.";
  if (kind === "timeout") return "That took too long. Try again.";
  if (kind === "aborted") return "Cancelled.";
  switch (status) {
    case 400: case 409: case 422: return server ?? "Something in that request wasn't valid.";
    case 401: return "Your session expired. Sign in again.";
    case 403: return "You don't have access to that.";
    case 404: return server ?? "We couldn't find that.";
    case 413: return "That file is too large to upload.";
    case 415: return "That file type isn't supported. Upload a PDF.";
    case 429: return retryAfter ? `You're going a bit fast. Try again in ${retryAfter} s.` : server ?? "You're going a bit fast. Try again shortly.";
    case 503: return server ?? "Insightway is starting up or busy. Try again in a moment.";
  }
  if (status && status >= 500) return `Something went wrong on our side.${requestId ? ` Reference: ${requestId}` : ""}`;
  return server ?? "Something went wrong. Try again.";
}

/** Normalise anything thrown by an API call into an ApiError. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (isAxiosError(err)) {
    if (err.code === "ERR_CANCELED") return new ApiError("Cancelled.", "aborted");
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") return new ApiError(userMessage(undefined, "timeout"), "timeout");
    if (!err.response) return new ApiError(userMessage(undefined, "network"), "network");
    const status = err.response.status;
    const s = serverMessage(err.response.data);
    const rid = s.requestId ?? (err.response.headers?.["x-request-id"] as string | undefined) ?? null;
    const ra = Number(err.response.headers?.["retry-after"]) || undefined;
    return new ApiError(userMessage(status, "http", s.message, ra, rid), "http", status, s.code, rid, ra, s.message);
  }
  if (err instanceof DOMException && err.name === "AbortError") return new ApiError("Cancelled.", "aborted");
  if (err instanceof TypeError) return new ApiError(userMessage(undefined, "network"), "network"); // fetch network failure
  return new ApiError(err instanceof Error ? err.message : "Something went wrong. Try again.", "unknown");
}

/** For fetch(): throw an ApiError for non-2xx responses. */
export async function ensureOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  let body: unknown = null;
  try { body = await res.clone().json(); } catch { /* not JSON */ }
  const s = serverMessage(body);
  const rid = s.requestId ?? res.headers.get("x-request-id");
  const ra = Number(res.headers.get("retry-after")) || undefined;
  throw new ApiError(userMessage(res.status, "http", s.message, ra, rid), "http", res.status, s.code, rid, ra, s.message);
}

/** A request id the server will echo and log, so a browser report and the server log line can be matched. */
export function newRequestId() {
  try { return `web-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`; } catch { return `web-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`; }
}
