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
 * Utility function to open URL in a new tab. Dialog box automatically opens URL
 * in a new tab. However, if pop ups are blocked, this will not work. In that
 * case, the url is displayed and the user can open the page in a new tab by
 * clicking on the URL.
 * @param {string} url The url to be opened
 * @param {string} message The message to be displayed in a dialog box
 */
function openURL(url, message) {
  message = message || 'Open Url in new tab';
  // Create dialog
  var htmlTemplate = HtmlService.createTemplateFromFile('open_url_dialog');
  htmlTemplate.url = url;
  var htmlOutput = htmlTemplate.evaluate().setHeight(25).setWidth(350);
  // Display dialog to the user
  SpreadsheetApp.getUi().showModelessDialog(htmlOutput, message);
  // Open in new tab takes some time.
  // Therefore we need to hold the lock for some time.
  Utilities.sleep(3000);
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

// Regex expressions to validate absolute paths
var windowsPathRegExp = /^[\w]\:(\\|(\\[^<>\\/:"\|\?\*]+)+)\\?$/;
var unixPathRegExp = /^(\/[^<>\\/:"\|\?\*]+)*\/?$/;

// Regex Expression to test if path is absolute
var absolutePathRegExp = /^(\/|\w:)/

// Regex Expression to match file separator - / or \
var fileSeparatorRegExp = /\\|\//;

// Regex Expression to test for wild cards
var wildCardRegExp = /[\*?]/;

/**
 * Validates if path is a valid absolute Windows/Unix path
 * @param {string} path File or Directory path
 * @return {boolean} true if path is a valid Windows/Unix path
 */
function isValidAbsolutePath(path) {
  return windowsPathRegExp.test(path) || unixPathRegExp.test(path);
}

/**
 * Checks if path is an absolute path. Does not check for validity.
 * Required when path is not sanitized and when path contains wildcards.
 * @param {string} path File or Directory path
 * @return {boolean} true if path is an absolute path
 */
function isAbsolutePath(path) {
  return absolutePathRegExp.test(path);
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
  throw new Error('Unknown FileSystem: ' + localPath);
}

/**
 * Helper function to sanitize local filesystem localPath. Removes trailing file
 * separator. Replaces forward slashes with backward slashes when using Windows
 * File System. Replaces backward slashes with forward slashes when using Linux
 * File System.
 * @param {string} localPath File or directory localPath
 * @param {string} fileSystemType File System Type - Unix/Windows
 * @returns {string} Path with trailing file separator
 */
function sanitizePath(localPath, fileSystemType) {
  var windowsPrefix = 'C:\\';
  if (fileSystemType == FileSystemType.WINDOWS) {
    // Replace any forward slashes with backward slashes
    localPath = localPath.replace(/\//g, '\\');
  } else if (fileSystemType == FileSystemType.UNIX) {
    // Replace any backward slashes with forward slashes
    localPath = localPath.replace(/\\/g, '/');
  }
  // Remove trailing slash (file separator) from file localPaths
  if (fileSystemType == FileSystemType.WINDOWS) {
    // Remove trailing \ in C:\something\
    if (localPath.length > windowsPrefix.length &&
        localPath.substr(-1) == '\\') {
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

/**
 * @todo Implement relative path validation (regex)
 * @body Currently only absolute paths are being validated
 * Function to get absolute path given relative path (for local file system)
 * If the relative path is absolute, then the relative path itself is returned
 * @param {string} currentDirectory Absolute path of current local directory
 * @param {string} relativePath Relative or Absolute path
 * @return {string} Absolute Path
 */
function getAbsoluteLocalPath(currentDirectory, relativePath) {
  // Test if relativePath is actually an absolute path
  var fileSystemType = DirectoryManager.getFileSystemType();
  if (isValidAbsolutePath(relativePath)) {
    return sanitizePath(relativePath, fileSystemType);
  }
  var fileSeparator = fileSystemType == FileSystemType.UNIX ? '/' : '\\';
  // First element of windows path split is drive letter ("C:") and
  // First element of unix path split is empty string ("")
  var pathSplit = currentDirectory.split(fileSeparatorRegExp);
  var relativePathSplit = relativePath.split(fileSeparatorRegExp);

  for (var i = 0; i < relativePathSplit.length; i++) {
    if (relativePathSplit[i] == '.') {
      continue;  // Current directory, do nothing
    } else if (relativePathSplit[i] == '..') {
      // Move up one directory if possible
      if (pathSplit.length > 1) {
        pathSplit.pop();
      }
    } else {
      // Move down to child directory
      pathSplit.push(relativePathSplit[i]);
    }
  }
  // Reconstruct absolute file path
  var absolutePath = pathSplit.join(fileSeparator);
  // If path is root path, i.e. "C:\" or "/" then we need to
  // add a trailing separator
  if (pathSplit.length == 1) {
    absolutePath += fileSeparator;
  }
  return sanitizePath(absolutePath, fileSystemType);
}

/**
 * Helper function to delete a file if it exists.
 * This is intended to be used for cleanup
 * @param {string} localPath Local file path of the file to be deleted
 */
function deleteFileIfExists(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  try {
    FileMapper.deleteFile(localPath);
  } catch (e) {
    // File doesn't exist, do nothing
  }
}

/**
 * Helper function to delete a folder if it exists.
 * This is intended to be used for cleanup in testing
 * @param {string} localPath Local file path of the folder to be deleted
 */
function deleteFolderIfExists(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  try {
    FileMapper.deleteFolder(localPath);
  } catch (e) {
    // Folder doesn't exist, do nothing
  }
};

/**
 * Get parent directory file path. This method returns a path that
 * is one directory above localPath
 * @param {string} localPath Local file path
 * @return {string} Parent directory file path
 */
function getParentFolderPath(localPath) {
  return getAbsoluteLocalPath(localPath, '..');
};

/**
 * Helper function to empty a folder if it exists. Create a new empty folder if
 * it doesn't This is intended to be used for cleanup in testing
 * @param {string} localPath Local file path of the folder to be deleted
 */
function emptyFolder(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  deleteFolderIfExists(localPath);
  FileMapper.createFolder(localPath);
};
