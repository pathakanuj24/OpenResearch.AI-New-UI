import { cn } from "@/lib/utils";

export type TrailStop = { label?: string; state: "done" | "current" | "ahead" };

/**
 * Small winding trail: done stops are sun-filled, the current stop gets a flag ("you are here"),
 * stops ahead are dotted. Used in the Today hero, sign-in panel and marketing.
 */
export function MiniTrail({ stops, className, labels = true, tone = "onMoss" }: {
  stops: TrailStop[]; className?: string; labels?: boolean; tone?: "onMoss" | "onSurface";
}) {
  const n = Math.max(stops.length, 2);
  const W = 560, H = 220;
  const pts = stops.map((_, i) => {
    const x = 20 + (i * (W - 40)) / (n - 1);
    const y = H - 40 - (i / (n - 1)) * (H - 90) + Math.sin(i * 1.7) * 26;
    return [x, y] as const;
  });
  const cur = Math.max(0, stops.findIndex((s) => s.state === "current"));
  const curve = (a: readonly number[], b: readonly number[]) => {
    const mx = (a[0] + b[0]) / 2;
    return `C${mx},${a[1]} ${mx},${b[1]} ${b[0]},${b[1]}`;
  };
  const donePath = pts.slice(0, cur + 1).map((p, i, arr) => (i ? curve(arr[i - 1], p) : `M${p[0]},${p[1]}`)).join(" ");
  const aheadPath = pts.slice(cur).map((p, i, arr) => (i ? curve(arr[i - 1], p) : `M${p[0]},${p[1]}`)).join(" ");
  const ink = tone === "onMoss" ? "var(--moss-ink)" : "var(--ink-3)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("w-full", className)} role="img"
      aria-label={`Trail: ${cur + 1} of ${stops.length} stops reached`}>
      <path d={aheadPath} fill="none" stroke={ink} strokeOpacity=".7" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      {cur > 0 ? <path d={donePath} fill="none" stroke="var(--sun)" strokeWidth="5" strokeLinecap="round"
        style={{ strokeDasharray: 2000, ["--len" as string]: 2000, animation: "draw 1.6s var(--ease) both" }} /> : null}
      {pts.map(([x, y], i) => {
        const s = stops[i];
        return (
          <g key={i}>
            {s.state === "ahead"
              ? <circle cx={x} cy={y} r="8" fill={tone === "onMoss" ? "var(--moss)" : "var(--surface)"} stroke={ink} strokeWidth="2.5" />
              : <circle cx={x} cy={y} r={s.state === "current" ? 12 : 9} fill="var(--sun)" />}
            {s.state === "current" ? (
              <g style={{ animation: "bob 2.4s ease-in-out infinite" }}>
                <line x1={x} y1={y - 10} x2={x} y2={y - 44} stroke="var(--sun)" strokeWidth="3" strokeLinecap="round" />
                <path d={`M${x},${y - 44} l26,7 l-26,8 Z`} fill="var(--sun)" />
              </g>
            ) : null}
          </g>
        );
      })}
      {/* Labels last, so later stops never paint over them; a halo in the ground colour keeps them legible over the path. */}
      {labels ? pts.map(([x, y], i) => {
        const s = stops[i];
        if (!s.label || !(i === 0 || s.state === "current" || i === stops.length - 1)) return null;
        return (
          <text key={`l${i}`} x={x} y={s.state === "current" ? y - 54 : y + 26} textAnchor={i === stops.length - 1 ? "end" : i === 0 ? "start" : "middle"}
            fill={tone === "onMoss" ? "var(--moss-ink)" : "var(--ink-2)"} stroke={tone === "onMoss" ? "var(--moss)" : "var(--surface)"} strokeWidth="5"
            strokeLinejoin="round" paintOrder="stroke" fontSize="13" fontWeight="600" fontFamily="var(--display)">
            {s.label}
          </text>
        );
      }) : null}
    </svg>
  );
}
