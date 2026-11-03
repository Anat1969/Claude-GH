# בנק כלים חיצוניים

כלי שענת מביאה, או שנמצא בדרך, נבחן כאן לפני שימוש: מה הוא נותן, מה החינמי מאפשר, ומה המקבילה המקומית של Claude.
הכלל: **Claude לא מעלה קבצים לאתר חיצוני.** כשיש מקבילה מקומית (ffmpeg, Playwright), היא עדיפה: חינם, בלי פרסומות, ניתנת לחזרה ונשמרת בריפו.
הכלי החיצוני נשאר לענת, לעבודה ידנית מהדפדפן.

## 123apps (123apps.com)

נבדק 03.11.2026, מתוך רייל בפייסבוק (hayzee.tec, ‏142 אלף צפיות).
51 כלים בדפדפן, בלי הרשמה. חינם: עד **10GB** לקובץ, עם פרסומות. Premium: **$6** לחודש. **אין API**, ולכן Claude לא יכול להפעיל אותו.

| הכלי ב-123apps | למה זה טוב באפליקציות | אצל Claude, בפקודה |
|---|---|---|
| Screen Recorder, Video Editor (online-video-cutter.com) | סרטון הדגמה לכל אפליקציה | `templates/demo.cjs`: הקלטה, כיתוב תובנה RTL, MP4, GIF ותמונת שער |
| Crop, Resize, Rotate, Trim, Merge | התאמת סרטון לכרטיס, לרייל או לסטורי | `ffmpeg -vf crop=...,scale=...` / `-ss -t` / `concat` |
| Add Text, Add Image (watermark), Add Music | לוגו A&I או אשדוד, כיתוב, מוזיקה | כיתוב: בתוך הדף ב-Playwright (RTL נכון). לוגו: `ffmpeg overlay` |
| Text to Speech | קריינות להדגמה | אין מקבילה חינמית איכותית בענן. ענת מפיקה ידנית, Claude משלב |
| mp3cut.net: Trim, Volume, Speed, Equalizer | סאונד קצר לאפליקציה | `ffmpeg -af volume=,atempo=,equalizer=` |
| convert.io: Image, Document, Font, Ebook, Archive | WebP לתמונות שער, PDF לתמונות, המרת פונטים | `ffmpeg -c:v libwebp` / `pdftoppm` / `fonttools` |
| pdf.io: Split, Merge, Compress, Protect | מסמכים מצורפים לאפליקציה | סקיל `pdf` |
| Remove Logo from Video | | לא בשימוש: הסרת סימן מים מתוכן של אחר אסורה |

## שימוש מיידי: סרטון הדגמה לכל אפליקציה

```bash
node .claude/skills/anat-design-language/templates/demo.cjs http://localhost:4173/ shots/demo "שורת התובנה של האפליקציה"
```

- רץ מול `vite preview`, ולכן עובד גם כשהענן לא מגיע ל-vercel.app.
- נבדק על תיק האפליקציות: 12 שניות, MP4 **1MB**, GIF **1.5MB**, כיתוב עברי מימין לשמאל.
- ה-GIF נכנס ל-README מתחת לקישור החי, והתמונה (poster) יכולה לשמש תמונת שער ב-aoa_apps.

## מצב תסריט: סרטון שמספר סיפור

```bash
node .claude/skills/anat-design-language/templates/demo.cjs http://localhost:4173/ docs/examples/demo/appofapp docs/examples/demo-appofapp.json
```

- **כרטיס פתיחה**, סצנות ממוספרות (01 / 05) עם שורת תובנה ומשפט הסבר, **סמן גלוי**, ו**כרטיס סיום** עם הכתובת.
- כל סצנה בונה פעולה אחת שהאפליקציה עושה: הקלדה, ריחוף, לחיצה, גלילה, או מעבר בניווט עצמו (`nav`), ובלי טעינה מחדש.
- `ready` מחכה לתוכן האמיתי, ולכן מסך טעינה לא נכנס לסרטון.
- **הדוגמה:** תיק האפליקציות, 5 סצנות, **41 שניות**. MP4 של **3.5MB**, ו-GIF של כל הסיפור במהירות כפולה, **2.3MB**. נמצא ב-`docs/examples/demo/`.
- **בחירת הדוגמה בחיפוש:** מילה שמוצאת לפי משמעות אפליקציה עם תמונת שער. "מדרכה" מוצאת את רחובות טובים באשדוד, ו"משכורת" מוצאת את תלושי שכר, שאין לה תמונה ולכן היא נראית ריקה בסרטון.

## רִיל Cubesites: VERT, PairDrop, Stockade

נבדק 03.11.2026, מתוך רייל בפייסבוק ("3 websites that make your life easier", Cubesites, ‏301 אלף צפיות, facebook.com/reel/38600012026310223).
לא משתמשים באתרים עצמם. לוקחים את העיקרון, ובונים אותו בתוך האפליקציות בשפה של ענת.

