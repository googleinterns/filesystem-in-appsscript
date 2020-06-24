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
 * File System Type Enumeration
 */
var FileSystemType = {
  WINDOWS: 'windows',
  UNIX: 'unix',
};

// Regex expressions to validate absolute paths
var windowsPathRegExp = /^[\w]\:(\\|(\\[^<>\\/:"\|\?\*]+)+)\\?$/;
var unixPathRegExp = /^(\/[^<>\\/:"\|\?\*]+)*\/?$/;

/**
 * Validates if path is a valid absolute Windows/Unix path
 * @param {string} path File or Directory path
 * @return {boolean} true if path is a valid Windows/Unix path
 */
function isValidAbsolutePath(localPath) {
  return windowsPathRegExp.test(localPath) || unixPathRegExp.test(localPath);
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
 * Function to get absolute path given relative path (for local file system)
 * If the relative path is absolute, then the relative path itself is returned
 * @param {string} currentDirectory Absolute path of current local directory
 * @param {string} relativePath Relative or Absolute path
 * @return {string} Absolute Path
 */
function getAbsoluteLocalPath(currentDirectory, relativePath) {
  // Test if relativePath is actually an absolute path
  if (isValidAbsolutePath(relativePath)) {
    return sanitizePath(relativePath);
  }
  var fileSystemType = getFileSystemType(currentDirectory);
  var fileSeparator = fileSystemType == FileSystemType.UNIX ? '/' : '\\';
  // First element of windows path split is drive letter ("C:") and
  // First element of unix path split is empty string ("")
  var pathSplit = currentDirectory.split(fileSeparator);
  var relativePathSplit = relativePath.split(fileSeparator);

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
  // If path is root path, i.e. "C:\" or "/" then we need to add a trailing
  // seperator
  if (pathSplit.length == 1) {
    absolutePath += fileSeparator;
  }
  return sanitizePath(absolutePath);
}

/**
 * Get parent local path for given file or folder path
 * @param {string} localPath Absolute local file path of file or folder
 * @return {string} Absolute local file path of parent folder
 */
function getParentFolderPath(localPath) {
  return getAbsoluteLocalPath(localPath, '..');
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
