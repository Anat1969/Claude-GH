# בדיקת מיזוג ופריסה לילית: 04:00

כלל של ענת (17.11.2026): בכל לילה ב-04:00 נבדקות האפליקציות שעבדה עליהן ביום שהסתיים.
הבדיקה: כל שינוי מוזג ל-main, ו-main נפרס ל-Vercel.
התוצאה: דוח מזוקק בדף "שדרוג אפליקציות" ביומן החכם, https://yoman-gh.vercel.app/upgrades

## למה משימה עצמאית
משימה שקשורה לשיחה לא רצה כשהשיחה במצב תכנון או כשהתהליך הופעל מחדש (`docs/night-tracker.md`, 29.10 עד 08.11).
לכן המשימה פותחת שיחה חדשה בכל הפעלה, עם חיבורים ל-Supabase ול-Vercel.

## הנתונים
- טבלה `yoman_app_reports` ב-Supabase `ktqmwpbzcnzkhjskqisy`. שורה לכל יום, `report_date` הוא המפתח.
- שדות: `headline` (עד 8 מילים), `checked`, `ok`, `apps` (מערך), `todo` (מערך מחרוזות).
- כל אפליקציה ב-`apps`: `name` (השם העברי מ-aoa_apps), `repo` (owner/repo), `live_url`, `status`, `done`, `todo`, `branches`.
- `status` הוא אחד מ: `ok` (מוזג ונפרס), `unmerged` (יש ענף עם עבודה שלא ב-main), `not_deployed` (main לא נפרס, או שהפריסה בוטלה), `failed` (הפריסה נכשלה). כשיש כמה, החמור קובע: failed, not_deployed, unmerged.
- הדף קורא דרך Edge Function `yoman-reports`. הכתיבה ישירה במסד, ב-`insert ... on conflict (report_date) do update`.

## לקחי הלילה הראשון (18.11.2026)
- **ההרצה נכשלה בדקה:** למשימה לא היו חיבורים, ובסביבה שלה אין API של GitHub ואין `list_repos`. לכן הגילוי עבר ל-git בלבד: רשימת ריפו ב-`docs/repos.txt` (ובאיחוד עם `aoa_apps` כש-Supabase מחובר), ו-`merge-check.sh --discover`.
- **`--shallow-since` נכשל** על ריפו עם ענפים ישנים ("error processing shallow info"). הגילוי משכפל קומיטים בלבד (`--filter=tree:0`): **15** ריפו ב-**11** שניות.
- **קומיט "app:" אינו כשל פריסה.** זו בנייה סטטית לקישור הישיר, ו-Vercel מבטל אותה בכוונה. בודקים את `deploy_sha`, הקומיט האחרון שאינו "app:". "רחוב טוב במספרים לא נפרס" בדוח הראשון היה אזעקת שווא.
- **ענף ישן לא מסמן את היום באדום.** `unmerged` רק כשיש בענף קומיט מתוך החלון (`recent>0`). ענף ישן נרשם ב-`branches` ובשורת todo אחת.

- **ענף מבסיס ישן לא ממזגים ישירות** (18.11.2026, פודטראקים): הענף נחתך מגרסה מיוני, ו-main קיבל מאז יותר מ-20 מיזוגים. בניסיון מיזוג התנגשו 14 קבצים, והענף גם מבטל את הגנת העריכה. השדה `behind` בכל ענף מראה כמה קומיטים נכנסו ל-main מאז שנחתך. מעל **10**, ה-todo הוא "לבנות מחדש על main" ולא "למזג".

## הכלי
`tools/merge-check.sh --discover <since-iso> <file>`: מחזיר את הריפו מתוך הקובץ שיש בהם קומיט בחלון.
`tools/merge-check.sh <since-iso> owner/repo ...`: בדיקת המיזוג. סוף החלון ב-`UNTIL=<iso>`.
git בלבד, בלי gh, כדי שיעבוד בלי הרשאת API.
לכל ריפו: הקומיטים של היום ב-main, וענפים עם תוכן שעוד לא ב-main.
ענף שמוזג ב-squash לא נספר: הבדיקה ב-`git cherry`, ואחריה השוואת הקבצים שהענף שינה מול main.

