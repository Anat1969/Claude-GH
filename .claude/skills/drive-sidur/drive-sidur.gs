// סידור דרייב: קובץ Apps Script אחד, מודבק בגיליון "00 מפת סידור הדרייב" (תוספים > Apps Script).
// רץ בהרשאות של ענת. לא מוחק בלי שורה בלשונית "לאשפה", לא משנה שמות ולא נוגע בשיתופים.

const SIDUR_DRY = false; // true = הרצה יבשה. false = ביצוע אמיתי.

const MAP_ID = '19saOR_3goCdQkgqm-0gGroNMPHRPSNE6CIwV2gJV_xc'; // הגיליון עצמו, נשאר בשורש
const TARGETS = {
  '00 נכנס': '1c2XWuIoz9-uUcBTCCjgGwOD8w3Ns6uaA',
  '10 עירייה': '1KpLgUuIX3-jJt8rCRv1i5jZWbv2yS4-O',
  '20 יוזמות ופרויקטים': '182AmAJrWqmiuSxe7RkFBo4D6M2TOlDld',
  '30 תוצרים': '1L8xQrUI8_LK8H28lOZzxT4JFeSbxkZLK',
  '40 ידע והשראה': '1g-iZV5vRXkrG9a07lXjfYsU2E-wZnPMR',
  '50 אישי': '1J09vNyCwVpLdewwrhzhawmFPD3tTdc0n',
  '90 ארכיון': '1e-0QYl9wc3LIP-5tRiRf68-Xd-TwHhIM'
};
const PLAN_TAB = 'תוכנית סידור';
const LOG_TAB = 'יומן סידור';
const PLAN_HEAD = ['יעד בתוך התיקייה', 'תיקייה ראשית', 'פריט', 'סוג', 'לבצע', 'תוצאה', 'מזהה'];

// ---------------------------------------------------------------
// 1. שבועי: כל מה שבשורש ובתוך "00 נכנס" נכנס לתור בלשונית "תוכנית סידור"
// ---------------------------------------------------------------
function nichnas() {
  const ss = SpreadsheetApp.openById(MAP_ID);
  const plan = ss.getSheetByName(PLAN_TAB) || ss.insertSheet(PLAN_TAB);
  const log = ss.getSheetByName(LOG_TAB) || ss.insertSheet(LOG_TAB);
  plan.setRightToLeft(true);
  log.setRightToLeft(true);
  if (log.getLastRow() === 0) log.appendRow(PLAN_HEAD.concat(['הועבר לתיעוד']));

  // א. שורות שכבר בוצעו עוברות ליומן, והתור מתנקה
  const rows = plan.getDataRange().getValues();
  const keep = [PLAN_HEAD];
  const done = [];
  const today = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
  rows.slice(1).forEach(function (r) {
    if (!String(r[6]).trim()) return;
    if (String(r[5]).indexOf('הועבר') === 0) done.push(r.concat([today]));
    else keep.push(r);
  });
  if (done.length) log.getRange(log.getLastRow() + 1, 1, done.length, done[0].length).setValues(done);

  // ב. מה שבשורש עובר ל-"00 נכנס"
  const skip = {};
  skip[MAP_ID] = true;
  Object.keys(TARGETS).forEach(function (k) { skip[TARGETS[k]] = true; });
  const inbox = DriveApp.getFolderById(TARGETS['00 נכנס']);
  const root = DriveApp.getRootFolder();
  let fromRoot = 0;
  [root.getFiles(), root.getFolders()].forEach(function (it) {
    while (it.hasNext()) {
      const item = it.next();
      if (skip[item.getId()]) continue;
      item.moveTo(inbox);
      fromRoot++;
    }
  });

  // ג. כל פריט ב-"00 נכנס" שעוד לא בתור נכנס לתור, ממתין ליעד
  const queued = {};
  keep.forEach(function (r) { queued[String(r[6])] = true; });
  let added = 0;
  [[inbox.getFiles(), 'קובץ'], [inbox.getFolders(), 'תיקייה']].forEach(function (pair) {
    const it = pair[0];
    while (it.hasNext()) {
      const item = it.next();
      if (queued[item.getId()]) continue;
      keep.push(['', '', item.getName(), pair[1], 'ממתין', 'נכנס ' + today, item.getId()]);
      added++;
    }
  });

  plan.clearContents();
  plan.getRange(1, 1, keep.length, PLAN_HEAD.length).setValues(keep);
  plan.getRange(1, 1, 1, PLAN_HEAD.length).setFontWeight('bold');
  plan.setFrozenRows(1);

  if (added > 0) {
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
      'סידור דרייב: ' + added + ' פריטים חדשים ב-00 נכנס',
      added + ' פריטים חדשים מחכים בלשונית "' + PLAN_TAB + '".\n' +
      fromRoot + ' מהם עברו מהשורש.\n' +
      'ביום ראשון ב-10:23 Claude ימלא יעד מוצע לכל אחד ויסמן "כן".\n' +
      'אחר כך: לבדוק את הלשונית, ולהריץ את sidurPnimi.\n' +
      ss.getUrl());
  }
}

// הפעלה חד-פעמית: מתזמן את nichnas לכל יום ראשון ב-08:00 שעון ישראל
function hafelShavui() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'nichnas') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('nichnas').timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(8).inTimezone('Asia/Jerusalem').create();
  nichnas();
}

