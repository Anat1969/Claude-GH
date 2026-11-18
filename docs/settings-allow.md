# הרשאה קבועה ל-Supabase ול-Vercel: נוסח להדבקה

**למה:** ענת אישרה את הכלים האלה שוב ושוב. כל בקשת אישור חוזרת עוצרת עבודה, ובלילה אין מי שיאשר.
**למה ענת ולא Claude:** מנגנון הבטיחות לא מאפשר ל-Claude להוסיף לעצמו הרשאות. זה נכון, וכך צריך להיות.
**מה כלול:** רק כלים שקוראים, בונים ופורסים. אין כאן כלים שמוחקים, משהים, קונים דומיין או מעבירים פרויקט.

## איך מוסיפים

1. בריפו של האפליקציה, פותחים או יוצרים את הקובץ `.claude/settings.json`.
2. מוסיפים את הבלוק `permissions` שלמטה. אם יש בקובץ כבר `hooks`, משאירים אותו ומוסיפים לידו.
3. קומיט ל-`main`. מהשיחה הבאה בריפו, הכלים האלה רצים בלי לשאול.

דרך קצרה יותר: לכתוב לשיחת Code בריפו "מאשרת: הוסף את ההרשאות מ-docs/settings-allow.md". אז האישור מגיע ממך, באותה שיחה.

```json
{
  "permissions": {
    "allow": [
      "mcp__Supabase__execute_sql",
      "mcp__Supabase__apply_migration",
      "mcp__Supabase__list_tables",
      "mcp__Supabase__list_migrations",
      "mcp__Supabase__list_projects",
      "mcp__Supabase__get_project",
      "mcp__Supabase__get_project_url",
      "mcp__Supabase__get_publishable_keys",
      "mcp__Supabase__get_advisors",
      "mcp__Supabase__list_edge_functions",
      "mcp__Supabase__get_edge_function",
      "mcp__Supabase__deploy_edge_function",
      "mcp__Supabase__query_logs",
      "mcp__Vercel__list_projects",
      "mcp__Vercel__get_project",
      "mcp__Vercel__create_project",
      "mcp__Vercel__update_project",
      "mcp__Vercel__list_deployments",
      "mcp__Vercel__get_deployment",
      "mcp__Vercel__list_deployment_events",
      "mcp__Vercel__create_deployment",
      "mcp__Vercel__assign_alias",
      "mcp__Vercel__get_runtime_errors",
      "mcp__Vercel__get_runtime_logs",
      "mcp__Vercel__web_fetch_vercel_url",
      "mcp__Vercel__get_access_to_vercel_url"
    ]
  }
}
```

**עד שזה בפנים:** במצב Auto, בתפריט שליד תיבת הכתיבה, רוב הקריאות לכלים רצות בלי לשאול.
