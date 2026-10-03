function doPost(e) {
  const action = e.parameter.action;

  // POST DATA
  if (action === 'get-tugas-interview')        return getTugasInterview(e);
  if (action === 'tambah-tugas-interview')     return tambahTugasInterview(e);
  if (action === 'ticketing-internal')           return getDataTicketingInternal(e);
  if (action === 'track-ticket-fme')             return trackTicketFromMe(e);
  if (action === 'create-ticketing-internal')    return createTicketingInternal(e);
  if (action === 'create-ticketing-external')    return createTicketExternal(e);
  if (action === 'ceklis-ticketing-internal')    return doneTicketingInternal(e);
  if (action === 'tambah-prospektif')            return tambahProspektif(e);
  if (action === 'edit-prospektif')              return editProspektif(e);
  if (action === 'delete-prospektif')            return deleteProspektif(e);
  if (action === 'send-prospektif-to-cso')       return sendProspektifToCso(e);
  if (action === 'edit-cek-folder-dropbox')      return editCekFolderDropbox(e);

  return ContentService.createTextOutput(
    JSON.stringify({ status: 'error', message: 'Aksi tidak dikenali.' })
  ).setMimeType(ContentService.MimeType.JSON);
}