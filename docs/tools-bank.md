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
