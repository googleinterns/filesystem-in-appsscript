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
      .createMenu('FileSystem')
      .addItem('Set Local File Path', 'promptActiveWorkbookPath')
      .addItem('Run Tests', 'generateTestReport')
      .addItem('View Tests', 'createTestSidebar')
      .addToUi();
}

function uiSetup() {
  SpreadsheetApp.getUi()
  .createMenu('FileSystem')
  .addItem('Active Spreadsheet Path', 'promptActiveWorkbookPath')
  .addItem('File Config Table', 'DisplayConfigTable')
  .addItem('Reset Config', 'resetConfig')
  .addToUi();
}

function installLibrary(thisObj) {
  thisObj.promptActiveWorkbookPath = promptActiveWorkbookPath;
  thisObj.setActiveWorkbookPath = setActiveWorkbookPath;
  thisObj.DisplayConfigTable = VBAFileMapper.DisplayConfigTable;
  thisObj.Workbook = Workbook;
  thisObj.DirectoryManager = DirectoryManager;
  thisObj.FileIO = FileIO;
  thisObj.resetConfig = resetConfig;
  thisObj.uiSetup = uiSetup;
  thisObj.OpenMode = OpenMode;
  thisObj.LockMode = LockMode;
  thisObj.AccessMode = AccessMode;
}

function resetConfig() {
  FileMapper.clearAllMappingsInConfig();
  resetActiveWorkbookPath(); 
}

/** 
 * FILE MAPPER CONFIG TABLE CALLBACKS 
 */
function getConfigDataToBuildTable() { 
  FileMapper.getConfigDataToBuildTable(); 
}

function getAbsoluteDrivePath(id, isFile) {
  FileMapper.getAbsoluteDrivePath(id, isFile);
}

function checkIfLocalPathExists(localpath) {
  FileMapper.checkIfLocalPathExists(localpath);
}

function addMapping(localPath, drivePath, driveId, isFolder) {
  FileMapper.addMapping(localPath, drivePath, driveId, isFolder);
}

function updateMapping(localPath, drivePath, driveId, isFolder) {
  FileMapper.updateMapping(localPath, drivePath, driveId, isFolder);
}

function deleteMapping(localPath) { 
  FileMapper.deleteMapping(localPath); 
}

/** 
 * FILE MAPPER USER PROMPT CALLBACKS 
 */
function displayFileUploadForm(localPathValue, destinationFolder) {
  FileMapper.displayFileUploadForm(localPathValue, destinationFolder);
}

function showPicker(localPathValue) { 
  FileMapper.showPicker(localPathValue); 
}

function processPickedFile(id, isFolder, localPathValue) {
  FileMapper.processPickedFile(id, isFolder, localPathValue);
}

function processForm(data, mimetype, filename, localPathValue,
                     destinationFolderId) {
  FileMapper.processForm(data, mimetype, filename, localPathValue,
                         destinationFolderId);
}

function getOAuthToken() { 
  FileMapper.getOAuthToken(); 
}

/**
 * Creates the test sidebar with hierarchy of all tests available. User can
 * selectively chose what tests are to be run.
 */
function createTestSidebar() {
  var template = HtmlService.createTemplateFromFile('test_system');
  var tests = {};
  buildTestMetadata(getFileSystemTests().tests, tests);
  template.tests = JSON.stringify(tests);
  var htmlOutput = template.evaluate();
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

/**
 * Helper function to build test metadata for the view.
 * @param {object} tests Source test data
 * @param {object} metadata Destination test metadata
 */
function buildTestMetadata(tests, metadata) {
  for (test in tests) {
    if (typeof (tests[test]) == 'function') {
      metadata[test] = true;
    } else {
      metadata[test] = {};
      buildTestMetadata(tests[test].tests, metadata[test]);
    }
  }
}

/**
 * Helper function to include external HTML content in templated HTML Files
 * @param {string} filename Filename of the external html content that is to be
 *     included
 * @return {string} External HTML content
 */
function getHtmlContentFromFile(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Include Errors from FileSystemLibrary
ActiveWorkbookPathNotFoundException =
    FileSystemLibrary.ActiveWorkbookPathNotFoundException;
// Include Helper functions from FileSystemLibrary
blockFunctionDecorator = FileSystemLibrary.blockFunctionDecorator;
