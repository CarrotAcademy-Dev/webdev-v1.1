// Track Ticket From Me — baca tiket internal milik divisi Marcom
// Sumber: file().db_ticketing → sheet "Database Ticketing (Internal)" (A:P)
// Filter: kolom J = "Marcom"

function getTrackTicketFme() {
  const db_sheet = SpreadsheetApp.openById(file().db_ticketing).getSheetByName('Database Ticketing (Internal)');
  const lastRow = db_sheet.getLastRow();
  if (lastRow < 2) return jsonOut({ status: 'success', data: [] });

  const headers = db_sheet.getRange('A1:P1').getValues()[0];
  const values = db_sheet.getRange('A2:P' + lastRow).getValues();
  let data = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    // kolom J (index 9) = divisi pengirim
    if (String(row[9]).trim().toLowerCase() !== 'marcom') continue;

    let obj = { row: i + 2 };
    for (let h = 0; h < headers.length; h++) {
      const key = String(headers[h]).trim().toLowerCase().replace(/[\s\/]+/g, '_');
      let val = row[h];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      }
      obj[key] = val;
    }
    data.push(obj);
  }

  return jsonOut({ status: 'success', data: data });
}