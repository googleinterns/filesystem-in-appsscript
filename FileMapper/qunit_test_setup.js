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
* QUnit Config Object
*/
var myConfig = ({
  title: 'File Mapper API',  // Sets the title of the test page.
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
  // Ensures that QUnit-specific HTTP parameters are handled when you interact with the QUnit GUI 
  QUnit.urlParams(e.parameter);
  QUnit.config(myConfig);
  QUnit.load(tests_all_APIs);

  return QUnit.getHtml();
};

/**
 * Generates test results upon execution of a menu add-on
 */
function displayTestResults() {
  // Setup the tests
  QUnit.urlParams({});
  QUnit.config(myConfig);
  QUnit.load(run_all_tests);

  // Run the tests
  var html = QUnit.getHtml().setWidth(1000).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'File Mapper Unit Tests');
}


/**
 * Created a test folder named Root with different files and folders in My Drive for testing all the APIs
 *                                            Root
 *            _________________________________|_____________________________________
 *           |                     |                          |                      |
 *       Folder1                Folder2                    Folder3                 Folder4
 *     ____|___                    |                          |                 _____|________
 *    |        |                   |                          |-File31.docx    |             |
 *  Folder11   |-File11.xls        |                          |-File32.xls    File41.xls   Folder41
 *             |-File12.docx       |                          |-File33.docx                   |
 *                 ________________|__________________                                     Folder411
 *                |                |                  |                                       |
 *            Folder21         Folder22           Folder23                                File4111.xls 
 *               |            _____|____              |
 *          File211.docx     |          |          Folder231
 *                       Folder221      |-File221.xls
 *                                      |-File222.xls
 */  
function run_all_tests() {
  TestUtil.clearAllMappingsInConfig();

  tests_all_APIs_for_windows();
  tests_all_APIs_for_unix();
}

/**
 * Function containing all the Windows File System tests
 */
function tests_all_APIs_for_windows() {
  TestUtil.setWindowsTestingEnvironment();

  add_mapping_api_windows_tests();
  get_pattern_matches_api_windows_tests();
  get_drive_id_api_windows_tests();
  has_file_api_windows_tests();
  create_file_api_windows_tests();
  delete_file_api_windows_tests();
  move_file_api_windows_tests();
  copy_file_api_windows_tests();
}

/**
 * Function containing all the Unix File System tests
 */
function tests_all_APIs_for_unix() {
  TestUtil.setUnixTestingEnvironment();

  add_mapping_api_unix_tests();
  get_pattern_matches_api_unix_tests();
  get_drive_id_api_unix_tests();
  has_file_api_unix_tests();
  create_file_api_unix_tests();
  delete_file_api_unix_tests();
  move_file_api_unix_tests();
  copy_file_api_unix_tests();
}
