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
  var fileName = 'FileSystem - Report.pdf';
  deleteFile(fileName);

  QUnit.urlParams({});
  QUnit.config({
    title: 'File System', // Sets the title of the test page.
  });
  QUnit.load(testFunctions);

  var content = QUnit.getHtml().getContent();

  var blob = Utilities.newBlob(content, 'text/html', 'text.html');
  var pdf = blob.getAs('application/pdf');

  var file = DriveApp.createFile(pdf).setName(fileName);
  openURL(file.getUrl(), fileName);
}

function testFunctions() {
  workbook_run_all_tests();
  file_io_run_all_tests();
}
