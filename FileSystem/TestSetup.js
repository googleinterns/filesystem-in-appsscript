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
  QUnit.config({
    title: 'File System', // Sets the title of the test page.
  });
  QUnit.load(testFunctions);

  return QUnit.getHtml();
}

/**
 * Generates test report as PDF
 */
function generateTestReport() {
  var fileName = 'FileSystem - Report';
  deleteFile(fileName);
  // Setup tests
  QUnit.urlParams({});
  QUnit.config({
    title: 'File System', // Sets the title of the test page.
  });
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
  // workbook_run_all_tests();
  // file_io_run_all_tests();
  directory_manager_run_all_tests();
}
var testList = {
  "Workbook": workbook_run_all_tests,
  "FileIO": file_io_run_all_tests,
  "DirectoryManager": directory_manager_run_all_tests
}