### איך מזקקים רייל לכלי

התהליך המלא הוא סקיל: `.claude/skills/reel-to-tools/SKILL.md`.

1. **חילוץ:** Apify `apivault_labs/facebook-reels-video-scraper` מחזיר כותרת, תמליל וקישור MP4 (כ-**$0.004** לרייל). WebFetch לא קורא פייסבוק.
2. **צפייה:** `ffmpeg -vf "fps=1,scale=360:-1"` ואחריו `tile=6x4` יוצרים דף פריימים אחד. ממנו מזהים מה מוצג, גם כשאין תמליל.
3. **זיקוק:** לכל רעיון: עיקרון, בעיה שהוא פותר, ומדד אמינות (סעיף 7).
4. **מיפוי:** אפליקציות קיימות מ-`aoa_apps`, ורעיון אחד לפחות לאפליקציה עתידית.

### 1. עיבוד על המכשיר (מתוך VERT, vert.sh)

==הקובץ לא עוזב את המחשב, ולכן אין סיכון פרטיות.==
המרה, דחיסה וקריאה של קבצים בדפדפן של המשתמש, בלי שרת ובלי הגבלת גודל.
- **מימוש חינמי:** `ffmpeg.wasm` לווידאו ושמע, `pdf.js` ל-PDF, `browser-image-compression` לתמונות. טעינה עצלנית.
- **ממשק:** אזור גרירה אחד ("גרירה או לחיצה"), וכרטיס "מה נתמך" לכל סוג קובץ עם מצב: מוכן, חלקי, דורש שרת.
- **מדד אמינות:** כרטיס "מה נתמך" הוא המדידה העצמית של הכלי.
- **בתיק:** תלושי שכר, בקשה להיתר, תלונות ציבור, מוקד 106, רשימת שימור ותיק תיעוד, הקלטות, סרטון לפני ואחרי.

### 2. העברה בין מכשירים בלי כניסה (מתוך PairDrop, pairdrop.net)

