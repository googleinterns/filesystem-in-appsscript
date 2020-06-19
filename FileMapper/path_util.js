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
var PathUtil =
    {
      checkIfUnixPath : checkIfUnixPath,
      getFirstSlash : getFirstSlash,
      getLastSlash : getLastSlash,
      joinPath : joinPath,
      splitPath : splitPath,
      getExtension : getExtension
    }

/**
 * Check if a local path is unix path or not
 *
 * @param {String} path The local path which is to be checked
 * @return {boolean} True if it is a Unix path,
 *                   False otherwise
 */
function checkIfUnixPath(path) {
  var forwardSlash = path.match(/\//g);
  return !(forwardSlash === null);
}

/**
 * Get the index of the first slash in the path
 *
 * @param {String} path The local path which is to be checked
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @return {Integer} index The index of the first slash in the local path
 */
function getFirstSlash(path, isUnix) {
  var slash = (isUnix) ? '/' : '\\';
  var index = path.indexOf(slash);
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
  var slash = (isUnix) ? '/' : '\\';
  var index = path.lastIndexOf(slash);
  return index;
}

/**
 * Join relative path and current directory path using slash
 *
 * @param {String} curDirPath The current directory path
 * @param {String} relPath The relative path
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @return {String} path The joined path
 */
function joinPath(curDirPath, relPath, isUnix) {
  var slash = (isUnix) ? '/' : '\\';
  var path;
  if (relPath.length === 0) {
    path = curDirPath;
  } else {
    path = curDirPath + slash + relPath;
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
  var slash = (isUnix) ? '/' : '\\';
  return path.split(slash);
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
