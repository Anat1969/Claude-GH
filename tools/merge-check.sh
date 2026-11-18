#!/usr/bin/env bash
# בדיקת מיזוג: לכל ריפו, אילו ענפים מכילים קומיטים שלא הגיעו ל-main.
# שימוש: tools/merge-check.sh <since-iso> owner/repo [owner/repo ...]
# פלט: שורת JSON לכל ריפו. git בלבד, בלי gh, כדי שיעבוד גם בלי הרשאת API.
set -uo pipefail
# סוף החלון (לא חובה): UNTIL=<iso>. בלעדיו החלון פתוח עד עכשיו
U=()
[ -n "${UNTIL:-}" ] && U=(--until="$UNTIL")
# מצב גילוי: tools/merge-check.sh --discover <since-iso> <file>
# מקבל קובץ עם owner/repo בכל שורה, ומחזיר רק את הריפו שיש בהם קומיט מאז since, בכל ענף.
# git בלבד (clone רדוד לפי תאריך), כי בסביבת המשימה הלילית אין API של GitHub.
if [ "${1:-}" = "--discover" ]; then
  since="$2"; list="$3"; d=$(mktemp -d)
  while read -r full; do
    [ -z "$full" ] && continue; case "$full" in \#*) continue;; esac
    t="$d/${full//\//_}"
    if git clone -q --bare --filter=tree:0 "https://github.com/$full.git" "$t" >/dev/null 2>&1 \
       && [ -n "$(git -C "$t" rev-list --all --since="$since" "${U[@]}" -n1 2>/dev/null)" ]; then echo "$full"; fi
    rm -rf "$t"
  done < "$list"
  rm -rf "$d"; exit 0
fi
since="$1"; shift
work=$(mktemp -d)
for full in "$@"; do
  dir="$work/${full//\//_}"
  if ! git clone -q --bare --filter=blob:none "https://github.com/$full.git" "$dir" 2>/dev/null; then
    printf '{"repo":"%s","error":"clone_failed"}\n' "$full"; continue
  fi
  cd "$dir"
  base=$(git rev-parse -q --verify refs/heads/main || git rev-parse -q --verify refs/heads/master)
  main_name=$(git rev-parse -q --verify refs/heads/main >/dev/null && echo main || echo master)
  main_sha=$(git rev-parse --short "$base")
  main_date=$(git log -1 --format=%cI "$base")
  # deploy_sha: הקומיט האחרון ב-main שאינו "app:". קומיט "app:" הוא בנייה סטטית לקישור הישיר,
  # ו-Vercel מבטל אותו בכוונה (CANCELED). את הפריסה בודקים מול הקומיט שלפניו.
  deploy_sha=$(git log --format='%h %s' "$base" | grep -v '^[0-9a-f]* app:' | head -1 | cut -d' ' -f1)
  today_main=$(git rev-list --count --since="$since" "${U[@]}" "$base")
  branches=""
  for ref in $(git for-each-ref --format='%(refname:short)' refs/heads/ | grep -vx "$main_name"); do
    # git cherry: קומיט שהתוכן שלו כבר ב-main (גם במיזוג squash) מסומן במינוס ולא נספר
    ahead=$(git cherry "$base" "$ref" 2>/dev/null | grep -c '^+')
    [ "$ahead" -eq 0 ] && continue
    # בדיקה שנייה: אם אין הבדל בקבצים שהענף שינה, התוכן כבר ב-main
    mb=$(git merge-base "$base" "$ref" 2>/dev/null)
    [ -z "$mb" ] && continue   # ענף בלי היסטוריה משותפת (gh-pages): תוצר בנייה, לא עבודה
    files=$(git diff --name-only "$mb" "$ref")
    [ -n "$files" ] && git diff --quiet "$base" "$ref" -- $files 2>/dev/null && continue
    last=$(git log -1 --format=%cI "$ref")
    recent=$(git rev-list --count --since="$since" "${U[@]}" "$base..$ref")
    subj=$(git log -1 --format=%s "$ref" | python3 -c 'import sys,json;print(json.dumps(sys.stdin.read().strip()[:90])[1:-1])')
    branches+="{\"name\":\"$ref\",\"ahead\":$ahead,\"recent\":$recent,\"last\":\"$last\",\"subject\":\"$subj\"},"
  done
  subjects=$(git log --since="$since" "${U[@]}" --no-merges --format=%s "$base" | head -8 | python3 -c 'import sys,json;print(",".join(json.dumps(l.strip()[:120]) for l in sys.stdin if l.strip()))')
  printf '{"repo":"%s","main":"%s","main_sha":"%s","deploy_sha":"%s","main_date":"%s","main_commits_today":%s,"main_subjects":[%s],"unmerged":[%s]}\n' \
    "$full" "$main_name" "$main_sha" "$deploy_sha" "$main_date" "$today_main" "$subjects" "${branches%,}"
  cd - >/dev/null
done
rm -rf "$work"
