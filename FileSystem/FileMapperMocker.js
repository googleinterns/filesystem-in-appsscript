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
var USE_FILEMAPPER_MOCKER = true;

/**
 * Mocks the FileMapper module. To be replaced with complete implementation.
 * The mocker has a map of hardcoded file path to google drive file id mappings.
 */
var VBAFileMapperMocker = {
  mappings: {
    'c:\\User\\Desktop\\marks.xlsx':
        '1i3M1cYfubmXnosn5LJQmHCghBzhPBrDjBQszkWvZkxA',
    'c:\\User\\Desktop\\attendance.xlsx':
      '1bJb_KzRHW9nqYLa0N1GqMNoWZIOwxIb-TxYlIrk1NSs',
    'c:\\User\\Desktop\\FileLengthTest.txt':
      '19_gNX5lpHdcqHI8x0xxTy2pZJacrPvhR',
  },
  getFileId: function(currentDirectory, path, type) {
    if (path in this.mappings) {
      return this.mappings[path];
    }
    throw new Error(path + ' not mapped!');
  },
  registerFile: function(currentDirectory, path, fileId) {
    this.mappings[path] = fileId;
  },
  hasMapping: function(currentDirectory, path, type) {
    return path in this.mappings;
  },
};

function createFile(currentDirectory, path, mimeType) {
  var fileId = DriveApp.createFile(path, '', mimeType).getId();
  FileMapper.registerFile(FileSystem.currentDirectory, path, fileId);
  return fileId;
}

/**
 * Mocks the FileMapper module. The mocker is implemented as we need a way to
 * test the FileSystem APIs before the FileMapper is ready. This is to be
 * replaced with complete implementation. This mocker implements all the
 * functionality as per the design of the FileMapper. The primary difference is
 * that there is no config file, instead there is a hardcoded base directory.
 * All file paths have to contain this base directory as prefix. The mocker does
 * NOT do the following things 1) Check MimeType, Permissions 2) Check for
 * duplicate files 3) Throw errors as per design (because we are not doing
 * checks) 4) Prompt user in case file is not found
 */
var VBAFileMapperMocker2 = {
  baseDirectory: 'c:\\user\\desktop',
  getFileId: getFileId,
  getFolderId: getFolderId,
  hasFile: hasFile,
  hasFolder: hasFolder,
  deleteFile: deleteFile2,
  deleteFolder: deleteFolder,
  createFile: createFile2,
  createFolder: createFolder,
  moveFile: moveFile,
  moveFolder: moveFolder,
  copyFile: copyFile,
  copyFolder: copyFolder,
  findFilesByPattern: findFilesByPattern,
  findFoldersByPattern: findFoldersByPattern,
  getRelativePathSplit: getRelativePathSplit,
  getBaseDriveFolder: getBaseDriveFolder,
};

var FileMapper = USE_FILEMAPPER_MOCKER ? VBAFileMapperMocker2 : VBAFileMapper;

/**
 * Get File API
 * Gets the file id of a local file
 * @param {string} localPath Local filepath of the file
 * @return {string} File id of the local file
 */
function getFileId(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  // Find folder containing local file
  for (var i = 0; i < pathSplit.length - 1; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      throw new Error('File not found');
    }
    root = folderIterator.next();
  }
  // Obtain the file
  var fileIterator = root.getFilesByName(pathSplit[pathSplit.length - 1]);
  if (!fileIterator.hasNext()) {
    throw new Error('File not found');
  }
  // Return file id
  return fileIterator.next().getId();
}

/**
 * Get Folder API
 * Gets the folder id of a local folder
 * @param {string} localPath Local filepath of the folder
 * @return {string} Folder id of the local folder
 */
function getFolderId(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  // Find the directory
  for (var i = 0; i < pathSplit.length; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      throw new Error('Folder not found');
    }
    root = folderIterator.next();
  }
  return root.getId();
}

/**
 * Has File API
 * Checks if the local file exists
 * @param {string} localPath Local filepath of the file
 * @return {boolean} true if the local file exists
 */
function hasFile(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  // Search for directory containing the file
  for (var i = 0; i < pathSplit.length - 1; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      return false;
    }
    root = folderIterator.next();
  }
  // Check if file exists
  var fileIterator = root.getFilesByName(pathSplit[pathSplit.length - 1]);
  if (!fileIterator.hasNext()) {
    return false;
  }
  return true;
}

