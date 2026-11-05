// דף בית שמעורר השראה (סעיף 4 בסקיל העיצוב). שלד קבוע, ותוכן ייחודי לכל אפליקציה.
// מקור: OMEK-GH (סונאר), MIVCHAN-GH (מאזניים), CHORIM-GH (מפת נולי), 06.11.2026.
// האובייקט החוויתי מגיע כ-children: SVG שבנוי מהנתונים האמיתיים של האפליקציה, לא איור.
// כללים: SVG ב-direction: ltr (תוויות עבריות נחתכות בתוך RTL), ריחוף מבליט ומעמעם, והמקרא מסונכרן עם האובייקט.
import Rich from './Rich';

/**
 * @param {{
 *   kicker: string,                       // שורת הקשר במונו: שם · מספרים
 *   title: import('react').ReactNode,     // שורת תובנה עם המספר המרכזי ומרקר אחד
 *   explain: string,                      // משפט הסבר, עם **מודגש**
 *   tones: { problem: string, solution: string, insight: string },
 *   cta: { label: string, onClick: () => void }[],   // הראשון הוא הפעולה העיקרית
 *   legend?: import('react').ReactNode,  // מקרא מסונכרן עם האובייקט
 *   hover?: import('react').ReactNode,   // חלונית ריחוף מעל האובייקט
 *   cards: { n: string, label: string, title: string, desc: string, value: string, onClick: () => void }[],
 *   quote: { text: string, source: string },   // ציטוט אמיתי ממקור, עם שם בעברית ובלועזית
 *   haiku: [string, string, string],
 *   city: string,                         // דוגמה מאשדוד או מהעיר
 *   inspiration: string,
 *   children: import('react').ReactNode,  // האובייקט החוויתי
 * }} p
 */
export default function Home(p) {
  return (
    <main className="app-main home">
      <section className="h-hero">
        <p className="h-kicker">{p.kicker}</p>
        <h1 className="h-title">{p.title}</h1>
        <p className="h-explain"><Rich>{p.explain}</Rich></p>
        <div className="h-tones">
          <p className="h-tone t-problem"><b>בעיה</b><span>{p.tones.problem}</span></p>
          <p className="h-tone t-solution"><b>פתרון</b><span>{p.tones.solution}</span></p>
          <p className="h-tone t-insight"><b>תובנה</b><span><mark className="insight">{p.tones.insight}</mark></span></p>
        </div>
        <div className="h-cta">
          {p.cta.map((c, i) => <button key={c.label} className={`btn press ${i === 0 ? 'go' : ''}`} onClick={c.onClick}>{c.label}</button>)}
        </div>
      </section>

      <section className="h-stage">
        {p.children}
        {p.hover && <div className="h-hover" dir="rtl">{p.hover}</div>}
        {p.legend && <div className="h-legend">{p.legend}</div>}
      </section>

      <nav className="h-cards" aria-label="מפת התוכן">
        {p.cards.map((c) => (
          <button key={c.n} className="h-card press" onClick={c.onClick}>
            <p className="label">{c.n} · {c.label}</p><strong>{c.title}</strong><span className="d">{c.desc}</span>
            <span className="num h-card-n">{c.value}</span>
          </button>
        ))}
      </nav>

      <section className="h-museum" aria-label="שכבת ידע">
        <figure className="h-quote"><span className="label">ציטוט</span><blockquote>"{p.quote.text}"</blockquote><figcaption className="src">{p.quote.source}</figcaption></figure>
        <div className="h-haiku"><span className="label">הייקו</span>{p.haiku.map((l) => <p key={l}>{l}</p>)}</div>
        <div className="h-city"><span className="label">דוגמה מהעיר</span><p><Rich>{p.city}</Rich></p></div>
      </section>
      <p className="h-foot">השראה: {p.inspiration}</p>
    </main>
  );
}