## הפרומפט של המשימה

```
בדיקת מיזוג ופריסה לילית של האפליקציות של ענת. עבוד בעברית, בלי לשאול שאלות, ובלי לגעת בקוד של אף אפליקציה.

1. חלון הזמן: יום העבודה שהסתיים, 00:00 עד 24:00 שעון ישראל (Asia/Jerusalem) של אתמול. חשב את הגבולות ב-UTC. report_date הוא התאריך של אתמול.
2. הכללים: קרא את https://raw.githubusercontent.com/Anat1969/Claude-GH/main/docs/nightly-merge-check.md
3. אילו אפליקציות: list_repos (limit 200) ובחר כל ריפו של Anat1969 עם pushed_at בתוך החלון או אחריו. אל תכלול את Claude-GH.
4. מיזוג: git clone --depth 1 https://github.com/Anat1969/Claude-GH /tmp/cgh, והרץ: bash /tmp/cgh/tools/merge-check.sh <תחילת החלון ב-UTC> <כל הריפו>. ריפו שלא נעשה בו קומיט בחלון, לא ב-main ולא בענף (recent=0 ו-main_commits_today=0), יוצא מהדוח.
5. פריסה: Vercel, צוות team_UNONu5KtfgMgLtVno6fdCtrQ. list_deployments עם target=production ו-since=תחילת החלון, ולפי הצורך list_projects עם repo=<שם הריפו>. בדוק שה-sha של main (main_sha) נפרס ב-READY. פריסה CANCELED או ERROR של main: not_deployed או failed. ריפו שאין לו פרויקט ב-Vercel: חפש ב-aoa_apps את previewUrl שלו, ובדוק מאיזה ריפו נפרס הפרויקט הזה.
6. שם וכתובת: aoa_apps ב-Supabase ktqmwpbzcnzkhjskqisy, לפי data->>'githubUrl'. השם מ-data->>'name', והכתובת מ-data->>'previewUrl'.
7. ניסוח: done הוא מה שנעשה ביום, משפט או שניים בעברית, מזוקק מהודעות הקומיט (main_subjects והענפים). todo הוא הפעולה הנדרשת, משפט אחד, או null כשהכול תקין. ענף פתוח ישן מהחלון נכנס רק אם הריפו נבדק היום, ומוזכר ב-branches. headline: עד 8 מילים, התובנה של הלילה, למשל "שתיים לא נפרסו, ארבע ממתינות למיזוג" או "הכול מוזג ונפרס". todo הכללי: עד 5 שורות, הדחוף קודם, כל שורה פותחת בשם האפליקציה.
8. כתיבה: insert into yoman_app_reports (report_date, headline, checked, ok, apps, todo) values (...) on conflict (report_date) do update set headline=excluded.headline, checked=excluded.checked, ok=excluded.ok, apps=excluded.apps, todo=excluded.todo, created_at=now(). אם לא נעשתה עבודה ביום, כתוב שורה עם checked=0 ו-headline "לא נעשתה עבודה על אפליקציות".
9. אל תמזג, אל תפרוס ואל תמחק ענפים. הדוח בלבד.
10. סיום: שורה אחת עם הכותרת, המספרים והקישור https://yoman-gh.vercel.app/upgrades
```

## יומן הרצות
| תאריך | נבדקו | תקינות | הערה |
|---|---|---|---|
| 17.11.2026 (בדיקת פתיחה ידנית, עד 14:30) | 7 | 2 | רחוב טוב במספרים: פריסה בוטלה (התברר כאזעקת שווא). רחובות טובים: הריפו לא מחובר ל-Vercel |
| 18.11.2026, 04:05 | 0 | 0 | נכשלה: בלי חיבורים ובלי API של GitHub. לא נכתב דוח |
| 17.11.2026 (הרצה ידנית מלאה, 18.11) | 12 | 9 | רחובות טובים לא באוויר. פודטראקים: 4 קומיטים בענף. שכונה 360: ענף. שלוש אפליקציות חדשות לא רשומות ב-aoa_apps |
