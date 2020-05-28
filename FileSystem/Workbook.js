
var FileSystem = {
  current_directory: "<ToBeDefined>",
  api_workbook_open: api_workbook_open_,  
};

/**
 * Emulates workbook.Open(filename) API 
 * Opens the corresponding spreadsheet in a new new tab. 
 *
 * @param {string} path The local file path in the Excel file
 * 
 * @return {Spreadsheet} The spreadsheet object of the path
 */
function api_workbook_open_(path) {
    var fileId = FileMapper.getFileId(this.current_directory, path, MimeType.GOOGLE_SHEETS);
    var file = SpreadsheetApp.openById(fileId);
    openURL(file.getUrl(), `"${file.getName()}" file open in new tab`);
    return file;
}



