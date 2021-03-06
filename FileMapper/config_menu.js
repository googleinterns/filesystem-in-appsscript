/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Creates a menu entry in the Google Spreadsheet UI when the document is
 * opened.
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createMenu('Local File Mapping')
      .addItem('Edit Mapping', 'DisplayConfigTable')
      .addItem('Run Tests', 'displayTestResults')
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
  SpreadsheetApp.getUi().showModalDialog(html, 'Config Table');
}

/**
 * Imports the specified file content into the current file
 * Used to seperate the CSS and Script content into seperate files
 * 
 * @param {string} filename Filename of the external html content that is to be
 *     included
 * @return {string} External HTML content
 */
function getHtmlContentFromFile(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
 * This technique keeps Picker from needing to show its own authorization
 * dialog, but is only possible if the OAuth scope that Picker needs is
 * available in Apps Script.
 *
 * @return {string} The user's OAuth 2.0 access token.
 */
function getOAuthToken() {
  // The function includes an unused call to a DriveApp method to ensure that 
  // Apps Script requests access to all files in the user's Drive.
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}
