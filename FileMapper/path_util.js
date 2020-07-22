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
 * Path Utilities
 */
var PathUtil = {
  checkIfUnixPath : checkIfUnixPath,
  getFirstSlash : getFirstSlash,
  getLastSlash : getLastSlash,
  joinPath : joinPath,
  splitPath : splitPath,
  getExtension : getExtension,
  createNewMovedPath : createNewMovedPath
};

/**
 * Check if a local path is unix path or not
 *
 * @param {String} path The local path which is to be checked
 * @return {boolean} True if it is a Unix path,
 *                   False otherwise
 */
function checkIfUnixPath(path) {
  return (SharedLibrary.getFileSystemType(path) === FileSystemType.UNIX);
}

/**
 * Get the index of the first slash in the path
 *
 * @param {String} path The local path which is to be checked
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @return {Integer} index The index of the first slash in the local path
 */
function getFirstSlash(path, isUnix) {
  var fileSeparator = (isUnix) ? '/' : '\\';
  var index = path.indexOf(fileSeparator);
  return index;
}

/**
 * Get the index of the last slash in the path
 *
 * @param {String} path The local path which is to be checked
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @return {Integer} index The index of the last slash in the local path
 */
function getLastSlash(path, isUnix) {
  var fileSeparator = (isUnix) ? '/' : '\\';
  var index = path.lastIndexOf(fileSeparator);
  return index;
}

/**
 * Join relative path and current directory path using file seperator
 *
 * @param {String} curDirPath The current directory path
 * @param {String} relativePath The relative path
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @return {String} path The joined path
 */
function joinPath(curDirPath, relativePath, isUnix) {
  var fileSeparator = (isUnix) ? '/' : '\\';
  var path;
  if (relativePath.length === 0) {
    path = curDirPath;
  } else {
    path = curDirPath + fileSeparator + relativePath;
  }
  return path;
}

/**
 * Split a path into indivisual components
 *
 * @param {String} path The local path
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @return {StringArray} The array containing names of all folders and file in
 *     the path
 */
function splitPath(path, isUnix) {
  var fileSeparator = (isUnix) ? '/' : '\\';
  return path.split(fileSeparator);
}

/**
 * Get the extension from the file path
 *
 * @param {String} path The local path
 * @return {String} extension The extension of the local path
 */
function getExtension(path) {
  var index = path.lastIndexOf(".");
  var extension = "";
  if (index != -1) {
    extension = path.substr(index + 1);
  }
  return extension;
}

/**
 * Creates the new path of a file/folder when it is moved from source to target
 */
function createNewMovedPath(targetDirectoryPath, sourcePath) {
  var isUnixForTarget = PathUtil.checkIfUnixPath(targetDirectoryPath);
  var fileSeparator = (isUnixForTarget) ? '/' : '\\';

  var isUnixForSource = PathUtil.checkIfUnixPath(sourcePath);
  var index = PathUtil.getLastSlash(sourcePath, isUnixForSource);
  var destinationName = sourcePath;
  if (index != -1) {
    destinationName = sourcePath.substr(index + 1);
  }

  var newPath = targetDirectoryPath + fileSeparator + destinationName;
  return newPath;
}
