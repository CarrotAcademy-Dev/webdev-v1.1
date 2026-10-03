// Cek Folder Dropbox — monitoring upload file siswa
// Sumber: file().marcom → sheet "Cek Folder Dropbox" (A:C)
// Header: Nama | Target | Checklist

var DROPBOX_LINK = 'https://www.dropbox.com/scl/fo/iqb0388z0td4w8gyaf8p3/AGNSIM05Vm4X5md2CB2fjiY?rlkey=0vlokebarxmu9lurad966k6wy&st=pcelkw50&dl=0';

// GET — baca data folder dropbox
function getCekFolderDropbox() {
  const db_sheet = SpreadsheetApp.openById(file().marcom).getSheetByName('Cek Folder Dropbox');
  const lastRow = db_sheet.getLastRow();
  if (lastRow < 2) return jsonOut({ status: 'success', data: [], notes: _notesDropbox() });

  const values = db_sheet.getRange('A2:C' + lastRow).getValues();
  let data = [];

  for (let i = 0; i < values.length; i++) {
    const [nama, target, checklist] = values[i];
    if (!nama) continue;
    data.push({
      row: i + 2,
      nama: nama,
      target: target,
      checklist: checklist === true || checklist === 'TRUE'
    });
  }

  return jsonOut({ status: 'success', data: data, notes: _notesDropbox() });
}

// Notes info dropbox
function _notesDropbox() {
  return '✨ UPLOAD FILE KE MASING MASING FOLDER SISWA DI BAWAH INI: ' + DROPBOX_LINK;
}

// POST edit — kolom A (Nama) tidak boleh diedit, B (Target) bebas, C (Checklist) hanya TRUE/FALSE
function editCekFolderDropbox(e) {
  const db_sheet = SpreadsheetApp.openById(file().marcom).getSheetByName('Cek Folder Dropbox');
  const p = e.parameter;
  const rowIndex = Number(p.row);

  if (!rowIndex || rowIndex < 2) {
    return jsonOut({ status: 'failed', message: 'row tidak valid.' });
  }

  let updated = [];

  // kolom B (Target) — bebas diisi
  if (p.target !== undefined) {
    db_sheet.getRange(rowIndex, 2).setValue(p.target);
    updated.push('target');
  }

  // kolom C (Checklist) — hanya TRUE/FALSE
  if (p.checklist !== undefined) {
    const val = String(p.checklist).toUpperCase();
    if (val !== 'TRUE' && val !== 'FALSE') {
      return jsonOut({ status: 'failed', message: 'checklist hanya boleh TRUE atau FALSE.' });
    }
    db_sheet.getRange(rowIndex, 3).setValue(val === 'TRUE');
    updated.push('checklist');
  }

  if (updated.length === 0) {
    return jsonOut({ status: 'failed', message: 'Tidak ada kolom yang diupdate. Gunakan parameter target atau checklist.' });
  }

  return jsonOut({ status: 'success', message: 'Data berhasil diupdate.', row: rowIndex, updated: updated });
}