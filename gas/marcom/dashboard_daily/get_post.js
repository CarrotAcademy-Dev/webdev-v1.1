// Dashboard Daily — data birthday siswa
// Sumber: file().marcom → sheet "_dashboardDaily" (A3:E)
// Header: Nomor | Tanggal Kelas | Nama | Tanggal Lahir | Ket.

// GET — baca data birthday siswa
function getDashboardDaily() {
  const db_sheet = SpreadsheetApp.openById(file().marcom).getSheetByName('_dashboardDaily');
  const lastRow = db_sheet.getLastRow();
  if (lastRow < 4) return jsonOut({ status: 'success', data: [] });

  const values = db_sheet.getRange('A4:E' + lastRow).getValues();
  let data = [];

  for (let i = 0; i < values.length; i++) {
    const [nomor, tanggal_kelas, nama, tanggal_lahir, ket] = values[i];
    if (!nama) continue;
    data.push({
      row: i + 4,
      nomor: nomor,
      tanggal_kelas: tanggal_kelas instanceof Date
        ? Utilities.formatDate(tanggal_kelas, Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : tanggal_kelas,
      nama: nama,
      tanggal_lahir: tanggal_lahir instanceof Date
        ? Utilities.formatDate(tanggal_lahir, Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : tanggal_lahir,
      ket: ket
    });
  }

  return jsonOut({ status: 'success', data: data });
}