/**
 * Has Folder API
 * Checks if the local folder exists
 * @param {string} localPath Local filepath of the folder
 * @return {boolean} true if the local folder exists
 */
function hasFolder(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  // Search for folder
  for (var i = 0; i < pathSplit.length; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      return false;
    }
    root = folderIterator.next();
  }
  return true;
}

/**
 * Delete File API
 * Deletes local file if it exists
 * @param {string} localPath Local filepath of the file
 */
function deleteFile2(localPath) {
  try {
    var id = this.getFileId(localPath);
    DriveApp.getFileById(id).setTrashed(true);
  } catch (e) {
  }
}

/**
 * Delete Folder API
 * Deletes local folder if it exists
 * @param {string} localPath Local filepath of the folder
 */
function deleteFolder(localPath) {
  try {
    var id = this.getFolderId(localPath);
    DriveApp.getFolderById(id).setTrashed(true);
  } catch (e) {
  }
}

/**
 * Create file API
 * The API creates intermediate folders if required.
 * Currently, the MimeType is set to PLAIN_TEXT
 * @todo Set FileMapper Mocker MimeType by file extension
 * @body Infer MimeType from file extension. If no extension is provided, assume
 * PLAIN_TEXT
 * @param {string} localPath Local file path of the file
 * @return {string} File Id of the newly created file
 */
function createFile2(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  for (var i = 0; i < pathSplit.length - 1; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      root = root.createFolder(pathSplit[i]);
    } else {
      root = folderIterator.next();
    }
  }
  var fileName = pathSplit[pathSplit.length - 1];
  // Create file and return file id
  return root.createFile(fileName, MimeType.PLAIN_TEXT).getId();
}

/**
 * Create folder API
 * The API creates intermediate folders if required.
 * @param {string} localPath Local file path of the folder
 * @return {string} Folder Id of the newly created folder
 */
function createFolder(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  for (var i = 0; i < pathSplit.length; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      root = root.createFolder(pathSplit[i]);
    } else {
      root = folderIterator.next();
    }
  }
  return root.getId();
}

/**
 * Move file API
 * API moves all files to the target folder. Apps Script does
 * not have a move API. Move is implemented by making a copy
 * and deleting the original file.
 * @param {Array} sourceFilePaths List of local files to be moved
 * @param {string} targetFolderPath Destination folder path
 */
function moveFile(sourceFilePaths, targetFolderPath) {
  var targetFolderId;
  // Get folder, if it doesn't exist then create it
  try {
    targetFolderId = this.getFolderId(targetFolderPath);
  } catch (e) {
    targetFolderId = this.createFolder(targetFolderPath);
  }
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  // Move all files
  for (var i = 0; i < sourceFilePaths.length; i++) {
    var fileId = this.getFileId(sourceFilePaths[i]);
    var file = DriveApp.getFileById(fileId);
    file.makeCopy(file.getName(), targetFolder);
    file.setTrashed(true);
  }
}

/**
 * Move folder API
 * API moves all folders to the target folder. Apps Script does
 * not have a move API. Move is implemented by making a copy
 * and deleting the original folder. Apps Script does not have a
 * direct copy folder API as well, a copy is done recursively
 * @param {Array} sourceFilePaths List of local folders to be moved
 * @param {string} targetFolderPath Destination folder path
 */
function moveFolder(sourceFilePaths, targetFolderPath) {
  var targetFolderId;
  // Get folder, if it doesn't exist then create it
  try {
    targetFolderId = this.getFolderId(targetFolderPath);
  } catch (e) {
    targetFolderId = this.createFolder(targetFolderPath);
  }
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  // Move all folders
  for (var i = 0; i < sourceFilePaths.length; i++) {
    var folderId = this.getFolderId(sourceFilePaths[i]);
    var folder = DriveApp.getFolderById(folderId);
    var destination = targetFolder.createFolder(folder.getName());
    copyFolderUtil(folder, destination);
    folder.setTrashed(true);
  }
}

/**
 * Copy file API
 * API copies all files to the target folder.
 * @param {Array} sourceFilePaths List of local files to be copied
 * @param {string} targetFolderPath Destination folder path
 */
