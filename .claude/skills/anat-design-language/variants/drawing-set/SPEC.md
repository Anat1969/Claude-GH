# שפת העיצוב "גיליון שרטוט"

אפיון לצירוף לאפליקציה אחרת. המקור: אפליקציית **קשר** (https://kesher-gh.vercel.app), נובמבר 2026.
הקובץ מעביר **רק את השפה העיצובית**. התוכן, המבנה והלוגיקה של האפליקציה המקבלת נשארים שלה.

---

## 0. איך משתמשים בקובץ

1. מצרפים את הקובץ לריפו של האפליקציה האחרת, למשל `docs/design-language.md`.
2. מדביקים בשיחת הבנייה (Claude Code או Lovable) את הנוסח הזה:

```
אמץ באפליקציה הזו את שפת העיצוב שבקובץ docs/design-language.md, ורק אותה.
אל תשנה תוכן, מבנה נתונים, מסלולים או לוגיקה.
סדר עבודה: (1) העתק את האסימונים והרכיבים מנספח א' ל-src/index.css ומנספח ב' ל-tailwind.config.
(2) מפה את הקטגוריות של התוכן שלי ל-content-1 עד content-5 לפי סעיף 3.3, ותן להן שמות.
(3) החלף כפתורים, כותרות, תוויות, משטחים וטיפוגרפיה לפי סעיפים 4 עד 6.
(4) אם יש באפליקציה אייקונים או אמוג'י, החלף אותם בציורי קו לפי סעיף 7.
(5) עבור על רשימת האימוץ בסעיף 11, צלם בטלפון ובמחשב, בבהיר ובכהה, ותקן עד שהכול מסומן.
```

---

## 1. המהות בחמש שורות

- **מטאפורה:** גיליון שרטוט של אדריכל. נייר, דיו, קווי שיער, ורשת שרטוט חיוורת ברקע.
- **חומר:** נייר ודיו. צל רך אחד. בלי זכוכית, בלי זוהר, בלי תלת־ממד של צעצוע.
- **צבע:** הכלי שחור, לבן ואפור בלבד. **צבע שייך רק לתוכן**, בגוונים עמומים כמו דיו.
- **טיפוגרפיה:** IBM Plex Sans Hebrew דקה (100 עד 300) לכותרות ולגוף, ו-IBM Plex Mono לתוויות ולמספרים.
- **תנועה:** שקטה ומהירה. עד **200** מילישניות בכל פעולה, ורגע מתוזמר אחד בלבד לגילוי החשוב באפליקציה.

הרעיון: **הכלי נסוג, והתוכן בולט.** הניגוד בין כלי אפור לתוכן צבעוני הוא הנקודה.

---

## 2. שתי שכבות

| שכבה | מה בה | באפליקציה המקבלת |
|---|---|---|
| **קבועה** | אסימוני האפור, נייר ורשת, טיפוגרפיה, כפתורים מרובעים, תוויות מונו, מרקר, צל אחד, קצב התנועה, RTL | עוברת כמו שהיא, בלי שינוי |
| **מותאמת** | צבעי התוכן (content-1 עד content-5), הזהב של הציורים, נושאי הציורים, הרגע המתוזמר | נבחרת לפי התוכן של האפליקציה, בכללים של סעיף 3.3 ו-7 |

---

## 3. צבע

### 3.1 הכלי: אפור בלבד (רוויה 0)
רקע, משטחים, טקסט, כפתורים, גבולות, טיימרים, פסי התקדמות ודיאלוגים, כולם באפור.
כל הערכים הם אסימונים ב-`:root` (בהיר) וב-`.dark` (כהה). **אף פעם לא צבע קשיח בקוד.**

| אסימון | בהיר | כהה | תפקיד |
|---|---|---|---|
| `--background` | 0 0% 96% | 0 0% 6% | נייר |
| `--foreground` | 0 0% 8% | 0 0% 92% | דיו |
| `--surface-1` | 0 0% 99.5% | 0 0% 9% | גיליון מונח על השולחן |
| `--surface-2` | 0 0% 97.5% | 0 0% 8% | רקע כפתור משני |
| `--surface-3` | 0 0% 93% | 0 0% 12% | שדה שקוע, ריחוף |
| `--muted-foreground` | 0 0% 38% | 0 0% 62% | טקסט משני, תוויות |
| `--border` | 0 0% 84% | 0 0% 20% | קו שיער |
| `--primary` | 0 0% 8% | 0 0% 92% | כפתור ראשי (דיו מלא) |

### 3.2 שני צבעים קבועים שאינם של הכלי
- **מרקר צהוב** (`--marker`): מסמן תובנה ומילות מפתח בטקסט. בהיר: 52 100% 62% בשקיפות 0.55. כהה: 48 95% 52% בשקיפות 0.32.
- **זהב** (`--gold`): צבע ציורי הקו של התוכן. בהיר: 40 62% 42%. כהה: 42 64% 62%.

### 3.3 צבעי התוכן: מתכון להתאמה
בקשר אלה ארבע דרגות הקשר ועוד צבע לשרשרת. באפליקציה אחרת הם הקטגוריות שלה: עד **5** צבעים.
- **רוויה נמוכה:** בין **24%** ל-**58%**. שום צבע רווי, שום ניאון.
- **בהירות:** בבהיר בין **32%** ל-**45%**. בכהה בין **58%** ל-**72%**, אותו גוון, בהיר יותר.
- **גוונים רחוקים זה מזה** על גלגל הצבעים, כדי שאפשר יהיה להבחין ביניהם.
- **הקטגוריה החשובה ביותר** (בקשר: "סוד") מקבלת את הגוון הקרוב לזהב.
- **שם לכל אסימון** לפי משמעותו באפליקציה, למשל `--content-1` ← `--topic-water`.

הערכים בקשר, כדוגמה ונקודת מוצא:

| אסימון | בהיר | כהה | בקשר |
|---|---|---|---|
| `--content-1` | 214 38% 40% | 212 42% 68% | פשט, כחול דיו |
| `--content-2` | 268 24% 45% | 268 28% 72% | רמז, סגול אפרפר |
| `--content-3` | 16 45% 43% | 18 50% 64% | דרש, חמרה |
| `--content-4` | 36 58% 35% | 40 52% 60% | סוד, זהב כהה |
| `--content-5` | 152 26% 32% | 152 26% 58% | שרשרת, ירוק עמוק |

**כלל:** צבע תוכן מופיע רק על תוכן: קו בין פריטים, שם של קטגוריה, נקודה במקרא, פס עומק. לא על כפתור, לא על רקע ולא על כותרת.

---

## 4. טיפוגרפיה

גופנים (Google Fonts):
```
https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Hebrew:wght@100;200;300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap
```

| תפקיד | גודל | משקל | הערה |
|---|---|---|---|
| כותרת דף הבית | 5.5rem בטלפון, 8rem במחשב | 100 | צמוד, `leading-[0.85]` |
| כותרת דף | `text-5xl` עד `text-7xl` | 100 | `leading-[0.95]` |
| כותרת קטע | `text-3xl` | 200 | מעליה תווית מונו ממוספרת |
| פסקת פתיחה | `text-xl` | 300 | `text-foreground/80` |
| גוף | 0.95rem עד 1.08rem | 300 | שורות מרווחות, `leading-relaxed` |
| בולד | | 500 | `strong, b { font-weight: 500 }` |
| תווית (`.label-mono`) | 0.6875rem | 400 | מונו, ריווח 0.04em, אפור |
| מספר תצוגה (`.display-num`) | 2.1rem עד 10rem | 200 | ספרות טבלאיות, צמוד |
| מספר בתוך טקסט (`.num-mono`) | | | מונו, ספרות טבלאיות, `dir="ltr"` |

- **תבנית כותרת קטע:** תווית מונו `01 · שם הקטע`, מתחתיה הכותרת, ומעליהן קו דיו (`border-t border-foreground/80 pt-5`).
- **מספרים** תמיד במונו, ותמיד `dir="ltr"` בתוך טקסט עברי.
- **מקור לטענה:** קטן ואפור, אחרי נקודה אמצעית: "שם · מקור, שנה".

---

## 5. משטחים, קווים וצל

- **רקע הדף:** נייר עם רשת שרטוט חיוורת של 64 פיקסלים (`--grid-line`), קבועה בגלילה.
- **פינות:** `--radius: 0`. הכול מרובע.
- **`.panel`:** גיליון מונח: `surface-1`, קו שיער, וצל רך אחד (`--shadow-md`).
- **`.panel-flat`:** אותו גיליון בלי צל.
- **`.well`:** שדה שקוע: `surface-3` בשקיפות 0.6 וצל פנימי דק. למשטח עבודה, ללוח ולפסים.
- **`.rule`:** קו שיער אופקי.
- **צל:** רק אחד בכל רכיב. בלי שכבות צל צבעוניות ובלי זוהר.
- **מסגרת עבה** (`border-foreground/70` עד `/80`) רק לגבולות מבניים: קו מעל כותרת קטע, מסגרת גיליון, משבצת כותרת.

---

## 6. רכיבים

### 6.1 כפתורים (`.btn`)
מרובעים, **בלי קו מסגרת גלוי**. הכפתור נקרא ככפתור מהרקע, מהריווח ומהצל.
- `.btn-primary`: דיו מלא (`--primary`), טקסט נייר, צל רך מתחת. לפעולה הראשית בלבד.
- `.btn-ghost`: רקע `surface-2` וצל עדין. לכל השאר.
- `.btn-text`: טקסט אפור בלבד, לפעולה משנית מאוד.
- **ריחוף:** הצל מתעמק. **לחיצה:** `scale(0.97)` ב-160 מילישניות.
- **גבהים:** 40 עד 48 פיקסלים (`h-10` עד `h-12`). פעולה ראשית תמיד גדולה, לא קישור קטן.
- **קבוצת כפתורים** (בורר, לשוניות): גריד של עמודות שוות, הנבחר `btn-primary` והשאר `btn-ghost`.

### 6.2 מרקר (`.hl` ורכיב `Rich`)
התובנה ומילות המפתח בכל טקסט מסומנות במרקר צהוב, כדי ש**הטקסט נקרא בעין ולא בראש**.
- בנתונים כותבים `**מילה**`, ורכיב `Rich` (נספח ג') מציג אותה כמרקר.
- ב-JSX: `<mark className="hl">`.
- **אחת עד שתיים** הדגשות במשפט. לא משפט שלם.

### 6.3 קישור שנמתח (`.link-draw`)
קישור טקסט בתווית מונו, שקו התחתון שלו נמתח מימין לשמאל בריחוף.

### 6.4 סרגל עליון
- קבוע בראש כל דף, רקע `background` בשקיפות 0.86 עם טשטוש, וקו שיער מתחת.
- מימין: לוגו קטן, שם האפליקציה בגופן דק, ולידו שם לועזי בתווית מונו. כל אלה מקשרים לדף הבית.
- במרכז: ניווט תוכן. **הדף הנוכחי מסומן תמיד:** משקל 500, פס דיו של 2 פיקסלים מתחת, ורקע `surface-3` במחשב.
- משמאל: כפתור הלוגו האחד `<ai-menu>`, שמחזיק את כל ההעדפות והכלים.
- בטלפון: הניווט בשורה שנייה, שנגללת לצד בלי פס גלילה.

### 6.5 שורת נתונים
`<dl>` של שלושה ערכים, עם קווי הפרדה אנכיים (`border-r`). תווית מונו מעל, ומספר תצוגה דק מתחת.

### 6.6 גיליון A4 (כתבה, דוח, הדפסה)
מסגרת קו דיו, כותרת עליונה עם תווית מונו "נושא · גיליון 01", ומשבצת כותרת בפינה כמו בתוכנית אדריכלית: כתבה, נושא, גיליון 03/06.
יחס **210:297** במחשב, וגובה טבעי בטלפון.

---

## 7. ציורי קו (במקום אייקונים ואמוג'י)

**בשפה הזו אין אמוג'י ואין אייקונים מוכנים.** כל דימוי של תוכן הוא ציור קו אחד, בשפת השרטוט.
- **רשת:** `viewBox="0 0 32 32"`, ציור בתוך התחום 4 עד 28.
- **קו:** עובי אחיד, 1.55 בזהב, 1.25 בדיו. קצוות וחיבורים מעוגלים. בלי מילוי, חוץ מנקודות קטנות (עיניים).
- **כתם:** מאחורי כל ציור, כתם זהב רך ולא סדיר בשקיפות 0.13, מסובב בזווית אחרת לכל פריט (`(i * 47) % 360`).
- **יד חופשית:** פילטר `#hand-drawn` (`feTurbulence` ו-`feDisplacementMap` בעוצמה 1.3) נותן לקו רעד קל של ציור ביד.
- **שני גוונים:** `gold` לתוכן (ברירת מחדל), `ink` לשימוש בתוך טקסט או במצב כבוי.
- **ציור חדש:** צורה אחת שמזוהה במבט, 2 עד 6 קווים. בודקים אותו בגודל 24 פיקסלים: אם לא מזהים אותו, מפשטים.

הרכיב המלא בנספח ד'. את מערך הציורים (`D`) ונקודות הפירוט (`DOTS`) כל אפליקציה מציירת לתוכן שלה.

---

## 8. תנועה

| מה | זמן | איך |
|---|---|---|
| כל פעולה חוזרת (מעבר, הופעה, רמז) | עד **200ms** | `ease: [0.23, 1, 0.32, 1]`, רק `opacity` ו-`transform` |
| לחיצה על כפתור | 160ms | `scale(0.97)` |
| קו שנמתח | 280ms | `pathLength` מ-0 ל-1 |
| פריטים שנכנסים יחד | **60ms** בין פריט לפריט | לפי הסדר, אף פעם לא כולם בבת אחת |
| **הרגע האחד** (הגילוי החשוב באפליקציה) | עד **400ms** | כתם זהב, חותם שמתיישב, קו זהב מימין לשמאל |
| פס התקדמות | | `scaleX`, לא `width` |

- **בלי** קפיצות קפיציות, בלי הבהובים, בלי זוהר.
- `prefers-reduced-motion` מבטל את כל התנועה (נספח א').
- **מקום ריק לא קופץ:** כשתוכן מתחלף, המסגרת נשארת במקומה ורק התוכן מתחלף.

---

## 9. פריסה

- **RTL מלא.** `dir="rtl"` על השורש. מספרים ואנגלית בתוך `dir="ltr"`.
- **קודם טלפון.** אין גלילה אופקית: `html, body { overflow-x: clip }`, ובכל גריד עם טקסט ארוך `grid-cols-[minmax(0,1fr)]`.
- **רוחב תוכן:** 860 עד 1080 פיקסלים, ושוליים של 16 עד 20 פיקסלים בצדדים.
- **ריווח:** קצב 4, 8, 16, 24, 32. בין קטעים: 48 עד 64.
- **מסכי מגע:** כפתור לפחות 40 פיקסלים גובה.
- **בהיר וכהה:** שני מצבים מלאים, ובחירה בין בהיר, כהה ומערכת. כל רכיב נבדק בשניהם.

---

## 10. כתיבה בתוך השפה

- **תובנה קודם**, הסבר אחר כך, משפט נימוק אחד קצר.
- **כל משפט בשורה חדשה** בגוף של כתבות ודוחות.
- מרקר על התובנה ועל מילות המפתח (סעיף 6.2).
- תוויות מונו קצרות: "01 · קטע", "גיליון 03", "נשמר במכשיר".
- **בלי אמוג'י, בלי סימני קריאה, בלי אייקונים.**

---

## 11. רשימת אימוץ (לסמן הכול לפני מסירה)

- [ ] האסימונים מנספח א' ב-`index.css`, ואין צבע קשיח ברכיבים.
- [ ] הכלי אפור בלבד. צבע מופיע רק על תוכן, ממופה ל-content-1 עד content-5 עם שמות.
- [ ] הגופנים IBM Plex Sans Hebrew ו-IBM Plex Mono נטענים. כותרות במשקל 100 עד 200, גוף 300.
- [ ] כל הכפתורים `.btn` מרובעים, בלי מסגרת גלויה, עם לחיצה של 0.97.
- [ ] תוויות במונו, מספרים במונו ו-`dir="ltr"`.
- [ ] מרקר על תובנות דרך `Rich` או `.hl`.
- [ ] אין אמוג'י ואין אייקונים מוכנים. ציורי קו לפי סעיף 7.
- [ ] סרגל עליון קבוע, הדף הנוכחי מסומן, וכפתור לוגו אחד.
- [ ] כל תנועה עד 200 מילישניות, ורגע אחד מתוזמר לכל היותר.
- [ ] בדיקה בעין: טלפון ומחשב, בהיר וכהה, בלי גלילה אופקית.

---

## נספח א': `index.css` (אסימונים ורכיבים)

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Hebrew:wght@100;200;300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/*
 * שפת העיצוב 'גיליון שרטוט' (מקור: אפליקציית קשר).
 * The tool is neutral greys only: paper, ink, hairlines, one soft shadow. Nothing bounces or glows.
 * Colour belongs to the content only, in muted inks. No emoji anywhere in the interface.
 */
@layer base {
  :root {
    --bar-h: 6rem;

    /* Tool: paper and ink (light) */
    --background: 0 0% 96%;
    --foreground: 0 0% 8%;
    --surface-1: 0 0% 99.5%;
    --surface-2: 0 0% 97.5%;
    --surface-3: 0 0% 93%;

    --card: 0 0% 99.5%;
    --card-foreground: 0 0% 8%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 8%;
    --primary: 0 0% 8%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 93%;
    --secondary-foreground: 0 0% 8%;
    --muted: 0 0% 92%;
    --muted-foreground: 0 0% 38%;
    --accent: 0 0% 93%;
    --accent-foreground: 0 0% 8%;
    --destructive: 0 0% 8%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 84%;
    --hairline: 0 0% 0% / 0.1;
    --input: 0 0% 84%;
    --ring: 0 0% 15%;
    --radius: 0px;

    --shade: 0 0% 0%;
    --shadow-sm: 0 1px 2px hsl(0 0% 0% / 0.04);
    --shadow-md: 0 1px 2px hsl(0 0% 0% / 0.04), 0 10px 30px -18px hsl(0 0% 0% / 0.2);
    --shadow-lg: 0 2px 4px hsl(0 0% 0% / 0.04), 0 30px 60px -32px hsl(0 0% 0% / 0.28);
    --grid-line: 0 0% 0% / 0.035;

    /* Content: the app's own categories as muted inks (rename and re-hue per app) */
    --content-1: 214 38% 40%;
    --content-2: 268 24% 45%;
    --content-3: 16 45% 43%;
    --content-4: 36 58% 35%;
    --content-5: 152 26% 32%;

    /* Content imagery and the reading marker */
    --gold: 40 62% 42%;
    --marker: 52 100% 62%;
    --marker-alpha: 0.55;
  }

  .dark {
    /* Tool: paper and ink (dark) */
    --background: 0 0% 6%;
    --foreground: 0 0% 92%;
    --surface-1: 0 0% 9%;
    --surface-2: 0 0% 8%;
    --surface-3: 0 0% 12%;

    --card: 0 0% 9%;
    --card-foreground: 0 0% 92%;
    --popover: 0 0% 10%;
    --popover-foreground: 0 0% 92%;
    --primary: 0 0% 92%;
    --primary-foreground: 0 0% 7%;
    --secondary: 0 0% 13%;
    --secondary-foreground: 0 0% 92%;
    --muted: 0 0% 14%;
    --muted-foreground: 0 0% 62%;
    --accent: 0 0% 13%;
    --accent-foreground: 0 0% 92%;
    --destructive: 0 0% 92%;
    --destructive-foreground: 0 0% 7%;
    --border: 0 0% 20%;
    --hairline: 0 0% 100% / 0.1;
    --input: 0 0% 20%;
    --ring: 0 0% 85%;

    --shadow-sm: 0 1px 2px hsl(0 0% 0% / 0.4);
    --shadow-md: 0 1px 2px hsl(0 0% 0% / 0.4), 0 12px 32px -18px hsl(0 0% 0% / 0.8);
    --shadow-lg: 0 2px 4px hsl(0 0% 0% / 0.4), 0 30px 60px -30px hsl(0 0% 0% / 0.9);
    --grid-line: 0 0% 100% / 0.03;

    --content-1: 212 42% 68%;
    --content-2: 268 28% 72%;
    --content-3: 18 50% 64%;
    --content-4: 40 52% 60%;
    --content-5: 152 26% 58%;

    --gold: 42 64% 62%;
    --marker: 48 95% 52%;
    --marker-alpha: 0.32;
  }
}

@media (min-width: 768px) {
  :root { --bar-h: 3.5rem; }
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    color-scheme: light;
    -webkit-tap-highlight-color: transparent;
  }
  html.dark {
    color-scheme: dark;
  }
  html, body { overflow-x: clip; }
  body {
    @apply text-foreground antialiased;
    font-family: 'IBM Plex Sans Hebrew', system-ui, sans-serif;
    font-weight: 300;
    overscroll-behavior-y: none;
    min-height: 100dvh;
    /* A faint drafting grid on paper. */
    background:
      linear-gradient(hsl(var(--grid-line)) 1px, transparent 1px) 0 0 / 100% 64px,
      linear-gradient(90deg, hsl(var(--grid-line)) 1px, transparent 1px) 0 0 / 64px 100%,
      hsl(var(--background));
    background-attachment: fixed;
  }
  strong, b { font-weight: 500; }
  ::selection { background: hsl(var(--foreground)); color: hsl(var(--background)); }
}

@layer components {
  /* Mono label: section kickers, units, captions. */
  .label-mono {
    font-family: 'IBM Plex Mono', 'IBM Plex Sans Hebrew', ui-monospace, monospace;
    font-size: 0.6875rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    color: hsl(var(--muted-foreground));
  }
  .num-mono {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
  }

  /* A sheet of paper resting on the table. */
  .panel {
    background: hsl(var(--surface-1));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
  }
  .panel-flat {
    background: hsl(var(--surface-1));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
  }
  /* A recessed field: the board, tracks. */
  .well {
    background: hsl(var(--surface-3) / 0.6);
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    box-shadow: inset 0 1px 2px hsl(var(--shade) / 0.05);
  }

  .rule { border-top: 1px solid hsl(var(--border)); }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    /* Fixed layer (Anat, 03.11.2026): square action buttons, no visible frame. A button reads as a
       button from its soft ground, padding and shadow, a lift on hover and a sink on press. */
    border-radius: 0;
    border: 1px solid transparent;
    font-weight: 400;
    letter-spacing: 0.01em;
    /* Press feedback 160ms ease-out (Emil Kowalski); colours ease, transform only for the press. */
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
    -webkit-user-select: none;
    user-select: none;
  }
  .btn:active:not(:disabled) { transform: scale(0.97); }
  .btn:focus-visible {
    outline: 1px solid hsl(var(--ring));
    outline-offset: 3px;
  }
  .btn-primary {
    color: hsl(var(--primary-foreground));
    background: hsl(var(--primary));
    box-shadow: 0 10px 24px -16px hsl(0 0% 0% / 0.6);
  }
  .btn-primary:hover { background: hsl(var(--primary) / 0.86); }
  .btn-ghost {
    color: hsl(var(--foreground));
    background: hsl(var(--surface-2));
    box-shadow: 0 1px 2px hsl(var(--shade) / 0.08), 0 6px 14px -10px hsl(var(--shade) / 0.35);
  }
  .btn-ghost:hover { background: hsl(var(--surface-3)); }
  @media (hover: hover) and (pointer: fine) {
    .btn-primary:hover, .btn-ghost:hover { box-shadow: 0 2px 4px hsl(var(--shade) / 0.1), 0 12px 22px -12px hsl(var(--shade) / 0.45); }
  }
  .btn-text {
    color: hsl(var(--muted-foreground));
  }
  .btn-text:hover { color: hsl(var(--foreground)); }

  /* Large thin display numerals and headings. */
  .display-num {
    font-weight: 200;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.03em;
    line-height: 0.9;
  }

  /* Highlighter marker on the words that carry the meaning. */
  .hl {
    background: linear-gradient(transparent 52%, hsl(var(--marker) / var(--marker-alpha)) 52%, hsl(var(--marker) / var(--marker-alpha)) 92%, transparent 92%);
    color: inherit;
    font-weight: 500;
    padding: 0 0.08em;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }

  /* Underline link that draws in on hover. */
  .link-draw {
    background: linear-gradient(currentColor, currentColor) 100% 100% / 0 1px no-repeat;
    transition: background-size 0.35s ease;
  }
  .link-draw:hover { background-size: 100% 1px; }
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 2px; }
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## נספח ב': תוספת ל-`tailwind.config.ts`

```ts
fontFamily: {
  sans: ['"IBM Plex Sans Hebrew"', 'system-ui', 'sans-serif'],
  mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
},
boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
colors: {
  // ... אסימוני shadcn הרגילים (background, foreground, primary וכו')
  surface: { 1: 'hsl(var(--surface-1))', 2: 'hsl(var(--surface-2))', 3: 'hsl(var(--surface-3))' },
  'content-1': 'hsl(var(--content-1))',
  'content-2': 'hsl(var(--content-2))',
  'content-3': 'hsl(var(--content-3))',
  'content-4': 'hsl(var(--content-4))',
  'content-5': 'hsl(var(--content-5))',
},
borderRadius: { lg: 'var(--radius)', md: 'var(--radius)', sm: 'var(--radius)' },
```

וב-JS, צבע תוכן עם שקיפות:
```ts
export const contentColor = (n: 1 | 2 | 3 | 4 | 5, alpha = 1) =>
  alpha >= 1 ? `hsl(var(--content-${n}))` : `hsl(var(--content-${n}) / ${alpha})`;
```

## נספח ג': `Rich.tsx` (מרקר מתוך `**מילה**`)

```tsx
import { Fragment } from 'react';

/** Renders text where **phrase** marks the words that carry the meaning, as a highlighter. */
export default function Rich({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <span className={className}>
      {parts.map((p, i) => (i % 2 ? <mark key={i} className="hl">{p}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </span>
  );
}
```

## נספח ד': `Glyph.tsx` (ציור קו בזהב)

את `D` (מערך מסלולי SVG על רשת 32) ואת `DOTS` כל אפליקציה מגדירה בקובץ `glyphPaths.ts` משלה.
את `<GlyphDefs />` מציבים פעם אחת בשורש האפליקציה.

```tsx
import type { SVGProps } from 'react';

import { D, DOTS } from './glyphPaths';




/** A soft, irregular wash behind each drawing, turned differently per card. */
const WASH = 'M16 4.2C22.8 3.6 28.2 9.1 27.8 16.1C27.4 22.9 21.9 28.1 15.2 27.8C8.6 27.5 3.9 22.2 4.3 15.5C4.7 9.1 9.5 4.8 16 4.2Z';

interface GlyphProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  i: number;
  size?: number | string;
  strokeWidth?: number;
  /** gold: the soft hand-drawn gold drawing with a wash (default). ink: currentColor, no wash. */
  tone?: 'gold' | 'ink';
}

/** Hidden filter that gives every gold drawing a slight hand-drawn waver. Render once. */
export function GlyphDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="hand-drawn" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

export default function Glyph({ i, size = 24, strokeWidth, tone = 'gold', ...rest }: GlyphProps) {
  const gold = tone === 'gold';
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke={gold ? 'hsl(var(--gold))' : 'currentColor'}
      strokeWidth={strokeWidth ?? (gold ? 1.55 : 1.25)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {gold && <path d={WASH} transform={`rotate(${(i * 47) % 360} 16 16)`} fill="hsl(var(--gold) / 0.13)" stroke="none" />}
      <g filter={gold ? 'url(#hand-drawn)' : undefined}>
        <path d={D[i]} />
        {DOTS[i]?.map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={gold ? 'hsl(var(--gold))' : 'currentColor'} stroke="none" />)}
      </g>
    </svg>
  );
}
```

דוגמה לשני ציורים, כנקודת מוצא:
```ts
export const D: string[] = [
  // נבט
  'M16 28V15 M16 19C11 19 8 16 8 11C13 11 16 14 16 19Z M16 15.5C16 10.5 19 7.5 24 7.5C24 12.5 21 15.5 16 15.5Z M10 28H22',
  // מגדלור
  'M12 28L13.5 13H18.5L20 28Z M12.8 13V10H19.2V13 M14 10L16 7.5L18 10 M9 28H23 M13 19.5H19 M12.6 24H19.4 M19.2 11.5L27 8.5 M19.2 11.5L27 14.5 M12.8 11.5L5 8.5 M12.8 11.5L5 14.5',
];
export const DOTS: Record<number, [number, number, number][]> = {};
```
