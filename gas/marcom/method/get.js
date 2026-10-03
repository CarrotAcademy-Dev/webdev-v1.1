function doGet(e) {
  const action = e.parameter.action;

  // GET DATA
  if (action === 'get-interview') return getInterview();
  if (action === 'get-utils-ticketing-external') return getUtilsTicketingExternal();
  if (action === 'get-utils-ticketing-internal') return getUtilsTicketingInternal();
  if (action === 'get-prospektif') return getProspektif();
  if (action === 'get-prospektif-staging') return getProspektifStaging();
  if (action === 'get-track-ticket-fme') return getTrackTicketFme();
  if (action === 'get-cek-folder-dropbox') return getCekFolderDropbox();
  if (action === 'get-dashboard-daily') return getDashboardDaily();


  return ContentService.createTextOutput(
    JSON.stringify({ status: 'error', message: 'Action tidak dikenali' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}