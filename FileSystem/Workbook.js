/**
 * Emulates VBA File System
 * @todo separate out workbook APIs from FileSystem APIs
 * @todo implement currentDirectory
 */
var FileSystem = {
  currentDirectory: '<ToBeDefined>',
  openWorkbook: openWorkbook,
};

/**
 * Emulates workbook.Open(filename) API
 * Opens the corresponding spreadsheet in a new tab.
 * @param {string} path The local file path of the Excel file
 * @return {Spreadsheet} The spreadsheet object of the path
 */
function openWorkbook(path) {
  var fileId = FileMapper.getFileId(
    this.currentDirectory,
    path,
    MimeType.GOOGLE_SHEETS
  );
  var file = SpreadsheetApp.openById(fileId);
  openURL(file.getUrl(), file.getName() + ' file open in new tab');
  return file;
}
