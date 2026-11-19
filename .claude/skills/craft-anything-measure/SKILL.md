---
name: craft-anything-measure
description: מודד אתר חי במספרים (צבעים, רדיוסים, גופנים, ריווח, פריסה בשלושה רוחבים) עם Craft Anything של storytold, במצב חדר נקי, ובלי מודל. להפעיל לפני השבחה של אפליקציה מהתור, לפני מעבר של אפליקציה מ-Lovable או Base44 לריפו משלנו, וכשלומדים מאתר ייחוס של עירייה אחרת.
---

# מדידה לפני השבחה

==הכלי מודד, לא בונה. את הבנייה ממשיך לעשות `anat-app-builder`.==
מקור: storytold/craft-anything (MIT או Apache-2.0, אלפא מוקדמת, גרסה 0.6.1). נבדק ב-19.11.2026: נבנה ורץ בסביבת הענן.

## התקנה (בענן בלבד, כ-8 דקות, חינם)
```bash
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/storytold/craft-anything /home/user/storytold/craft-anything
cargo install --locked --path /home/user/storytold/craft-anything/apps/craft-anything-cli --root /home/user/storytold/install
export PATH=/home/user/storytold/install/bin:$PATH && craft-anything-cli doctor
```
לא מותקן על המחשב הארגוני של ענת.

## הפעלה
כל פקודת CLI פותחת דפדפן משלה, ולכן פתיחה וצילום רצים בסשן אחד דרך `tools/craft-mcp-run.mjs`:
```bash
cat > calls.json <<'J'
[{"name":"web_site_open","arguments":{"url":"<כתובת חיה>"}},
 {"name":"web_site_capture","arguments":{"output_directory":"<תיקייה חדשה, נתיב מלא>","widths":[1440,768,390]},"max":3000},
 {"name":"web_site_close"}]
J
node tools/craft-mcp-run.mjs ./measure.cany calls.json --all-tools
```
התוצאה: `capture.json` ו-`README.md` עם המדידות, ושלושה צילומים.

## איפה מפעילים
1. **השבחה מהתור:** מדידה לפני ואחרי. הפערים (רקע כהה, כפתורים עגולים, גופן) נקראים מהמספרים, לא מהעין בלבד.
2. **מעבר מ-Lovable ומ-Base44:** מדידה של האפליקציה החיה של ענת היא האפיון לבנייה מחדש בריפו משלנו.
3. **אתר ייחוס:** לומדים פרופורציות, ריווח וסולם טיפוגרפי. לא מעתיקים לוגו, תמונות או טקסט.

## גבולות (שער בטיחות)
- **חדר נקי תמיד** (`--clean-room`). מצב עמוק רק על קוד של ענת.
- **צילום רחב ב-RTL מוסט** (נמדד: כ-185 פיקסלים ב-1440). המספרים אמינים, ואת הבדיקה בעין עושים עם Playwright.
- **`rebuild` לא מופעל בלי אישור ענת:** הוא מריץ את Claude Code על חשבון המכסה שלה, ולא מכיר את שפת העיצוב.
- אתר שדורש כניסה, או אתר עם מידע אישי: לא מודדים.
- כל שימוש נרשם ב-`docs/tools-bank.md`, פרק Craft Anything.
