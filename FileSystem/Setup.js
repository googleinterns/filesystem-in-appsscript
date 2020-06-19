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


function createTestSidebar() {
  var template = HtmlService.createTemplateFromFile('TestSystem');
  var tests = {};
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
  buildTestMetadata(getFileSystemTests().tests, tests);
  template.tests = JSON.stringify(tests);
  var htmlOutput = template.evaluate();
  // SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Test System');
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}


function runCustomTests(tests) {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  SpreadsheetApp.flush();
  var logRow = 1;
  var logLevel = 1;

  function log(level, message) {
    sheet.getRange(logRow++, level).setValue(message);
    // SpreadsheetApp.flush();
  }
  QUnit.moduleStart(function(property) {
    logLevel++;
    log(logLevel, property.name + ' - Test Module Start');
    SpreadsheetApp.flush();
  });
  QUnit.moduleDone(function(property) {
    log(logLevel, property.name + ' - Test Module End');
    logLevel--;
    SpreadsheetApp.flush();
  });
  QUnit.log(function(property) {
    log(logLevel + 2, 'Assertion ' + property.message + ' ' + property.result);
  });
  QUnit.testDone(function(property) {
    log(logLevel + 1, 'Test Done ' + property.name);
    SpreadsheetApp.flush();
  });

  var fileSystemTests = getFileSystemTests();
  QUnit.urlParams({});
  function loadTests(fileSystemTests, tests, name, level) {
    level = level || 1;
    // log(level, name + ' - Test Module');
    if (fileSystemTests.setup) {
      log(logLevel + 1, name + ' - Setup');
      SpreadsheetApp.flush();
      fileSystemTests.setup();
    }
    for (test in tests) {
      if (typeof (fileSystemTests.tests[test]) == 'function') {
        // log(level + 1, test + ' - Test');
        fileSystemTests.tests[test]();
      } else {
        loadTests(fileSystemTests.tests[test], tests[test], test, level + 1);
      }
    }
    if (fileSystemTests.teardown) {
      // log(logLevel + 1, name + ' - Tear Down');
      fileSystemTests.teardown();
    }
  }
  var testFunctions =
      loadTests.bind(this, fileSystemTests, tests, 'FileSystem');
  QUnit.load(testFunctions);
  // Run tests and generate html output
  var htmlOutput = QUnit.getHtml();
  htmlOutput.setWidth(1200);
  htmlOutput.setHeight(800);
  // Display test results
  var fileName = 'FileSystem - Report';
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, fileName);
}