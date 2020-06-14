/**
 * Creates a menu entry in the Google Docs UI when the sheet is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Config Table')
    .addItem('Open', 'DisplayConfigTable')
    .addToUi();
}

/**
 * Opens a form in the document containing the add-on's user interface.
 */
function DisplayConfigTable() {
  var html = HtmlService.createTemplateFromFile('config_table')
    .evaluate()
    .setWidth(1000)
    .setHeight(425);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Config Table');
}

/**
 * Imports the specified file content into the current file
 * Used to seperate the CSS and Script content into seperate files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

/**
 * Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
 * This technique keeps Picker from needing to show its own authorization
 * dialog, but is only possible if the OAuth scope that Picker needs is
 * available in Apps Script. In this case, the function includes an unused call
 * to a DriveApp method to ensure that Apps Script requests access to all files
 * in the user's Drive.
 *
 * @return {string} The user's OAuth 2.0 access token.
 */
function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}


