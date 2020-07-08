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
 * Configure QUnit
 */
QUnit.config({
  title: 'File System',
  requireExpects: false,
  hidepassed: false,
});
QUnit.urlParams({});
/**
 * Registers QUnit helpers globally
 * Imports the following functions:
 * ok, equal, notEqual, deepEqual, notDeepEqual, strictEqual,
 * notStrictEqual, throws, module, test, asyncTest, expect
 */
QUnit.helpers(this);

/**
 * HTML Test Report Generation Handler
 * @param {object} e The event parameter for a simple get trigger.
 */
function doGet(e) {
  QUnit.urlParams(e.parameter);
  QUnit.load(testFunctions);

  return QUnit.getHtml();
}

/**
 * Generates test report as PDF
 * @todo Migrate generateTestReport to use runCustomTests
 * @body runCustomTests has better logging
 */
function generateTestReport() {
  var fileName = 'FileSystem - Report.pdf';
  QUnit.load(testFunctions);
  // Run tests and generate html output
  var htmlOutput = QUnit.getHtml();
  htmlOutput.setWidth(1200);
  htmlOutput.setHeight(800);
  // Display test results
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, fileName);
  // Save test results in Google Drive
  var blob = htmlOutput.getBlob();
  var pdf = blob.getAs('application/pdf');
  DriveApp.createFile(pdf).setName(fileName);
}

function testFunctions() {
  FileMapper.clearAllMappingsInConfig();
  Workbook.setActiveWorkbookPath('c:\\user\\desktop');
  setupTestEnvironment();
  workbook_run_all_tests();
  file_io_run_all_tests();
  file_mapper_run_all_tests();
  directory_manager_run_all_tests();
}

function setupTestEnvironment() {
  var folder1 = 'c:\\User\\Desktop\\folder1';
  var folder2 = 'c:\\User\\Desktop\\folder2';
  try {
    FileMapper.deleteFolder(folder1);
  } catch (e) {
    // Do Nothing
  }
  try {
    FileMapper.deleteFolder(folder2);
  } catch (e) {
    // Do Nothing
  }
  var originalFolder1 = 'c:\\User\\Desktop\\original\\folder1';
  var originalFolder2 = 'c:\\User\\Desktop\\original\\folder2';
  FileMapper.copyFolder(originalFolder1, 'c:\\User\\Desktop');
  FileMapper.copyFolder(originalFolder2, 'c:\\User\\Desktop');
}

// Callback when module starts
QUnit.moduleStart(function(property) {
  spreadsheetLogger.logColumn++;  // New module, increase indentation
  spreadsheetLogger.log(property.name + ' - Test Module Start');
  SpreadsheetApp.flush();
});
// Callback when module is finished
QUnit.moduleDone(function(property) {
  spreadsheetLogger.log(property.name + ' - Test Module End');
  spreadsheetLogger.logColumn--;  // Module finished, decrease indentation
  SpreadsheetApp.flush();
});
// Callback when assertion is fired
QUnit.log(function(property) {
  var message = 'Assertion ' + property.message + ' ' + property.result;
  spreadsheetLogger.log(message, 2);
});
// Callback when test is finished
QUnit.testDone(function(property) {
  spreadsheetLogger.log('Test Done ' + property.name, 1);
  SpreadsheetApp.flush();
});

/**
 * Runs custom tests - Loads the selected tests into QUnit. Runs setup and
 * teardown functions as needed. Logs the output into the spreadsheet. Final
 * report is rendered as a Modal Dialog.
 * @param {object} selectedTests Selected tests metadata object
 */
function runCustomTests(selectedTests) {
  spreadsheetLogger.reset();
  var fileSystemTests = getFileSystemTests();
  // Function to load all selected tests
  function testFunctions() {
    loadSelectedTests(fileSystemTests, selectedTests, 'FileSystem');
  };
  QUnit.load(testFunctions);  // Load tests
  // Run tests and generate html output
  var htmlOutput = QUnit.getHtml();
  htmlOutput.setWidth(1200);
  htmlOutput.setHeight(800);
  // Display test results
  var fileName = 'FileSystem - Report';
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, fileName);
}

/**
 * Helper function to recursively load selected tests
 * @param {object} fileSystemTests Filesystem Tests object
 * @param {object} selectedTests Selected tests metadata object
 * @param {string} name Name of current test module
 */
function loadSelectedTests(fileSystemTests, selectedTests, name) {
  // Run Setup if present
  if (fileSystemTests.setup) {
    spreadsheetLogger.log(name + ' - Setup', 1);
    SpreadsheetApp.flush();
    fileSystemTests.setup();
  }
  // Load selected tests
  for (test in selectedTests) {
    if (typeof (fileSystemTests.tests[test]) == 'function') {
      fileSystemTests.tests[test]();  // Load Test Function
    } else {
      // Load module test
      spreadsheetLogger.logColumn++;
      loadSelectedTests(fileSystemTests.tests[test], selectedTests[test], test);
      spreadsheetLogger.logColumn--;
    }
  }
  // Run Tear down if present
  if (fileSystemTests.teardown) {
    fileSystemTests.teardown();
  }
}

// State variable for current running test module
var currentRunningTestModule = null;

/**
 * Helper function to get fileSystems tests.
 * @todo Migrate tests for FileIO, DirectoryManager, Workbook modules
 * @return {object} File System Tests
 */
function getFileSystemTests() {
  var FileSystemTests = {
    setup: setupTestEnvironment,
    tests: {'File Mapper': fileMapperTests}
  };
  return FileSystemTests;
}