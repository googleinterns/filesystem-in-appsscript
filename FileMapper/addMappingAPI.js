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
 * API to add a new file mapping to the config
 *
 * @param {String} localPath The local file path
 * @param {String} driveId The corresponding drive file Id
 * @return {boolean} True if file mapping has been added,
 *                   False otherwise
 */
function addFileMapping(localPath, driveId) {
  return addMappingUtil(localPath, driveId, true);
}

/**
 * API to add a new folder mapping to the config
 *
 * @param {String} localPath The local folder path
 * @param {String} driveId The corresponding drive folder Id
 * @return {boolean} True if folder mapping has been added,
 *                   False otherwise
 */
function addFolderMapping(localPath, driveId) {
  return addMappingUtil(localPath, driveId, false);
}

/**
 * Utility function to add a new mapping to the config
 *
 * @param {String} localPath The local destination path
 * @param {String} driveId The corresponding drive destination Id
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {boolean} True if mapping has been added,
 *                   False otherwise
 */
function addMappingUtil(localPath, driveId, isFile) {
  if (!checkIfAbsolutePath(localPath)) {
    // Not an absolute path error
    return false;
  }

  if (!ApiUtil.checkIfValidDriveId(driveId, isFile)) {
    // Invalid driveId error
    return false;
  }

  if (ConfigUtil.checkMappingExists(localPath)) {
    // If the localpath is already mapped to some drive file
    return false;
  }

  ApiUtil.addNewMappingToConfig(localPath, driveId, isFile);
  return true;
}

/**
 * Check if the given path is a windows
 * or Unix's absolute path or not
 *
 * @param {String} path The path to be checked
 * @return {boolean} True if it is an absolute path,
 * False otherwise
 */
// needs to be shared from satvik
function checkIfAbsolutePath(path) {
  if (path.length == 0) {
    return false;
  }

  var forwardSlash = path.match(/\//g);
  forwardSlash = (forwardSlash === null) ? 0 : forwardSlash.length;

  if (forwardSlash > 0) {
    return (path[0] == '/');
  } else {
    return (path.length >= 3 && path[0].toLowerCase() == "c" &&
            path[1] == ':' && path[2] == '\\');
  }
}