/**
 * CIS Grid — anonymous research collector
 *
 * Receives one record per interview session from cisgrid.org and appends it to a
 * Google Sheet. It never receives names, emails, IP addresses or free text: only
 * the thirty 0–3 ratings, the six dimension averages, the funnel status and a
 * random session identifier generated in the respondent's browser.
 *
 * SETUP
 * 1. Create a Google Sheet. Copy its ID from the URL:
 *    https://docs.google.com/spreadsheets/d/<THIS_IS_THE_ID>/edit
 * 2. Extensions → Apps Script. Delete the default code and paste this file.
 * 3. Fill SHEET_ID and SECRET below. SECRET must be a long random string, and
 *    must match CONFIG.COLLECTOR_KEY in index.html.
 * 4. Deploy → New deployment → type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Copy the /exec URL into CONFIG.COLLECTOR_URL in index.html.
 * 5. Re-deploy (Manage deployments → edit → new version) after any change here.
 */

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID';
const SECRET   = 'PASTE_A_LONG_RANDOM_STRING';

const HEADER = ['received_at','session_id','started_at','status','last_dimension',
                'questions_answered','downloaded','overall','browser_lang','referrer']
  .concat(['D1','D2','D3','D4','D5','D6'])
  .concat(Array.from({length:30}, function(_, i){ return 'q' + (i + 1); }));

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ok:false, error:'empty'});
    const d = JSON.parse(e.postData.contents);

    // Shared secret: keeps the sheet from being polluted by anyone who finds the URL.
    if (d.secret !== SECRET) return json({ok:false, error:'unauthorized'});

    const sheet = getSheet_();
    const row = buildRow_(d);

    // One row per session. If this session already wrote a row (e.g. completion,
    // then again after the report download, or after resuming an abandoned run),
    // update that same row in place instead of appending a new one.
    const sid = String(d.sessionId || '');
    const existing = sid ? findRowBySession_(sheet, sid) : 0;
    if (existing > 0) {
      sheet.getRange(existing, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return json({ok:true, updated: existing > 0});
  } catch (err) {
    return json({ok:false, error:String(err)});
  }
}

function buildRow_(d) {
  const scores = Array.isArray(d.scores) ? d.scores : [];
  const dims   = Array.isArray(d.dims)   ? d.dims   : [];
  const row = [
    new Date(),
    String(d.sessionId || ''),
    String(d.startedAt || ''),
    String(d.status || ''),
    String(d.lastDimension || ''),
    Number(d.questionsAnswered || 0),
    d.downloaded === true,
    d.overall === '' ? '' : Number(d.overall),
    String(d.lang || ''),
    String(d.referrer || '')
  ];
  for (var i = 0; i < 6;  i++) row.push(dims[i]   === undefined ? '' : dims[i]);
  for (var j = 0; j < 30; j++) row.push(scores[j] === undefined ? '' : scores[j]);
  return row;
}

// Returns the 1-based row number whose session_id (column B) matches sid, or 0 if none.
function findRowBySession_(sheet, sid) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const ids = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === sid) return i + 2;
  }
  return 0;
}

function doGet() {
  return json({ok:true, service:'CIS Grid collector'});
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('responses');
  if (!sheet) sheet = ss.insertSheet('responses');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Manual test. Select "testWrite" in the editor's function menu and click Run.
 * If it creates a "responses" tab with a TEST row, SHEET_ID is correct and the
 * write path works. If it errors, the error tells you what to fix (usually SHEET_ID).
 */
function testWrite() {
  const sheet = getSheet_();
  sheet.appendRow([new Date(), 'TEST', 'manual', 'completed', 'D1', 5, false, 1.23, 'it', 'test']);
  Logger.log('Wrote a TEST row to spreadsheet: ' + sheet.getParent().getName());
}
