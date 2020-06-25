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
 */
function generateTestReport() {
  var fileName = 'FileSystem - Report.pdf';

  QUnit.urlParams({});
  QUnit.load(testFunctions);

  var content = QUnit.getHtml().getContent();

  var blob = Utilities.newBlob(content, 'text/html', 'text.html');
  var pdf = blob.getAs('application/pdf');

  DriveApp.createFile(pdf).setName(fileName);
}

function testFunctions() {
  setupTestEnvironment();
  workbook_run_all_tests();
  file_io_run_all_tests();
  file_mapper_run_all_tests();
}

function setupTestEnvironment() {
  try {
    FileMapper.deleteFolder('c:\\User\\Desktop\\folder1');
  } 
  catch (e) {
    // Do Nothing
  }
  try {
    FileMapper.deleteFolder('c:\\User\\Desktop\\folder2');
  }
  catch (e) {
    // Do Nothing
  }
  FileMapper.copyFolder(
      [
        'c:\\User\\Desktop\\original\\folder1',
        'c:\\User\\Desktop\\original\\folder2'
      ],
      'c:\\User\\Desktop');
}