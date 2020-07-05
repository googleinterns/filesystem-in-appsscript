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
 * Enumeration for the return value of addMapping API
 */
var ReturnValue = {
  SUCCESS : 0,
  FAILURE : {
    INVALID_ABSOLUTE_PATH : 1,
    INVALID_DRIVE_ID : 2,
    DUPLICATE_MAPPING : 3,
    INCOMPATIBLE_MIMETYPES : 4
  }
}

/**
 * API to add a new file mapping to the config
 *
 * @param {String} localPath The local file path
 * @param {String} driveId The corresponding drive file Id
 * @return {number} SUCCESS if mapping has been added,
 *     FAILURE otherwise
 */
function addFileMapping(localPath, driveId) { 
  return addMappingUtil(localPath, driveId, true); 
}

/**
 * API to add a new folder mapping to the config
 *
 * @param {String} localPath The local folder path
 * @param {String} driveId The corresponding drive folder Id
 * @return {number} SUCCESS if mapping has been added,
 *     FAILURE otherwise
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
 * @return {number} SUCCESS if mapping has been added,
 *     FAILURE otherwise
 */
function addMappingUtil(localPath, driveId, isFile) {
  if (!SharedLibrary.isValidAbsolutePath(localPath)) {
    // Not an absolute path error
    return ReturnValue.FAILURE.INVALID_ABSOLUTE_PATH;
  }

  if (!ApiUtil.checkIfValidDriveId(driveId, isFile)) {
    // Invalid driveId error
    return ReturnValue.FAILURE.INVALID_DRIVE_ID;
  }

  if (CONFIG.checkIfLocalPathExists(localPath)) {
    // If the localpath is already mapped to the provided drive id
    if (ConfigUtil.checkMappingExists(localPath, driveId)) {
      return ReturnValue.SUCCESS;
    }
    // If the localpath is already mapped to some drive file
    return ReturnValue.FAILURE.DUPLICATE_MAPPING;
  }

  if (!ConfigUtil.checkIfMimeTypeMatches(localPath, driveId)) {
    // If mimetype of local and drive files doesn't match
    return ReturnValue.FAILURE.INCOMPATIBLE_MIMETYPES;
  }

  ApiUtil.addNewMappingToConfig(localPath, driveId, isFile);
  return ReturnValue.SUCCESS;
}

/**
 * Check if the given path is a windows or Unix's absolute path or not
 *
 * @param {String} path The path to be checked
 * @return {boolean} True if it is an absolute path,
 *     False otherwise
 */
// needs to be shared from the common library
function checkIfAbsolutePath(path) {
  if (path.length == 0) {
    return false;
  }

  var forwardSlash = path.match(/\//g);
  var forwardSlashCount = (forwardSlash === null) ? 0 : forwardSlash.length;

  if (forwardSlashCount > 0) {
    return (path[0] == '/');
  } else {
    return (path.length >= 3 && path[0].toLowerCase() == "c" &&
            path[1] == ':' && path[2] == '\\');
  }
}
