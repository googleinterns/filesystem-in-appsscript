/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function onOpen() {
  SpreadsheetApp.getUi() 
      .createMenu('File Mapping')
      .addItem('Open', 'DisplayFileMapping')
      .addToUi();
}


/**
 * Opens a form in the document containing the add-on's user interface.
 */
function DisplayFileMapping() {
  var html = HtmlService.createHtmlOutputFromFile('fileuploadform')
      .setWidth(600)
      .setHeight(425);
  SpreadsheetApp.getUi() 
      .showModalDialog(html, 'Upload a file to Google Drive');
}


/**
 * Gets the blob data, mimetype and filename and decodes the data back 
 * from base64, then create a blob from all of these and then create a 
 * file in the drive
 *
 * @param {string} data The base64 encoded file data.
 * @param {string} mimetype The required mimetype of the file.
 * @param {string} filename The required filename for the file. 
 * @return {string} string containing the drive url of the file created.
 */
function processForm(data, mimetype, filename) {
  var filedata = Utilities.base64Decode(data);
  var blob = Utilities.newBlob(filedata);
  
  var driveFile = {
    title: filename,
    mimeType: mimetype
  };
  
  var index = filename.lastIndexOf(".");
  var extension = "";
  if(index != -1){
    extension = filename.substr(index + 1);
  }
  
  if(extension === "xls" || extension === "xlsx"){
    driveFile = Drive.Files.insert(driveFile, blob, {
      convert: true
    });
  }
  else{
    driveFile = Drive.Files.insert(driveFile, blob);
  }
  driveFile = DriveApp.getFolderById(driveFile.id);
  
  return driveFile.getUrl();
}