function copyFile(sourceFilePaths, targetFolderPath) {
  var targetFolderId;
  // Get folder, if it doesn't exist then create it
  try {
    targetFolderId = this.getFolderId(targetFolderPath);
  } catch (e) {
    targetFolderId = this.createFolder(targetFolderPath);
  }
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  // Copy all files
  for (var i = 0; i < sourceFilePaths.length; i++) {
    var fileId = this.getFileId(sourceFilePaths[i]);
    var file = DriveApp.getFileById(fileId);
    file.makeCopy(file.getName(), targetFolder);
  }
}

/**
 * Copy folder API
 * API copies all folders to the target folder. Apps Script does not have a
 * direct copy folder API, folder copy is done recursively
 * @param {Array} sourceFilePaths List of local folders to be copied
 * @param {string} targetFolderPath Destination folder path
 */
function copyFolder(sourceFilePaths, targetFolderPath) {
  var targetFolderId;
  // Get folder, if it doesn't exist then create it
  try {
    targetFolderId = this.getFolderId(targetFolderPath);
  } catch (e) {
    targetFolderId = this.createFolder(targetFolderPath);
  }
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  // Copy all folders
  for (var i = 0; i < sourceFilePaths.length; i++) {
    var folderId = this.getFolderId(sourceFilePaths[i]);
    var folder = DriveApp.getFolderById(folderId);
    var destination = targetFolder.createFolder(folder.getName());
    copyFolderUtil(folder, destination);
  }
}

/**
 * Recursively copy source folder to target folder
 * @param {Folder} source Source Folder
 * @param {Folder} target Target Folder
 */
function copyFolderUtil(source, target) {
  var folders = source.getFolders();
  var files = source.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    file.makeCopy(file.getName(), target);
  }
  while (folders.hasNext()) {
    var subFolder = folders.next();
    var folderName = subFolder.getName();
    var targetFolder = target.createFolder(folderName);
    copyFolderUtil(subFolder, targetFolder);
  }
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
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  // Get parent directory of file
  for (var i = 0; i < pathSplit.length - 1; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      return [];
    }
    root = folderIterator.next();
  }
  var pattern = pathSplit[pathSplit.length - 1];
  // Generate regex expression
  var patternRegex = generateRegexFromPattern(pattern);
  var fileIterator = root.getFiles();
  var matches = [];
  // Search for files matching pattern
  while (fileIterator.hasNext()) {
    var file = fileIterator.next();
    if (patternRegex.test(file.getName())) {
      matches.push(file.getName());
    }
  }
  return matches;
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
  // Get platform agnostic relative path split
  var pathSplit = this.getRelativePathSplit(localPath);
  // Get base directory
  var root = this.getBaseDriveFolder();
  // Get parent directory of file
  for (var i = 0; i < pathSplit.length - 1; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      return [];
    }
    root = folderIterator.next();
  }
  // Generate regex matching pattern
  var pattern = pathSplit[pathSplit.length - 1];
  var patternRegex = generateRegexFromPattern(pattern);
  var folderIterator = root.getFolders();
  var matches = [];
  // Search for folders matching the pattern
  while (folderIterator.hasNext()) {
    var folder = folderIterator.next();
    if (patternRegex.test(folder.getName())) {
      matches.push(folder.getName());
    }
  }
  return matches;
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
    throw new Error('Base Directory does not match');
  }
  // Find relative path from base directory
  var pathSplit = localPath.substr(prefixLength).split(/\\|\//);
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
 * Generates requivalent Regex expression of pattern
 * containing wildcards for folder/filename
 * @param {string} pattern Pattern containing wildcards
 * @return {RegExp} Equivalent Regular expression of the pattern
 */
function generateRegexFromPattern(pattern) {
  var regex = '';
  for (var i = 0; i < pattern.length; i++) {
    if (pattern[i] == '*') {
      // Allow any number of valid characters
      regex += '[^<>\\\\/:"\\|\\?\\*]*';
    } else if (pattern[i] == '?') {
      // Allow any one valid character
      regex += '[^<>\\\\/:"\\|\\?\\*]?';
    } else if (pattern[i] == '.') {
      // Escape . character
      regex += '\\.';
    } else {
      regex += pattern[i];
    }
  }
  // Expression matches full string
  regex = '^' + regex + '$';
  return new RegExp(regex);
}
