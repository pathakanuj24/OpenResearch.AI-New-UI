/**
 * Browser logging.
 * - Development: everything goes to the console with a [area] prefix.
 * - Production: debug/info are dropped; warnings and errors go to the console and are reported to the API
 *   (POST /v2/client-errors) in small batches, so they land in the same logs as the server's, with the same
 *   request ids. At most 10 reports a minute leave a browser; identical messages are sent once per minute.
 * Never pass tokens, passwords or paper text to the logger.
 */
type Level = "debug" | "info" | "warn" | "error";
export type LogContext = { source?: string; requestId?: string | null; status?: number; [k: string]: unknown };

const isDev = process.env.NODE_ENV !== "production";
const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const RELEASE = process.env.NEXT_PUBLIC_RELEASE ?? "dev";

type Report = { level: Level; message: string; stack?: string; path?: string; source?: string; request_id?: string; status?: number; release: string };
const queue: Report[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
const sentAt = new Map<string, number>();
let windowStart = 0;
let windowCount = 0;

function scrub(s: string) {
  return s
    .replace(/(bearer\s+)[\w.~+/=-]{12,}/gi, "$1[redacted]")
    .replace(/((?:token|password|api[_-]?key)["']?\s*[:=]\s*["']?)[^\s"',;]{6,}/gi, "$1[redacted]")
    .slice(0, 2000);
}

function flush() {
  timer = null;
  if (!queue.length || !API) return;
  const body = JSON.stringify({ errors: queue.splice(0, 20) });
  try {
    // keepalive lets the report survive navigation; it never blocks the page.
    void fetch(`${API}/v2/client-errors`, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })
      .catch(() => undefined);
  } catch { /* reporting must never throw */ }
}

function report(level: Level, area: string, message: string, err?: unknown, ctx?: LogContext) {
  if (typeof window === "undefined" || isDev) return;
  const now = Date.now();
  const key = `${area}|${message}`;
  if ((sentAt.get(key) ?? 0) > now - 60_000) return; // same message once a minute
  if (now - windowStart > 60_000) { windowStart = now; windowCount = 0; }
  if (++windowCount > 10) return;
  sentAt.set(key, now);
  const stack = err instanceof Error && err.stack ? scrub(err.stack).slice(0, 4000) : undefined;
  queue.push({ level, message: scrub(`${area}: ${message}`), stack, path: window.location.pathname, source: ctx?.source ?? area,
    request_id: ctx?.requestId ?? undefined, status: ctx?.status, release: RELEASE });
  if (!timer) timer = setTimeout(flush, 2000);
}

function emit(level: Level, area: string, message: string, err?: unknown, ctx?: LogContext) {
  if (isDev || level === "warn" || level === "error") {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : level === "info" ? console.info : console.debug;
    const extra = [ctx && Object.keys(ctx).length ? ctx : undefined, err].filter((x) => x !== undefined);
    fn(`[${area}] ${message}`, ...extra);
  }
  if (level === "warn" || level === "error") report(level, area, message, err, ctx);
}

/** `const log = logger("guide")` then `log.error("stream failed", err, { requestId })`. */
export function logger(area: string) {
  return {
    debug: (msg: string, ctx?: LogContext) => emit("debug", area, msg, undefined, ctx),
    info: (msg: string, ctx?: LogContext) => emit("info", area, msg, undefined, ctx),
    warn: (msg: string, err?: unknown, ctx?: LogContext) => emit("warn", area, msg, err, ctx),
    error: (msg: string, err?: unknown, ctx?: LogContext) => emit("error", area, msg, err, ctx),
  };
}

/** Uncaught errors and unhandled promise rejections, installed once from the app providers. */
export function installGlobalErrorLogging() {
  if (typeof window === "undefined") return () => undefined;
  const log = logger("window");
  const onError = (e: ErrorEvent) => log.error(e.message || "Uncaught error", e.error, { source: "window.onerror" });
  const onRejection = (e: PromiseRejectionEvent) => {
    const r = e.reason;
    // Aborted requests (navigation, Stop) aren't errors.
    if (r && typeof r === "object" && "name" in r && (r as { name: string }).name === "AbortError") return;
    log.error(r instanceof Error ? r.message : "Unhandled promise rejection", r, { source: "unhandledrejection" });
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  const onHide = () => { if (document.visibilityState === "hidden") flush(); };
  document.addEventListener("visibilitychange", onHide);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    document.removeEventListener("visibilitychange", onHide);
  };
}
