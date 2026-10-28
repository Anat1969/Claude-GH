import { fmt } from "../lib/format.js";

// מסלול הכסף, בהשראת מפת הזרימה של מינאר (Charles Joseph Minard, 1869):
// פס אחד ברוחב הברוטו זורם מימין (החוזה) לשמאל (הבנק), וכל ניכוי מסתעף ממנו למטה.
const VW = 900, Y0 = 40, H = 150, DROP = 110;

export default function FlowRibbon({ gross, branches, net }) {
  const scale = H / gross;
  const x0 = VW - 60, xEnd = 70;
  const step = (x0 - xEnd) / (branches.length + 1);
  let thick = gross * scale;
  const parts = [];
  branches.forEach((b, i) => {
    const xs = x0 - step * (i + 1);
    const t = b.val * scale;
    parts.push({ ...b, xs, xPrev: xs + step, thick, t });
    thick -= t;
  });
  const netThick = thick;

  return (
    <svg className="ribbon" viewBox={`0 0 ${VW} ${Y0 + H + DROP + 50}`} role="img"
      aria-label={`ברוטו ${fmt(gross)} זורם לבנק: ${branches.map((b) => `${b.label} ${fmt(b.val)}`).join(", ")}, נטו ${fmt(net)}`}>
      {parts.map((p, i) => (
        <g key={p.key} className="ribbon-step" style={{ "--i": i }}>
          <rect x={p.xs} y={Y0} width={p.xPrev - p.xs} height={p.thick} fill="var(--bank)" opacity={0.18 + 0.12 * i} />
          {/* הסתעפות: קשת שיורדת מהקצה התחתון של הפס */}
          <path className="branch" fill="none" stroke={p.color} strokeWidth={p.t}
            d={`M ${p.xs + 20} ${Y0 + p.thick - p.t / 2} C ${p.xs - 25} ${Y0 + p.thick - p.t / 2}, ${p.xs - 25} ${Y0 + p.thick + 20}, ${p.xs - 25} ${Y0 + H + DROP - 30}`} />
          <text x={p.xs - 25} y={Y0 + H + DROP - 8} textAnchor="middle" className="ribbon-label">{p.label}</text>
          <text x={p.xs - 25} y={Y0 + H + DROP + 12} textAnchor="middle" className="ribbon-num">{fmt(p.val)}</text>
        </g>
      ))}
      <rect className="ribbon-net" x={xEnd} y={Y0} width={parts[parts.length - 1].xs - xEnd} height={netThick} fill="var(--bank)" />
      <text x={x0 + 50} y={Y0 - 12} textAnchor="end" className="ribbon-label">ברוטו</text>
      <text x={x0 - 6} y={Y0 - 12} textAnchor="end" className="ribbon-num">{fmt(gross)}</text>
      <text x={xEnd} y={Y0 - 12} textAnchor="start" className="ribbon-num">{fmt(net)}</text>
      <text x={xEnd + 70} y={Y0 - 12} textAnchor="start" className="ribbon-label strong">נטו לבנק</text>
    </svg>
  );
}
