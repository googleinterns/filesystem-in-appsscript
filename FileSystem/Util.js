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
 * Helper function to obtain localPath type
 * @param {string} localPath File or directory localPath
 * @return {string} File System type enumeration
 */
function getFileSystemType(localPath) {
  if (windowsPathRegExp.test(localPath)) {
    return FileSystemType.WINDOWS;
  } else if (unixPathRegExp.test(localPath)) {
    return FileSystemType.UNIX;
  }
  throw new Error('Unknown FileSystem');
}

/**
 * Helper function to sanitize local filesystem localPath.
 * Remove trailing file separator
 * @todo Fix file separator depending on FileSystem type
 * @body sanitize "C:\Users/Desktop\" to "C:\Users\Desktop"
 * @param {string} localPath File or directory localPath
 * @returns {string} Path with trailing file separator
 */
function sanitizePath(localPath) {
  var fileSystemType = getFileSystemType(localPath);
  var windowsPrefix = 'C:\\';
  // Remove trailing slash (file separator) from file localPaths
  if (fileSystemType == FileSystemType.WINDOWS) {
    // Remove trailing \ in C:\something\
    if (localPath.length > windowsPrefix.length && localPath.substr(-1) == '\\') {
      localPath = localPath.slice(0, -1);
    }
  } else if (fileSystemType == FileSystemType.UNIX) {
    // Remove trailing / in /Users/
    if (localPath.length > 1 && localPath.substr(-1) == '/') {
      localPath = localPath.slice(0, -1);
    }
  }
  return localPath;
}
