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
    case "ai": {
      // A small neural network: three layers of nodes, every node linked to the next layer.
      const layers = [3, 5, 4].map((n, li) => Array.from({ length: n }, (_, i) => ({ x: 60 + li * 80 + r() * 8, y: 66 + (i - (n - 1) / 2) * 24 })));
      return (<g>{layers.slice(0, -1).flatMap((layer, li) => layer.flatMap((a, i) => layers[li + 1].map((b, j) => (
        <line key={`${li}-${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeOpacity={0.15 + r() * 0.3} strokeWidth="1.4" />))))}
        {layers.flat().map((n, i) => <circle key={i} cx={n.x} cy={n.y} r="6" fill={color} opacity={0.55 + r() * 0.4} />)}</g>);
    }
    case "cs":
      // Lines of code: indented bars of varying length.
      return (<g>{Array.from({ length: 8 }, (_, i) => {
        const indent = [0, 1, 1, 2, 2, 1, 0, 1][i] * 18, w = 50 + r() * 140;
        return (<g key={i}><rect x={20 + indent} y={10 + i * 15} width={w} height="7" rx="3.5" fill={color} opacity={0.25 + r() * 0.45} />
          {r() > 0.55 ? <rect x={28 + indent + w} y={10 + i * 15} width={20 + r() * 40} height="7" rx="3.5" fill={color} opacity=".2" /> : null}</g>);
      })}</g>);
    case "eng":
      // Blueprint: a fine grid with a few bolted plates.
      return (<g>{Array.from({ length: 15 }, (_, i) => <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="132" stroke={color} strokeOpacity=".18" />)}
        {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 20} x2="280" y2={i * 20} stroke={color} strokeOpacity=".18" />)}
        {Array.from({ length: 3 }, (_, i) => {
          const x = 30 + i * 85 + r() * 10, y = 26 + r() * 40;
          return (<g key={`p${i}`}><rect x={x} y={y} width="60" height="44" rx="4" fill="none" stroke={color} strokeWidth="2" opacity=".75" />
            {[[x + 7, y + 7], [x + 53, y + 7], [x + 7, y + 37], [x + 53, y + 37]].map(([cx, cy], j) => <circle key={j} cx={cx} cy={cy} r="2.6" fill={color} />)}</g>);
        })}</g>);
    case "math":
      // Plotted curves on axes.
      return (<g fill="none" stroke={color} strokeLinecap="round">
        <line x1="20" y1="66" x2="270" y2="66" strokeOpacity=".35" strokeWidth="1.4" /><line x1="40" y1="10" x2="40" y2="122" strokeOpacity=".35" strokeWidth="1.4" />
        {[0, 1, 2].map((k) => {
          const amp = 18 + r() * 26, f = 0.025 + k * 0.012, ph = r() * 6;
          const d = Array.from({ length: 49 }, (_, i) => { const x = 40 + i * 5; return `${i ? "L" : "M"}${x},${66 - amp * Math.sin(x * f + ph)}`; }).join("");
          return <path key={k} d={d} strokeWidth={2.4 - k * 0.5} opacity={0.9 - k * 0.25} />;
        })}</g>);
    default:
      return (<g fill="none" stroke={color} strokeWidth="1.4" opacity=".6">{Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M0,${20 + i * 16} C 70,${4 + i * 16 + r() * 20} 200,${36 + i * 16 - r() * 20} 280,${20 + i * 16}`} />))}</g>);
  }
}