==מצלמים בטלפון בשטח, והתמונה כבר על המסך בעבודה.==
חדר משותף לפי קוד קצר או QR, בלי חשבון ובלי סיסמה.
- **מימוש חינמי:** Supabase Realtime, ערוץ לפי קוד בן **4** ספרות, וקובץ לדלי פרטי עם signed URL. כינוי אקראי למכשיר ("ירוק שקד") במקום כניסה.
- **מתאים לכלל של ענת:** עבודה זורמת מכל מכשיר, בלי קישור או מפתח (AppOfApp, 29.10.2026).
- **מדד אמינות:** חיווי "התקבל" במכשיר השני, וזמן ההעברה.
- **בתיק:** שילוט באתרי בנייה, רחובות טובים באשדוד, מה נבנה סביבי, לפני ואחרי, ותמונת שער ב-AppOfApp ישר מהטלפון.
- **מומש:** בתיק האפליקציות, 03.11.2026 (AppOfApp-GH#34). בעריכה, כפתור "מהטלפון" בתמונת השער פותח QR. הטלפון מצלם, מקטין את התמונה (כלי 1) ושומר, והמחשב קולט אותה תוך **3 שניות**. בלי Realtime, ולכן זה עובד גם ב-Pages. הקוד לשימוש חוזר: `src/lib/phone.ts`, `PhoneShoot.tsx`, `PhoneLink.tsx`.

### 3. סימולטור עם משאב וירטואלי (מתוך Stockade, stockademarketsim.com)

==מתאמנים על החלטה אמיתית, בלי לשלם על טעות.==
סביבת "מה אם" עם תקציב או זכויות וירטואליים, הרצה חוזרת על נתוני עבר, ותווית קבועה "סימולציה בלבד".
- **מימוש חינמי:** מצב ב-localStorage, נתוני עבר כ-JSON סטטי, וציר זמן שאפשר להריץ ולעצור.
- **ממשק:** מספר מרכזי אחד בגדול (יתרה, אחוזי בנייה, עלות), שינוי בירוק או באדום, וכפתור "התחלה מחדש".
- **מדד אמינות:** כל תוצאה מציגה כלל חישוב ומקור (תקנה, טבלה 5, תב"ע).
- **בתיק:** תרגיל אחוזי בנייה ותכסית, מחשבון טבלה 5, תואם מתאר, פינוי בינוי, התחדשות עירונית רובע א, כלכלת הדונט. פעולה: "משחק ואימון".

### רעיונות לאפליקציות עתידיות

| רעיון | כלים | למה |
|---|---|---|
| סיור שטח: צילום בטלפון, מיקום ותיוג, ישר לתיק תיעוד במחשב | 2 + 1 | **מומש** בשילוט באתרי בנייה, 03.11.2026 (SignAshdod-GH#3). הבא בתור: תיק השימור ורחובות טובים |
| סימולטור פינוי בינוי: מקדם, דירות תמורה ועלות, לפני ואחרי | 3 | החלטה שמרגישים, במקום טבלת אקסל |
| ממיר תוכניות מקומי: PDF של היתר לתמונות ולטבלת שטחים, בלי העלאה | 1 | מסמכי תושבים לא עוזבים את המחשב |

## SpacePlanner (spaceplanner.co)

Checked 03.11.2026, from a Facebook reel (Coma TV, **2.8 million** views, 14 seconds, no transcript; frames extracted with ffmpeg).
Floor plan in the browser with real dimensions. Instant switch to 3D, then a first-person walkthrough. AI import from a photo, sketch or PDF.
Free to draw. Photorealistic render with credits: **$3.99** for 4. Export to PNG, PDF, SVG, JSON and DXF. **No API and no embedding.**

**The principle: line, volume, first person.** You understand a space only when you stand inside it.

| What it does | At Claude's end | Where it is already used |
|---|---|---|
| Plan to 3D to walkthrough | `walk.js` (`<space-walk>`) from appofapp-gh, standard `docs/walk-standard.md` in AppOfApp-GH | Urban 95, `/walk` |
| Choosing an eye height | 95 child, 120 seated adult, 160 standing, with a live count of what blocks the view | Urban 95 |
| Common layout against the guidelines | `variants` in the plan, problem in red and solution in green | Urban 95 |
| AI import from an image | Gemini from `aoa-edit`, with scale calibration by one known dimension (a 90 cm door) | Next: "Space from any image" |

Next in the portfolio: plan for residents (urban renewal, clearance and rebuild), allowed volume (building-percentage and coverage exercise, Table 5), view from a wheelchair (MUNI 100), before and after.

## קריינות בעברית (נבדק 03.11.2026, ענת בחרה: הילה)

- **הכלי:** `templates/tts.py`, עם הקולות של קריאה בקול ב-Microsoft Edge. בחינם ובלי מפתח. הקולות: `he-IL-HilaNeural` (הילה, הבחירה של ענת) ו-`he-IL-AvriNeural` (אברי).
- **הערכה, לא עובדה:** זה שימוש לא רשמי בשירות. הוא עובד היום, ואין התחייבות שימשיך לעבוד. החלופה הרשמית: Google Cloud Text-to-Speech, עם מפתח וחשבון חיוב.
- **בתסריט:** `"voice": "he-IL-HilaNeural"`, ולכל סצנה `"say"`. גם `sayTitle` ו-`sayClose` לכרטיסים.
  - כל סצנה נמשכת לפחות כמו המשפט שלה.
  - המשפט מתחיל רק כשהמסך מוכן.
  - שלב `pre` רץ לפני המשפט, כדי ששכבה איטית כבר תופיע כשהילה מזכירה אותה.
- **עריכה אוטומטית:**
  - קטע קפוא ארוך משנייה, מחוץ לקריינות, מתקצר ל-0.5 שנייה.
  - בין משפט למשפט נשארות 0.6 שניות מכל צד, כמו קפיצת עריכה.
  - הקול זז יחד עם החיתוך.
- **הדוגמה:** רפואה, גרסה 2. **62** שניות ושבע סצנות. סריקה חזותית של 18 מסכים הובילה לבחירה של הלב, הריאות והמוח במראה רקמה, מחזור הדם ומפת הגילויים. כל עובדה שהילה אומרת נבדקה מול `js/data.js` והמקור שלה.
- **מלכודת:** `edge-tts` קורא את תעודות ה-SSL מ-certifi ישירות. בענן מפנים אותו ל-`/root/.ccr/ca-bundle.crt`, ו-`tts.py` עושה זאת בעצמו.

### מומש: סיור שטח (SignAshdod-GH, 03.11.2026)

==השלט המאושר ליד המצלמה, והכרעה אחת בלחיצה.==
- **מסלול:** בוחרים אתר (הבקשות שאושרו ראשונות), מצלמים, ובוחרים אחת מ-**4** הכרעות. המיקום עם הדיוק והשעה נקלטים מעצמם.
- **שמירה בלי סכמה חדשה:** הבדיקה היא הערה מסוג `field_check`. השדות כתובים בשורות טקסט (`בדיקת שטח:`, `תמונה:`, `מיקום:`), וקריאים גם בלי הקוד.
- **מדד אמינות:** דיוק המיקום במטרים מוצג ליד כל בדיקה, והשלט המאושר מוצג ליד התמונה מהשטח.
- **לשימוש חוזר:** `src/lib/field.js` (הקטנה, מיקום, פורמט ופענוח) ו-`FieldTour.jsx`. באפליקציה אחרת מחליפים רק את רשימת האתרים ואת ההכרעות.

