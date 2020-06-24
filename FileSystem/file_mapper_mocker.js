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
 * Flag variable to toggle using FileMapper mocker
 */
var USE_FILEMAPPER_MOCKER = false;

/**
 * Mocks the FileMapper module. The mocker is implemented as we need a way to
 * test the FileSystem APIs before the FileMapper is ready. This is to be
 * replaced with complete implementation. This mocker implements all the
 * functionalities as per the design of the FileMapper. The primary difference
 * is that there is no config file, instead there is a hardcoded base directory.
 * All file paths have to contain this base directory as prefix. The mocker does
 * NOT do the following things 1) Check MimeType, Permissions 2) Check for
 * duplicate files 3) Throw errors as per design (because we are not doing
 * checks) 4) Prompt user in case file is not found
 */
var VBAFileMapperMocker = {
  baseDirectory: 'c:\\user\\desktop',
  getFileId: getFileId,
  getFolderId: getFolderId,
  hasFile: hasFile,
  hasFolder: hasFolder,
  deleteFile: deleteFile,
  deleteFolder: deleteFolder,
  createFile: createFile,
  createFolder: createFolder,
  moveFile: moveFile,
  moveFolder: moveFolder,
  copyFile: copyFile,
  copyFolder: copyFolder,
  findFilesByPattern: findFilesByPattern,
  findFoldersByPattern: findFoldersByPattern,
  getRelativePathSplit: getRelativePathSplit,
  getBaseDriveFolder: getBaseDriveFolder,
  addFileMapping: addFileMapping,
  addFolderMapping: addFolderMapping,
  clearAllMappingsInConfig: clearAllMappingsInConfig,
};

var FileMapper = USE_FILEMAPPER_MOCKER ? VBAFileMapperMocker : VBAFileMapper;

/**
 * Get File API
 * Gets the file id of a local file
 * @param {string} localPath Local filepath of the file
 * @return {string} File id of the local file
 */
function getFileId(localPath) {
  var fileId = getFileIdHelper(localPath);
  if (fileId == null) {
    throw new Error(localPath + ' not found');
  }
  return fileId;
}

/**
 * Has File API
 * Checks if the local file exists
 * @param {string} localPath Local filepath of the file
 * @return {boolean} true if the local file exists
 */
function hasFile(localPath) {
  var fileId = getFileIdHelper(localPath);
  return fileId != null;
}

/**
 * Get Folder API
 * Gets the folder id of a local folder
 * @param {string} localPath Local filepath of the folder
 * @return {string} Folder id of the local folder
 */
function getFolderId(localPath) {
  var folderId = getFolderIdHelper(localPath);
  if (folderId == null) {
    throw new Error(localPath + ' not found');
  }
  return folderId;
}

/**
 * Has Folder API
 * Checks if the local folder exists
 * @param {string} localPath Local filepath of the folder
 * @return {boolean} true if the local folder exists
 */
function hasFolder(localPath) {
  var folderId = getFolderIdHelper(localPath);
  return folderId != null;
}

/**
 * Delete File API
 * Deletes local file if it exists
 * @param {string} localPath Local filepath of the file
 */
function deleteFile(localPath) {
  var id = this.getFileId(localPath);
  DriveApp.getFileById(id).setTrashed(true);
}

/**
 * Delete Folder API
 * Deletes local folder if it exists
 * @param {string} localPath Local filepath of the folder
 */
function deleteFolder(localPath) {
  var id = this.getFolderId(localPath);
  DriveApp.getFolderById(id).setTrashed(true);
}

/**
 * Create file API
 * The API creates intermediate folders if required.
 * Currently, the MimeType is set to PLAIN_TEXT
 * @param {string} localPath Local file path of the file
 * @return {string} File Id of the newly created file
 */
function createFile(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get directory
  var root = getFinalFolder(pathSplit);
  var fileName = pathSplit[pathSplit.length - 1];
  return root.createFile(fileName, MimeType.PLAIN_TEXT).getId();
}

/**
 * Create folder API
 * @param {string} localPath Local file path of the folder
 * @return {string} Folder Id of the newly created folder
 */
function createFolder(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get directory
  var root = getFinalFolder(pathSplit);
  var folderName = pathSplit[pathSplit.length - 1];
  return root.createFolder(folderName).getId();
}

