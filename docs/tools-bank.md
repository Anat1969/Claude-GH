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
