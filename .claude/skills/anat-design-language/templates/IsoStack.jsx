import { useState } from "react";
import { fmt, pct } from "../lib/format.js";

// ערימת השכר בתלת־ממד: כל לוח הוא יעד של הכסף, והעובי שלו הוא החלק שלו מהברוטו.
// הטלה איזומטרית ב-SVG: שלוש פאות לכל לוח, נטען מהר ונראה זהה בכל דפדפן.
const S = 150, HMAX = 190, COS = Math.cos(Math.PI / 6), SIN = 0.5;
const iso = (x, y, z) => [(x - y) * COS, (x + y) * SIN - z];
const pts = (list) => list.map((p) => iso(...p).map((n) => n.toFixed(1)).join(",")).join(" ");
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return `rgb(${c.join(",")})`;
};

export default function SalaryStack3D({ segments, total, active, onActive }) {
  const [lift, setLift] = useState(0);
  const slabs = segments.reduce((acc, s) => {
    const prev = acc[acc.length - 1];
    const z = prev ? prev.z + prev.h + 6 : 0;
    return [...acc, { ...s, z, h: Math.max(8, (s.val / total) * HMAX) }];
  }, []);
  const top = slabs[slabs.length - 1];
  const height = top.z + top.h;

  return (
    <svg className="stack" viewBox={`${-S * COS - 10} ${-height - 40} ${2 * S * COS + 20} ${height + S + 60}`}
      role="img" aria-label={segments.map((s) => `${s.label} ${pct(s.val, total)}%`).join(", ")}
      onPointerEnter={() => setLift(1)} onPointerLeave={() => { setLift(0); onActive(null); }}>
      <polygon points={pts([[0, 0, 0], [S, 0, 0], [S, S, 0], [0, S, 0]])} fill="rgba(26,26,24,.08)" transform="translate(0 14)" />
      {slabs.map((s, i) => {
        const z = s.z + lift * i * 10;
        const on = active === s.key, dim = active && !on;
        return (
          <g key={s.key} className="slab" style={{ "--i": i, opacity: dim ? 0.3 : 1, transform: `translateY(${on ? -14 : 0}px)` }}
            onPointerEnter={() => onActive(s.key)}>
            <polygon points={pts([[S, 0, z], [S, S, z], [S, S, z + s.h], [S, 0, z + s.h]])} fill={shade(s.hex, 0.72)} />
            <polygon points={pts([[0, S, z], [S, S, z], [S, S, z + s.h], [0, S, z + s.h]])} fill={shade(s.hex, 0.86)} />
            <polygon points={pts([[0, 0, z + s.h], [S, 0, z + s.h], [S, S, z + s.h], [0, S, z + s.h]])} fill={s.hex} />
            {on && (
              <text x={iso(S, S, z + s.h / 2)[0] + 14} y={iso(S, S, z + s.h / 2)[1] + 5} className="stack-tip">{fmt(s.val)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function StackLegend({ segments, total, active, onActive }) {
  return (
    <ul className="stack-legend">
      {segments.map((s) => (
        <li key={s.key}>
          <button className={`press legend-row${active === s.key ? " is-on-soft" : ""}`}
            onPointerEnter={() => onActive(s.key)} onPointerLeave={() => onActive(null)}
            onFocus={() => onActive(s.key)} onBlur={() => onActive(null)}>
            <span className="swatch" style={{ background: s.color }} />
            <span className="legend-label">{s.label}</span>
            <span className="num">{fmt(s.val)}</span>
            <span className="num legend-pct">{pct(s.val, total)}%</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
