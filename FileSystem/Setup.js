/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
    .addItem('Start', 'showSidebar')
    .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the documen-t containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('Workbook.open');
  SpreadsheetApp.getUi().showSidebar(ui);
}

/**
 * Configure QUnit
 */
QUnit.config({
  title: "File System",
  requireExpects: true,
  hidepassed: true,
  cssUrl: "https://raw.github.com/jquery/qunit/master/qunit/qunit.css"
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
    title: "File System" // Sets the title of the test page.
  });
  QUnit.load(testFunctions);

  return QUnit.getHtml();
};