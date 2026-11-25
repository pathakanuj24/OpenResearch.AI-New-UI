import { fieldKey, fieldVar, FIELD_LABEL, seeded, type FieldKey } from "@/lib/fields";
import { cn } from "@/lib/utils";

/** Generated paper cover: field hue + field-specific pattern, seeded by the paper id. */
export function FieldCover({ field, seed, className, label = true, height = 132 }: {
  field?: string | null; seed: string; className?: string; label?: boolean; height?: number;
}) {
  const k = fieldKey(field);
  const color = fieldVar(k);
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ height, background: `color-mix(in srgb, ${color} 12%, var(--surface))` }}>
      <svg viewBox="0 0 280 132" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <Pattern k={k} seed={seed} color={color} />
      </svg>
      {label ? (
        <span className="absolute left-3 top-3 rounded-pill bg-surface px-2.5 py-1 text-xs font-semibold text-ink shadow-1">
          {field || FIELD_LABEL[k]}
        </span>
      ) : null}
    </div>
  );
}

function Pattern({ k, seed, color }: { k: FieldKey; seed: string; color: string }) {
  const r = seeded(seed + k);
  switch (k) {
    case "econ": {
      const bars = Array.from({ length: 11 }, (_, i) => ({ x: 12 + i * 25, h: 40 + r() * 60 }));
      const line = bars.map((b, i) => `${i ? "L" : "M"}${b.x + 5},${132 - b.h - 18 + r() * 8}`).join("");
      return (<g>{bars.map((b, i) => <rect key={i} x={b.x} y={132 - b.h} width="10" height={b.h} rx="2" fill={color} opacity={0.18 + (i % 3) * 0.08} />)}
        <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>);
    }
    case "bio":
      return (<g>{Array.from({ length: 19 }, (_, i) => {
        const x = 8 + i * 15, a = Math.sin(i * 0.7 + r() * 0.3) * 34;
        return (<g key={i}><line x1={x} y1={66 - a} x2={x} y2={66 + a} stroke={color} strokeOpacity=".35" strokeWidth="1.5" />
          <circle cx={x} cy={66 - a} r="4.5" fill={color} /><circle cx={x} cy={66 + a} r="4.5" fill={color} opacity=".55" /></g>);
      })}</g>);
    case "earth": {
      const cx = 40 + r() * 80, cy = 30 + r() * 40;
      return (<g fill="none" stroke={color} strokeWidth="1.6">{Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx={cx + i * 2} cy={cy} rx={10 + i * 11} ry={7 + i * 8} transform={`rotate(${-10 + r() * 20} ${cx} ${cy})`} opacity={0.9 - i * 0.07} />))}</g>);
    }
    case "hist":
      return (<g>{Array.from({ length: 6 }, (_, i) => {
        const x = i * 50 - 6;
        return <path key={i} d={`M${x},132 L${x},58 A21,21 0 0 1 ${x + 42},58 L${x + 42},132 Z`} fill={color} opacity={i % 2 ? 0.42 : 0.24} />;
      })}<rect x="0" y="48" width="280" height="6" fill={color} opacity=".5" /></g>);
    case "phys":
      return (<g fill="none" stroke={color} strokeWidth="1.6">{Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx="150" cy="66" rx={26 + i * 30} ry={11 + i * 13} transform="rotate(-8 150 66)" opacity={0.95 - i * 0.15} />))}
        <circle cx="150" cy="66" r="9" fill={color} stroke="none" /></g>);
    case "law":
      return (<g>{Array.from({ length: 5 }, (_, row) => Array.from({ length: 12 }, (_, col) => {
        const v = r();
        return v > 0.5
          ? <rect key={`${row}-${col}`} x={10 + col * 24} y={8 + row * 25} width="13" height="13" rx="3" fill={color} opacity={0.3 + v * 0.5} />
          : <circle key={`${row}-${col}`} cx={16 + col * 24} cy={14 + row * 25} r="6" fill={color} opacity={0.2 + v * 0.4} />;
      }))}</g>);
    case "psy": {
      const cx = 60 + r() * 120;
      return (<g fill="none" stroke={color} strokeWidth="1.6">{Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={cx} cy="66" r={8 + i * 13} opacity={1 - i * 0.1} />))}</g>);
    }
    default:
      return (<g fill="none" stroke={color} strokeWidth="1.4" opacity=".6">{Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M0,${20 + i * 16} C 70,${4 + i * 16 + r() * 20} 200,${36 + i * 16 - r() * 20} 280,${20 + i * 16}`} />))}</g>);
  }
}
