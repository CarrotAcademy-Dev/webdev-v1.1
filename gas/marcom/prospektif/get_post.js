// CRUD Prospektif
// DB utama: file().cso → sheet "Prospektif dari Marcom" (A:H)
// Staging input: file().marcom → sheet "Prospektif" (A:G)

// GET — baca semua data dari DB utama CSO
function getProspektif() {
  const db_sheet = SpreadsheetApp.openById(file().cso).getSheetByName('Prospektif dari Marcom');
  const lastRow = db_sheet.getLastRow();
  if (lastRow < 2) return jsonOut({ status: 'success', data: [] });

  const values = db_sheet.getRange('A2:H' + lastRow).getValues();
  let data = [];

  for (let i = 0; i < values.length; i++) {
    const [timestamp, nama, nomor_hp, first_contact, media, program_yang_tertarik, referral, keterangan] = values[i];
    if (!nama) continue;
    data.push({
      row: i + 2,
      timestamp: timestamp instanceof Date
        ? Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
        : timestamp,
      nama,
      nomor_hp,
      first_contact: first_contact instanceof Date
        ? Utilities.formatDate(first_contact, Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : first_contact,
      media,
      program_yang_tertarik,
      referral,
      keterangan
    });
  }

  return jsonOut({ status: 'success', data: data });
}

// GET STAGING — baca data di Marcom yang belum dikirim ke CSO
function getProspektifStaging() {
  const db_sheet = SpreadsheetApp.openById(file().marcom).getSheetByName('Prospektif');
  const lastRow = db_sheet.getLastRow();
  if (lastRow < 2) return jsonOut({ status: 'success', data: [] });

  const values = db_sheet.getRange('A2:G' + lastRow).getValues();
  let data = [];

  for (let i = 0; i < values.length; i++) {
    const [nama, nomor_hp, first_contact, media, program_yang_tertarik, referral, keterangan] = values[i];
    if (!nama) continue;
    data.push({
      row: i + 2,
      nama,
      nomor_hp,
      first_contact: first_contact instanceof Date
        ? Utilities.formatDate(first_contact, Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : first_contact,
      media,
      program_yang_tertarik,
      referral,
      keterangan
    });
  }

  return jsonOut({ status: 'success', data: data });
}

// POST tambah — langsung masuk ke DB utama CSO, posisi baris dari K2
function tambahProspektif(e) {
  const db_sheet = SpreadsheetApp.openById(file().cso).getSheetByName('Prospektif dari Marcom');
  const p = e.parameter;

  if (!p.nama || !p.nomor_hp) {
    return jsonOut({ status: 'failed', message: 'nama dan nomor_hp wajib diisi.' });
  }

  const startRow = db_sheet.getRange('K2').getValue();
  const newRow = [
    new Date(),
    p.nama || '',
    p.nomor_hp || '',
    p.first_contact || '',
    p.media || '',
    p.program_yang_tertarik || '',
    p.referral || '',
    p.keterangan || ''
  ];

  db_sheet.getRange(startRow, 1, 1, newRow.length).setValues([newRow]);
  return jsonOut({ status: 'success', message: 'Data berhasil ditambahkan.', row: startRow });
}

// POST edit — dinamis pakai columnMap, support single (row + field) dan batch (data = JSON array)
function editProspektif(e) {
  const db_sheet = SpreadsheetApp.openById(file().cso).getSheetByName('Prospektif dari Marcom');
  const params = e.parameter;

  // kolom A (timestamp) tidak boleh diedit
  const columnMap = {
    nama: 2,
    nomor_hp: 3,
    first_contact: 4,
    media: 5,
    program_yang_tertarik: 6,
    referral: 7,
    keterangan: 8
  };

  let updates = [];
  if (params.data) {
    try { updates = JSON.parse(params.data); }
    catch (err) { return jsonOut({ status: 'failed', message: 'Parameter data bukan JSON valid.' }); }
    if (!Array.isArray(updates)) updates = [updates];
  } else {
    updates = [params];
  }

  let hasil = [];
  for (let u = 0; u < updates.length; u++) {
    const item = updates[u];
    const rowIndex = Number(item.row);
    if (!rowIndex || rowIndex < 2) {
      hasil.push({ row: item.row || null, status: 'failed', message: 'row tidak valid.' });
      continue;
    }
    let updated = [], ditolak = [];
    for (let key in item) {
      if (key === 'action' || key === 'row' || key === 'data') continue;
      if (!columnMap[key]) { ditolak.push(key); continue; }
      db_sheet.getRange(rowIndex, columnMap[key]).setValue(item[key]);
      updated.push(key);
    }
    hasil.push(updated.length
      ? { row: rowIndex, status: 'success', updated, ditolak }
      : { row: rowIndex, status: 'failed', message: 'Tidak ada kolom valid.', ditolak });
  }

  return jsonOut({ status: 'success', message: 'Proses edit selesai.', hasil });
}

// POST delete — hapus baris berdasarkan row
function deleteProspektif(e) {
  const db_sheet = SpreadsheetApp.openById(file().cso).getSheetByName('Prospektif dari Marcom');
  const rowIndex = Number(e.parameter.row);

  if (!rowIndex || rowIndex < 2) {
    return jsonOut({ status: 'failed', message: 'row tidak valid.' });
  }

  db_sheet.deleteRow(rowIndex);
  return jsonOut({ status: 'success', message: 'Data berhasil dihapus.' });
}

// POST send to CSO — kirim batch dari staging Marcom ke CSO, lalu clear staging
function sendProspektifToCso(e) {
  const sourceSheet = SpreadsheetApp.openById(file().marcom).getSheetByName('Prospektif');
  const lastRow = sourceSheet.getLastRow();

  if (lastRow < 2) {
    return jsonOut({ status: 'failed', message: 'Tidak ada data di staging.' });
  }

  const values = sourceSheet.getRange('A2:G' + lastRow).getValues();
  const timestamp = new Date();
  const dataToSend = [];

  for (let i = 0; i < values.length; i++) {
    const isEmpty = values[i].every(cell => cell === '' || cell === null);
    if (!isEmpty) dataToSend.push([timestamp].concat(values[i]));
  }

  if (dataToSend.length === 0) {
    return jsonOut({ status: 'failed', message: 'Tidak ada data valid untuk dikirim.' });
  }

  const targetSheet = SpreadsheetApp.openById(file().cso).getSheetByName('Prospektif dari Marcom');
  const startRow = targetSheet.getRange('K2').getValue();

  targetSheet.getRange(startRow, 1, dataToSend.length, dataToSend[0].length).setValues(dataToSend);
  sourceSheet.getRange('A2:G' + lastRow).clearContent();

  return jsonOut({
    status: 'success',
    message: 'Data berhasil dikirim ke CSO.',
    jumlah: dataToSend.length,
    target_start_row: startRow
  });
}