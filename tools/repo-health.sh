#!/usr/bin/env bash
# בדיקת תשתית לריפו של השיחה (ענת, 26.11.2026, אחרי תרבות וגילוי).
# רצה בתחילת כל שיחה על אפליקציה, מתוך Claude-GH ולא מתוך הריפו של האפליקציה:
# ריפו שהענף הראשי שלו ישן נפתח מקוד ישן, ולכן לא יכיל את הבדיקה בעצמו.
#
#   bash tools/repo-health.sh [repoDir]
#   curl -fsS https://raw.githubusercontent.com/Anat1969/Claude-GH/main/tools/repo-health.sh | bash -s -- "$PWD"
#
# git בלבד, קריאה בלבד, אפס פריסות. את החיבור ל-Vercel בודק Claude בכלי (ראו context/UPGRADE.md, סעיף 0).
# פלט: שורות בעברית, ושורת JSON אחרונה לשימוש בבדיקה הלילית.
set -uo pipefail
dir="${1:-${CLAUDE_PROJECT_DIR:-.}}"
cd "$dir" 2>/dev/null || { echo "בדיקת תשתית: התיקייה $dir לא נמצאה"; exit 0; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "בדיקת תשתית: אין כאן ריפו git"; exit 0; }

url=$(git remote get-url origin 2>/dev/null || echo "")
repo=$(printf '%s' "$url" | sed -E 's#^.*github\.com[:/]##; s#\.git$##')
[ -z "$repo" ] && { echo "בדיקת תשתית: לריפו אין origin ב-GitHub"; exit 0; }

default=$(git ls-remote --symref origin HEAD 2>/dev/null | awk '/^ref:/ {sub("refs/heads/","",$2); print $2}')
git fetch -q origin '+refs/heads/*:refs/remotes/origin/*' 2>/dev/null
main_sha=$(git rev-parse -q --verify origin/main 2>/dev/null || echo "")

problems=0
echo "בדיקת תשתית: $repo"
if [ -z "$default" ]; then
  echo "- ענף ראשי: לא ידוע (אין גישה ל-GitHub מהסביבה). בודקים ב-GitHub, Settings, Branches."
elif [ "$default" != "main" ]; then
  problems=$((problems+1))
  echo "- תקלה: הענף הראשי הוא \"$default\" ולא main. כל שיחה חדשה נפתחת מהקוד הישן."
  echo "  לתיקון בדפדפן:"
  echo "  1. https://github.com/$repo/settings/branches"
  echo "  2. ליד Default branch לוחצים על סמל החצים (Switch to another branch)."
  echo "  3. בוחרים main ולוחצים Update, ואז I understand, update the default branch."
  echo "  עד התיקון: בשיחה הזאת עובדים מ-origin/main, לא מהענף שנפתח."
else
  echo "- ענף ראשי: main. תקין."
fi

if [ -n "$main_sha" ]; then
  echo "- ה-sha של main: ${main_sha:0:7}. מולו בודקים את הפריסה האחרונה בייצור ב-Vercel."
  # הענף שהשיחה נפתחה עליו מאחורי main?
  head_sha=$(git rev-parse HEAD)
  behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  if [ "$behind" -gt 0 ] && [ "$head_sha" != "$main_sha" ]; then
    echo "- שים לב: הענף הנוכחי מאחורי main ב-$behind קומיטים. מתחילים מ-origin/main."
  fi
else
  problems=$((problems+1))
  echo "- תקלה: אין ענף main בריפו."
fi

# ענפים עם עבודה שלא הגיעה ל-main
open=0; unmerged=""
for ref in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v -e '^origin/HEAD$' -e '^origin/main$' -e '^origin$'); do
  open=$((open+1))
  n=$([ -n "$main_sha" ] && git rev-list --count "origin/main..$ref" 2>/dev/null || echo "?")
  if [ "$n" != "0" ]; then
    last=$(git log -1 --format=%cs "$ref" 2>/dev/null)
    unmerged="$unmerged ${ref#origin/}($n,$last)"
  fi
done
if [ -n "$unmerged" ]; then
  echo "- ענפים פתוחים: $open, ובהם עבודה שלא מוזגה:$unmerged"
  echo "  לא ממזגים ולא מוחקים בלי לבדוק. מציגים לענת ברשימת אישור בלחיצה."
else
  echo "- ענפים פתוחים: $open, בלי עבודה שלא מוזגה."
fi
echo "- הצעד הבא של Claude: ב-Vercel, get_project לפי שם הריפו. אם אין link לריפו, או שהפריסה האחרונה בייצור אינה על ${main_sha:0:7}, הפרויקט מנותק (הוראות ב-context/UPGRADE.md, סעיף 0)."
printf '{"repo":"%s","default_branch":"%s","main_sha":"%s","open_branches":%s,"unmerged":"%s","problems":%s}\n' \
  "$repo" "${default:-unknown}" "${main_sha:0:7}" "$open" "${unmerged# }" "$problems"
exit 0
