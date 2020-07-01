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
 * Workbook APIs
 */
var Workbook = {
  openWorkbook: openWorkbook,
  activeWorkbookPath: '',
  getActiveWorkbookPath: getActiveWorkbookPath,
  setActiveWorkbookPath: setActiveWorkbookPath,
  resetActiveWorkbookPath: resetActiveWorkbookPath
};

/**
 * Emulates workbook.Open(filename) API
 * Opens the corresponding spreadsheet in a new tab.
 * @param {string} path The local file path of the Excel file
 * @return {Spreadsheet} The spreadsheet object of the path
 */
function openWorkbook(path) {
  path = DirectoryManager.getAbsolutePath(path);
  var fileId = FileMapper.getFileId(path);
  var file = SpreadsheetApp.openById(fileId);
  openURL(file.getUrl(), file.getName() + ' file open in new tab');
  return file;
}

/**
 * Prompts the user to provide the local file path for the current
 * active spreadsheet. This can be triggered by the user from the UI
 * to set/update the active workbook path . It can also be triggered
 * when an API asks for the active workbook path and it is not found
 * in which case an error is displayed.
 * @param {boolean} error Error flag indicating whether an error occurred
 */
function promptActiveWorkbookPath(error) {
  // Get current active spreadsheet details
  var driveId = SpreadsheetApp.getActive().getId();
  var path = getAbsoluteDrivePath(driveId, true);
  var pathSplit = path.split('/');
  pathSplit.pop();  // Remove file name from path
  var drivePath = pathSplit.join('/');
  pathSplit.shift();  // Remove "Drive" or "My Drive" from path
  // Generate possible local path
  var localPathPrefix = 'C:\\Documents\\';
  var localPathExample = localPathPrefix + pathSplit.join('\\');
  // Retrieve existing active workbook path if present
  var documentProperties = PropertiesService.getDocumentProperties();
  var localPathValue = documentProperties.getProperty('ActiveWorkbookPath');

  // Create HTML dialog and set template parameters
  var htmlOutput = HtmlService.createTemplateFromFile('WorkbookPathPrompt');
  htmlOutput.drivePath = drivePath;
  htmlOutput.localPathExample = localPathExample;
  htmlOutput.error = error;
  htmlOutput.localPathValue = localPathValue ? localPathValue : '';

  // Display dialog to the user
  htmlOutput = htmlOutput.evaluate().setHeight(200).setWidth(700);
  var title = 'Set Local File-System Path';
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, title);
}

/**
 * Get the active workbook path stored in PropertiesService. An error is thrown
 * and the user is prompted if the active workbook path is not available.
 * @return {string} The active workbook path
 */
function getActiveWorkbookPath(showPrompt) {
  if (!this.activeWorkbookPath) {
    var properties = PropertiesService.getDocumentProperties();
    this.activeWorkbookPath = properties.getProperty('ActiveWorkbookPath');
  }
  if (this.activeWorkbookPath) {
    return this.activeWorkbookPath;
  }
  // path not found, prompt and throw error
  if (showPrompt) {
    promptActiveWorkbookPath(true);
  }
  throw new Error('ActiveWorkbookPath not defined');
}

Workbook.getActiveWorkbookPath = blockFunctionDecorator(Workbook.getActiveWorkbookPath);

/**
 * @todo Register directory mapping with File Mapper
 * @body This mapping is very useful as in most cases this will handle most
 * scenarios Set the active workbook path in PropertyService
 * @param {string} path The active workbook path
 */
function setActiveWorkbookPath(path) {
  if (!isValidAbsolutePath(path)) {
    throw new Error(path + ' is not a valid');
  }
  var fileSystemType = getFileSystemType(path);
  var path = sanitizePath(path, fileSystemType);
  this.activeWorkbookPath = path;
  var properties = PropertiesService.getDocumentProperties();
  properties.setProperty('ActiveWorkbookPath', path);
}

/**
 * Reset the active workbook path.
 */
function resetActiveWorkbookPath() {
  this.activeWorkbookPath = '';
  var properties = PropertiesService.getDocumentProperties();
  properties.deleteProperty('ActiveWorkbookPath');
}
