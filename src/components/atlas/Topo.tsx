import { seeded } from "@/lib/fields";

/**
 * Topographic contour lines, generated from a seed. Decorative only.
 * Each "hill" is a set of nested, smooth closed curves: radius varies with a few low-frequency sines,
 * and the curve is drawn through its points with Catmull-Rom → cubic Bézier for a hand-drawn feel.
 */
export function Topo({ seed = "atlas", className, stroke = "currentColor", opacity = 0.18, rings = 9, centers = 3 }: {
  seed?: string; className?: string; stroke?: string; opacity?: number; rings?: number; centers?: number;
}) {
  const rnd = seeded(seed);
  const paths: string[] = [];
  for (let c = 0; c < centers; c++) {
    const cx = 8 + rnd() * 84, cy = 8 + rnd() * 84;
    const harmonics = [2, 3, 5].map((k) => ({ k, amp: 0.06 + rnd() * 0.12, phase: rnd() * Math.PI * 2 }));
    const stretch = 1.1 + rnd() * 0.7, tilt = rnd() * Math.PI;
    const step = 3.2 + rnd() * 2.4;
    for (let r = 1; r <= rings; r++) {
      const base = r * step;
      const drift = r * 0.04; // outer rings loosen slightly
      const pts: [number, number][] = [];
      const n = 28;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        let m = 1;
        for (const h of harmonics) m += h.amp * (1 + drift) * Math.sin(h.k * a + h.phase + r * 0.15);
        const x = Math.cos(a) * base * m * stretch, y = Math.sin(a) * base * m;
        pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
      }
      paths.push(smoothClosed(pts));
    }
  }
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke={stroke} strokeOpacity={opacity} strokeWidth="1" vectorEffect="non-scaling-stroke">
        {paths.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" />)}
      </g>
    </svg>
  );
}

function smoothClosed(p: [number, number][]) {
  const n = p.length;
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + "Z";
}
