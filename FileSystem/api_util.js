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

// Boolean flag to enable shared drives
// Some Drive APIs are not supported in shared drives
var ENABLE_SHARED_DRIVES = true;

/**
 * Drive App and FileMapper expose different APIs for file and folder
 * operations. However, the APIs have similar interfaces and functionality. In
 * order to achieve reuse in code, ApiUtil is a helper class which returns File
 * or Folder library object for both DriveApp and FileMapper classes. Abstract
 * Factory Pattern has been used here.
 */
ApiUtil = {};

/**
 * Helper function to get File or Folder FileMapper library object
 * @param {boolean} isFile Flag indicating if the required library is for file
 *     entity
 * @return {object} Library object for FileMapper
 */
ApiUtil.getFileMapper = function(isFile) {
  if (isFile) {
    return FileMapperFileApi;
  } else {
    return FileMapperFolderApi;
  }
};

/**
 * Helper function to get File or Folder DriveApp library object
 * @param {boolean} isFile Flag indicating if the required library is for file
 *     entity
 * @return {object} Library object for DriveApp
 */
ApiUtil.getDriveApi = function(isFile) {
  if (isFile) {
    return DriveAppFileApi;
  } else {
    return DriveAppFolderApi;
  }
};

/**
 * FileMapper File Library object
 */
FileMapperFileApi = {};

/**
 * Has File API
 * Checks if the local file exists
 * @param {string} localPath Local filepath of the file
 * @return {boolean} true if the local file exists
 */
FileMapperFileApi.hasEntity = function(localPath) {
  return FileMapper.hasFile(localPath);
};

/**
 * Get File API
 * Gets the file id of a local file
 * @param {string} localPath Local filepath of the file
 * @return {string} File id of the local file
 */
FileMapperFileApi.getEntityId = function(localPath) {
  return FileMapper.getFileId(localPath);
};

/**
 * Delete File API
 * Deletes local file if it exists
 * @param {string} localPath Local filepath of the file
 */
FileMapperFileApi.deleteEntity = function(localPath) {
  return FileMapper.deleteFile(localPath);
};

/**
 * Copy file API
 * API copies file to the target folder.
 * @param {string} localPath Local file to be copied
 * @param {string} target Destination folder path
 */
FileMapperFileApi.copyEntity = function(localPath, target) {
  return FileMapper.copyFile(localPath, target);
};

/**
 * Move file API
 * API moves file to the target folder.
 * @param {string} localPath Local file to be moved
 * @param {string} target Destination folder path
 */
FileMapperFileApi.moveEntity = function(localPath, target) {
  return FileMapper.moveFile(localPath, target);
};

/**
 * Find files by pattern API
 * This API searches for files which match the given pattern consisting
 * of wildcards. Wildcard ? matches with any one valid character.
 * Wildcard * matches with one or more valid characters
 * @param {string} pattern Local file path of the file
 * @return {Array} List of files matching the pattern
 */
FileMapperFileApi.findByPattern = function(pattern) {
  return FileMapper.findFilesByPattern(pattern);
};

/**
 * FileMapper Folder Library object
 */
FileMapperFolderApi = {};

/**
 * Has Folder API
 * Checks if the local folder exists
 * @param {string} localPath Local filepath of the folder
 * @return {boolean} true if the local folder exists
 */
FileMapperFolderApi.hasEntity = function(localPath) {
  return FileMapper.hasFolder(localPath);
};

/**
 * Get Folder API
 * Gets the folder id of a local folder
 * @param {string} localPath Local filepath of the folder
 * @return {string} Folder id of the local folder
 */
FileMapperFolderApi.getEntityId = function(localPath) {
  return FileMapper.getFolderId(localPath);
};

/**
 * Delete Folder API
 * Deletes local folder if it exists
 * @param {string} localPath Local filepath of the folder
 */
FileMapperFolderApi.deleteEntity = function(localPath) {
  return FileMapper.deleteFolder(localPath);
};

/**
 * Copy folder API
 * API copies folder to the target folder.
 * @param {string} localPath Local folder to be copied
 * @param {string} target Destination folder path
 */
FileMapperFolderApi.copyEntity = function(localPath, target) {
  return FileMapper.copyFolder(localPath, target);
};

/**
 * Move folder API
 * API moves folder to the target folder.
 * @param {string} localPath Local folder to be moved
 * @param {string} target Destination folder path
 */
FileMapperFolderApi.moveEntity = function(localPath, target) {
  return FileMapper.moveFolder(localPath, target);
};

/**
 * Find folders by pattern API
 * This API searches for folders which match the given pattern consisting
 * of wildcards. Wildcard ? matches with any one valid character.
 * Wildcard * matches with one or more valid characters
 * @param {string} pattern Local file path of the folder
 * @return {Array} List of folders matching the pattern
 */
FileMapperFolderApi.findByPattern = function(pattern) {
  return FileMapper.findFoldersByPattern(pattern);
};

/**
 * DriveApp File Library object
 */
DriveAppFileApi = {};

/**
 * Get Drive App File object
 * @param {string} id Drive File Id
 * @return {File} Drive File
 */
DriveAppFileApi.getEntityById = function(id) {
  return DriveApp.getFileById(id);
};

/**
 * Copy Drive File to target folder and set name to new name
 * @param {File} source Drive File object
 * @param {string} name New File Name
 * @param {Folder} target Destination Folder object
 */
DriveAppFileApi.makeCopy = function(source, name, target) {
  source.makeCopy(name, target);
};

/**
 * Move Drive File to target folder and set name to new name
 * @param {File} source Drive File object
 * @param {string} name New File Name
 * @param {Folder} target Destination Folder object
 */
DriveAppFileApi.makeMove = function(source, name, target) {
  if (ENABLE_SHARED_DRIVES) {
    this.makeCopy(source, name, target);
    source.setTrashed(true);
  } else {
    // Does not work in shared folders
    source.getParents().next().removeFile(source);
    target.addFile(source);
    source.setName(name);
  }
};

/**
 * DriveApp Folder Library object
 */
DriveAppFolderApi = {};

/**
 * Get Drive App Folder object
 * @param {string} id Drive Folder Id
 * @return {Folder} Drive Folder
 */
DriveAppFolderApi.getEntityById = function(id) {
  return DriveApp.getFolderById(id);
};

/**
 * Copy Drive Folder to target folder and set name to new name
 * @param {Folder} source Drive Folder object
 * @param {string} name New Folder Name
 * @param {Folder} target Destination Folder object
 */
DriveAppFolderApi.makeCopy = function(source, name, target) {
  target = target.createFolder(name);
  recursiveCopyFolder(source, target);
};

/**
 * Move Drive Folder to target folder and set name to new name
 * @param {Folder} source Drive Folder object
 * @param {string} name New Folder Name
 * @param {Folder} target Destination Folder object
 */
DriveAppFolderApi.makeMove = function(source, name, target) {
  if (ENABLE_SHARED_DRIVES) {
    this.makeCopy(source, name, target);
    source.setTrashed(true);
  } else {
    // Does not work in shared folders
    source.getParents().next().removeFolder(source);
    target.addFolder(source);
    source.setName(name);
  }
};