/**
 * Move file API
 * API moves file to the target folder. Apps Script does
 * not have a move API. Move is implemented by making a copy
 * and deleting the original file.
 * @param {string} sourceFilePath Local file to be moved
 * @param {string} targetFolderPath Destination folder path
 */
function moveFile(sourceFilePath, targetFolderPath) {
  cloneFile(sourceFilePath, targetFolderPath, true);
}

/**
 * Copy file API
 * API copies file to the target folder.
 * @param {string} sourceFilePath Local file to be copied
 * @param {string} targetFolderPath Destination folder path
 */
function copyFile(sourceFilePath, targetFolderPath) {
  cloneFile(sourceFilePath, targetFolderPath, false);
}

/**
 * Move folder API
 * API moves folder to the target folder. Apps Script does
 * not have a move API. Move is implemented by making a copy
 * and deleting the original folder. Apps Script does not have a
 * direct copy folder API as well, a copy is done recursively
 * @param {string} sourceFilePath Local folder to be moved
 * @param {string} targetFolderPath Destination folder path
 */
function moveFolder(sourceFilePath, targetFolderPath) {
  cloneFolder(sourceFilePath, targetFolderPath, true);
}

/**
 * Copy folder API
 * API copies folder to the target folder. Apps Script does not have a
 * direct copy folder API, folder copy is done recursively
 * @param {string} sourceFilePath Local folder to be copied
 * @param {string} targetFolderPath Destination folder path
 */
function copyFolder(sourceFilePath, targetFolderPath) {
  cloneFolder(sourceFilePath, targetFolderPath, false);
}

/**
 * Find files by pattern API
 * This API searches for files which match the given pattern consisting
 * of wildcards. Wildcard ? matches with any one valid character.
 * Wildcard * matches with one or more valid characters
 * @param {string} localPath Local file path of the file
 * @return {Array} List of files matching the pattern
 */
function findFilesByPattern(localPath) {
  return findByPattern(localPath, true);
}

/**
 * Find folders by pattern API
 * This API searches for folders which match the given pattern consisting
 * of wildcards. Wildcard ? matches with any one valid character.
 * Wildcard * matches with one or more valid characters
 * @param {string} localPath Local file path of the folder
 * @return {Array} List of folders matching the pattern
 */
function findFoldersByPattern(localPath) {
  return findByPattern(localPath, false);
}

/**
 * Helper function to extract path relative to base directory.
 * Throws an error if the localPath is not relative to base directory.
 * Function returns platform agnostic path split.
 * @param {string} localPath Local file path of the file or folder
 * @return {Array} platform agnostic path split
 */
function getRelativePathSplit(localPath) {
  localPath = localPath.toLowerCase();  // Convert to lower case
  var prefixLength = this.baseDirectory.length;
  var prefix = localPath.substr(0, prefixLength);
  // Check if path has base directory as prefix
  if (prefix != this.baseDirectory) {
    throw new Error(prefix + ' is not the base Directory prefix');
  }
  // Find relative path from base directory
  var pathSplit = localPath.substr(prefixLength).split(fileSeparatorRegExp);
  // Remove any empty strings (required to handle trailing file separators)
  pathSplit = pathSplit.filter(function(el) {
    return el != '';
  });
  return pathSplit;
}

/**
 * Get the folder containing the active document. This is used as the
 * starting folder for all file/folder searches
 * @return {Folder} The folder containing the active document
 */
function getBaseDriveFolder() {
  var id = SpreadsheetApp.getActive().getId();
  var file = DriveApp.getFileById(id);
  return file.getParents().next();
}

/**
 * @param {string} localPath Local file path of the file to be mapped
 * @param {string} driveId Drive Id of the file
 */
function addFileMapping(localPath, driveId) {
  // Do nothing in mocker
}

/**
 * @param {string} localPath Local file path of the folder to be mapped
 * @param {string} driveId Drive Id of the folder
 */
function addFolderMapping(localPath, driveId) {
  // Do nothing in mocker
}

/**
 * Helper function to clear all mappings in config.
 */
function clearAllMappingsInConfig() {
  // Do nothing in mocker
}
