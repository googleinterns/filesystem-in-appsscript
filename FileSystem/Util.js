/**
 * Utility function to open URL in a new tab
 * @param {string} url The url to be opened
 * @param {string} message The message to be displayed in a dialog box
 */
function openURL(url, message) {
  message = message || 'Open Url in new tab';

  // Lock is required to prevent parallel
  // processes from opening multiple dialogs
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(10000);
    var htmlOutput = HtmlService.createHtmlOutput(
      '<script>window.open("' + url + '", "_blank");</script>'
    )
      .setWidth(350)
      .setHeight(25);
    SpreadsheetApp.getUi().showModelessDialog(htmlOutput, message);

    // Open in new tab takes some time.
    // Therefore we need to hold the lock for some time.
    Utilities.sleep(3000);
    lock.releaseLock();
  } catch (e) {
    Logger.log('Could not obtain lock after 10 seconds.');
    throw new Error('Could not obtain lock after 10 seconds.');
  }
}

/**
 * Utility function to delete all files by given name
 * @param {string} name Name of file to delete
 */
function deleteFile(name) {
  var fileList = DriveApp.getFilesByName(name);
  while (fileList.hasNext()) {
    DriveApp.removeFile(fileList.next());
  }
}

/**
 * Computes the Drive path for a file/folder using their Id
 * @param {string} id The drive destination Id whose path needs to be computed
 * @return {string} The corresponding drive path
 */
function getAbsoluteDrivePath(id, isFile) {
  var current;

  if (isFile) {
    current = DriveApp.getFileById(id);
  } else {
    current = DriveApp.getFolderById(id);
  }

  var folders = [];
  var parentIterator = current.getParents();

  while (parentIterator.hasNext()) {
    var parent = parentIterator.next();
    folders.push(parent.getName());
    parentIterator = parent.getParents();
  }

  var drivePath = folders.reverse().join('/') + '/' + current.getName();
  return drivePath;
}

/**
 * File System Type Enumeration
 */
var FileSystemType = {
  WINDOWS: 'windows',
  UNIX: 'unix',
};

/**
 * @todo Write tests for validation
 * @body Tests will be written in the directory API module as these are more closely related to that module.
 */
// Regex expressions to validate absolute paths
var windowsPathRegExp = /^[\w]\:(\\|(\\[^<>\\/:"\|\?\*]+)+)\\?$/;
var unixPathRegExp = /^(\/[^<>\\/:"\|\?\*]+)*\/?$/;

/**
 * Validates if path is a valid absolute Windows/Unix path
 * @param {string} path File or Directory path
 * @return {boolean} true if path is a valid Windows/Unix path
 */
function isValidAbsolutePath(path) {
  return windowsPathRegExp.test(path) || unixPathRegExp.test(path);
}

/**
 * Helper function to obtain path type
 * @param {string} path File or directory path
 * @return {string} File System type enumeration
 */
function getFileSystemType(path) {
  if (windowsPathRegExp.test(path)) {
    return FileSystemType.WINDOWS;
  } else if (unixPathRegExp.test(path)) {
    return FileSystemType.UNIX;
  }
  throw new Error('Unknown FileSystem');
}

/**
 * Helper function to santize local filesystem path.
 * Remove trailing file separator
 * @todo Fix file separator depending on FileSystem type
 * @body santize "C:\Users/Desktop\" to "C:\Users\Desktop"
 * @param {string} path File or directory path
 * @returns {string} Path with trailing file separator
 */
function santizePath(path) {
  var fileSystemType = getFileSystemType(path);
  var windowsPrefix = 'C:\\';
  // Remove trailing slash (file separator) from file paths
  if (fileSystemType == FileSystemType.WINDOWS) {
    // Remove trailing \ in C:\something\
    if (path.length > windowsPrefix.length && path.substr(-1) == '\\') {
      path = path.slice(0, -1);
    }
  } else if (fileSystemType == FileSystemType.UNIX) {
    // Remove trailing / in /Users/
    if (path.length > 1 && path.substr(-1) == '/') {
      path = path.slice(0, -1);
    }
  }
  return path;
}
