/**
 * Emulates workbook.Open(filename) API 
 * Opens the corresponding spreadsheet in a new new tab. 
 *
 * @param {string} url The url to be opened
 * @param {string} message The message to be displayed in a dialog box
 * 
 * @return {Spreadsheet} The spreadsheet object of the path
 */
function openURL(url, message = "Open Url in new tab") {
  
  // Lock is required to prevent parallel
  // processes from open multiple dialogs
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(10000);
    var htmlOutput = HtmlService
    .createHtmlOutput(`<script>window.open("${url}", "_blank");</script>`)
    .setWidth(350)
    .setHeight(25);
    SpreadsheetApp.getUi().showModelessDialog(htmlOutput, message);
    
    // Open in new tab takes some time. 
    // Therefore we need to hold the lock for some time.
    Utilities.sleep(3000);
    lock.releaseLock();
  } catch (e) {
    Logger.log('Could not obtain lock after 10 seconds.');
    throw Error('Could not obtain lock after 10 seconds.');
  }
}