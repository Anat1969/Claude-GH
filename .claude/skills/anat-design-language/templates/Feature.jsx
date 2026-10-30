import Rich from "./Rich.jsx";
import "./feature.css";

// כתבה מוזיאלית: ריכוז ידע שמשלב תמונה וטקסט. פירוט בסעיף 7 בסקיל העיצוב.
// כל הטקסטים נכתבים בכתיב Rich: **מודגש**, ==תובנה==.
//
// item = {
//   kind: "כתבה" | "מאמר" | "פוסט",
//   kicker: "שורת נושא קטנה",
//   title: "כותרת ראשית", deck: "כותרת משנה",
//   hero: { src, alt, caption, credit, year, layout: "full" | "split" | "strip" | "collage", images? },
//   body: ["פסקה", ...],          // הראשונה מקבלת אות פתיחה
//   quote: { text, by, work, year, source },
//   insight: "תובנה במשפט אחד",
//   haiku: { lines: ["...", "...", "..."], note: "מה ההייקו מאיר" },
//   links: [{ rule, insight, action, to }],   // חיבורים: כלל, תובנה, יישום
//   post: "פוסט של 80 עד 150 מילים",
//   sources: [{ label, href }],
// }

function Hero({ hero, title, deck, kicker }) {
  const head = (
    <header className="ft-head">
      {kicker && <div className="ft-kicker">{kicker}</div>}
      <Rich as="h1" className="ft-title">{title}</Rich>
      {deck && <Rich as="p" className="ft-deck">{deck}</Rich>}
    </header>
  );
  const caption = hero && (
    <figcaption className="ft-caption">{hero.caption}{hero.credit && <span> · {hero.credit}{hero.year ? `, ${hero.year}` : ""}</span>}</figcaption>
  );
  if (!hero) return head;
  if (hero.layout === "collage") {
    return (<>{head}<figure className="ft-collage">{hero.images.map((im, i) => <img key={i} src={im.src} alt={im.alt} loading="lazy" />)}{caption}</figure></>);
  }
  if (hero.layout === "split") {
    return (<div className="ft-split"><figure><img src={hero.src} alt={hero.alt} />{caption}</figure>{head}</div>);
  }
  if (hero.layout === "strip") {
    return (<>{head}<figure className="ft-strip"><img src={hero.src} alt={hero.alt} />{caption}</figure></>);
  }
  return (
    <figure className="ft-full">
      <img src={hero.src} alt={hero.alt} />
      <div className="ft-full-shade">{head}</div>
      {caption}
    </figure>
  );
}

export default function Feature({ item }) {
  const { kind, body = [], quote, insight, haiku, links = [], post, sources = [] } = item;
  return (
    <article className={`ft ft-${kind === "פוסט" ? "post" : kind === "מאמר" ? "essay" : "story"}`} dir="rtl">
      <Hero {...item} />
      <div className="ft-col">
        {body.map((p, i) => <Rich key={i} as="p" className={i === 0 ? "ft-p ft-drop" : "ft-p"}>{p}</Rich>)}

        {quote && (
          <blockquote className="ft-quote">
            <p>{quote.text}</p>
            <cite>{quote.by}, <i>{quote.work}</i>{quote.year ? `, ${quote.year}` : ""}</cite>
          </blockquote>
        )}

        {insight && <aside className="ft-insight"><span className="label">תובנה</span><Rich as="p">{`==${insight}==`}</Rich></aside>}

        {haiku && (
          <aside className="ft-haiku" aria-label="הייקו">
            {haiku.lines.map((l, i) => <span key={i}>{l}</span>)}
            {haiku.note && <small>{haiku.note}</small>}
          </aside>
        )}

        {links.length > 0 && (
          <section className="ft-links" aria-label="חיבורים">
            <h2 className="label">חיבורים</h2>
            {links.map((l, i) => (
              <a key={i} className="press ft-link" href={l.to}>
                <span className="ft-link-rule"><b>הכלל:</b> {l.rule}</span>
                <Rich className="ft-link-insight">{`==${l.insight}==`}</Rich>
                <span className="ft-link-action"><b>מה עושים:</b> {l.action}</span>
              </a>
            ))}
          </section>
        )}

        {post && (
          <section className="ft-post" aria-label="פוסט">
            <h2 className="label">פוסט</h2>
            <Rich as="p">{post}</Rich>
          </section>
        )}

        {sources.length > 0 && (
          <footer className="ft-sources">
            <h2 className="label">מקורות</h2>
            <ol>{sources.map((s, i) => <li key={i}><a href={s.href}>{s.label}</a></li>)}</ol>
          </footer>
        )}
      </div>
    </article>
  );
}