// ---------------------------------------------------------------
// 2. ביצוע: מעביר כל שורה שמסומנת "כן" לפי היעד שלה
// ---------------------------------------------------------------
function sidurPnimi() {
  const sheet = SpreadsheetApp.openById(MAP_ID).getSheetByName(PLAN_TAB);
  const rows = sheet.getDataRange().getValues();
  const cache = {};
  let moved = 0, skipped = 0, failed = 0;

  function folderAt(top, path) {
    const key = top + ' / ' + path;
    if (cache[key]) return cache[key];
    let folder = DriveApp.getFolderById(TARGETS[top]);
    let created = false;
    if (path) path.split(' / ').forEach(function (name) {
      if (!folder) return;
      const it = folder.getFoldersByName(name);
      if (it.hasNext()) folder = it.next();
      else if (SIDUR_DRY) { folder = null; created = true; }
      else { folder = folder.createFolder(name); created = true; }
    });
    cache[key] = { folder: folder, created: created };
    return cache[key];
  }

  for (let i = 1; i < rows.length; i++) {
    const dest = String(rows[i][0]).trim();
    const top = String(rows[i][1]).trim();
    const type = String(rows[i][3]).trim();
    const go = String(rows[i][4]).trim();
    const id = String(rows[i][6]).trim();
    if (!id) continue;
    if (String(rows[i][5]).indexOf('הועבר') === 0) continue;
    let result;
    if (go !== 'כן') { skipped++; continue; }
    if (!TARGETS[top]) { result = 'נכשל: תיקייה ראשית לא מוכרת'; failed++; }
    else {
      try {
        const item = type === 'תיקייה' ? DriveApp.getFolderById(id) : DriveApp.getFileById(id);
        const target = folderAt(top, dest);
        const note = target.created ? ' (תיקיית יעד חדשה)' : '';
        if (SIDUR_DRY) result = 'יועבר' + note;
        else { item.moveTo(target.folder); result = 'הועבר' + note; }
        moved++;
      } catch (e) { result = 'נכשל: ' + e.message; failed++; }
    }
    sheet.getRange(i + 1, 6).setValue(result);
  }
  sheet.getRange(1, 6).setValue(
    (SIDUR_DRY ? 'הרצה יבשה: ' : 'ביצוע: ') + moved + ' לביצוע, ' + skipped + ' ממתינים, ' + failed + ' נכשלו');
}

// ---------------------------------------------------------------
// 3. אשפה: רק מה שבלשונית "לאשפה". תיקייה "ריקה" נבדקת שוב לפני כן.
// ---------------------------------------------------------------
function ashpa() {
  const sheet = SpreadsheetApp.openById(MAP_ID).getSheetByName('לאשפה');
  const rows = sheet.getDataRange().getValues();
  let done = 0, kept = 0, failed = 0;
  for (let i = 1; i < rows.length; i++) {
    const type = String(rows[i][1]).trim();
    const group = String(rows[i][2]).trim();
    const id = String(rows[i][3]).trim();
    if (!id) continue;
    let result;
    try {
      const item = type === 'תיקייה' ? DriveApp.getFolderById(id) : DriveApp.getFileById(id);
      if (item.isTrashed()) result = 'כבר באשפה';
      else if (group === 'תיקייה ריקה' && (item.getFiles().hasNext() || item.getFolders().hasNext())) {
        result = 'נשאר: כבר לא ריקה'; kept++;
      } else { item.setTrashed(true); result = 'הועבר לאשפה'; done++; }
    } catch (e) { result = 'נכשל: ' + e.message; failed++; }
    sheet.getRange(i + 1, 5).setValue(result);
  }
  sheet.getRange(1, 5).setValue('אשפה: ' + done + ' הועברו, ' + kept + ' נשארו, ' + failed + ' נכשלו');
}

// ---------------------------------------------------------------
// 4. מלאי: כל עץ התיקיות ללשונית "מלאי". קורא בלבד.
// ---------------------------------------------------------------
function malai() {
  const MAX_FILE_DEPTH = 2;
  const start = Date.now();
  const rows = [];
  let cut = false;
  function walk(folder, path, depth) {
    if (Date.now() - start > 300000) { cut = true; return; }
    const subs = [], files = [];
    const it = folder.getFolders(); while (it.hasNext()) subs.push(it.next());
    const fi = folder.getFiles(); while (fi.hasNext()) files.push(fi.next());
    rows.push([depth, path, 'תיקייה', subs.length, files.length, '',
      Utilities.formatDate(folder.getLastUpdated(), 'Asia/Jerusalem', 'yyyy-MM-dd'), folder.getId()]);
    if (depth <= MAX_FILE_DEPTH) files.forEach(function (f) {
      rows.push([depth + 1, path + ' / ' + f.getName(), 'קובץ', '', '', Math.round(f.getSize() / 1024),
        Utilities.formatDate(f.getLastUpdated(), 'Asia/Jerusalem', 'yyyy-MM-dd'), f.getId()]);
    });
    subs.sort(function (a, b) { return a.getName() < b.getName() ? -1 : 1; })
      .forEach(function (s) { walk(s, path + ' / ' + s.getName(), depth + 1); });
  }
  Object.keys(TARGETS).sort().forEach(function (n) { walk(DriveApp.getFolderById(TARGETS[n]), n, 0); });
  writeTab(SpreadsheetApp.openById(MAP_ID), 'מלאי',
    [[cut ? 'נקטע אחרי 5 דקות, המלאי חלקי' : 'מלאי מלא', '', '', '', '', '', '', ''],
     ['עומק', 'נתיב', 'סוג', 'תתי-תיקיות', 'קבצים', 'גודל (KB)', 'עודכן', 'מזהה']].concat(rows));
}

function writeTab(ss, title, rows) {
  const sheet = ss.getSheetByName(title) || ss.insertSheet(title, ss.getSheets().length);
  sheet.clear();
  sheet.setRightToLeft(true);
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange(1, 1, 1, rows[0].length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}
