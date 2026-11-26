import axios, { type AxiosRequestConfig } from "axios";
import { auth } from "@/lib/firebase";
import { logger } from "@/lib/log";
import { newRequestId, toApiError } from "./errors";

const log = logger("api");

/**
 * Shared API client.
 * - 30 s default timeout (uploads set their own); before this, a hung server meant a spinner forever.
 * - Every request carries a Firebase ID token and an X-Request-ID the server echoes and logs.
 * - A 401 is retried once with a freshly refreshed token.
 * - Every failure is normalised to ApiError (see ./errors) and logged: 5xx, network and timeouts as errors,
 *   other 4xx as debug (they're usually handled by the caller).
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30_000,
});

type Retryable = AxiosRequestConfig & { _retriedAuth?: boolean };

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers["X-Request-ID"]) config.headers["X-Request-ID"] = newRequestId();
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const cfg = err?.config as Retryable | undefined;
    if (err?.response?.status === 401 && cfg && !cfg._retriedAuth && auth.currentUser) {
      cfg._retriedAuth = true;
      try {
        const token = await auth.currentUser.getIdToken(true);
        cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
        return api.request(cfg);
      } catch (refreshErr) {
        log.warn("Token refresh failed", refreshErr);
      }
    }
    const e = toApiError(err);
    const where = `${(cfg?.method ?? "get").toUpperCase()} ${cfg?.url ?? "?"}`;
    const ctx = { requestId: e.requestId ?? (cfg?.headers?.["X-Request-ID"] as string | undefined), status: e.status, source: "api" };
    if (e.kind === "aborted") { /* cancelled on purpose */ }
    else if (e.kind !== "http" || (e.status ?? 0) >= 500) log.error(`${where} failed: ${e.kind}${e.status ? ` ${e.status}` : ""}`, e, ctx);
    else log.debug(`${where} -> ${e.status} ${e.code ?? ""}`, ctx);
    return Promise.reject(e);
  },
);
