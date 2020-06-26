/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use VBAFileMapperMocker file except in compliance with the
 * License. You may obtain a copy of the License at
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
 * Get File Helper function
 * Gets the file id of a local file if available. Otherwise returns null.
 * @param {string} localPath Local filepath of the file
 * @return {string} File id of the local file if available, otherwise null
 */
function getFileIdHelper(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = VBAFileMapperMocker.getRelativePathSplit(localPath);
  // Get base directory
  var root;
  try {
    root = getFinalFolder(pathSplit);
  } catch (e) {
    return null;  // No folder found
  }
  // Obtain the file
  var fileIterator = root.getFilesByName(pathSplit[pathSplit.length - 1]);
  if (!fileIterator.hasNext()) {
    return null;
  }
  return fileIterator.next().getId();
}

/**
 * Get Folder Helper function
 * Gets the file id of a local folder if available. Otherwise returns null.
 * @param {string} localPath Local filepath of the folder
 * @return {string} Folder id of the local folder if available, otherwise null
 */
function getFolderIdHelper(localPath) {
  // Get platform agnostic relative path split
  var pathSplit = VBAFileMapperMocker.getRelativePathSplit(localPath);
  // Get base directory
  var root;
  try {
    root = getFinalFolder(pathSplit);
  } catch (e) {
    return null;  // No folder found
  }
  if (pathSplit.length == 0) {
    return root.getId();
  }
  // Obtain the folder
  var folderIterator = root.getFoldersByName(pathSplit[pathSplit.length - 1]);
  if (!folderIterator.hasNext()) {
    return null;
  }
  return folderIterator.next().getId();
}

/**
 * Helper function to get the last but one folder. If the path is
 * 'C:\User\folder\something.txt', VBAFileMapperMocker function will return the
 * folder id to 'C:\User\folder'. Throws an error if folder not found.
 * @param {Array} pathSplit Platform agnostic path split array
 * @return {Folder} Final folder
 */
function getFinalFolder(pathSplit) {
  var root = VBAFileMapperMocker.getBaseDriveFolder();
  for (var i = 0; i < pathSplit.length - 1; i++) {
    var folderIterator = root.getFoldersByName(pathSplit[i]);
    if (!folderIterator.hasNext()) {
      throw new Error('Folder not found');
    } else {
      root = folderIterator.next();
    }
  }
  return root;
}

/**
 * Helper function to get or create a folder if it doesn't exist
 * @param {string} localPath Local file path of the folder
 * @return {Folder} Folder corresponding to the local path
 */
function getOrCreateFolder(localPath) {
  var folderId;
  // Get folder, if it doesn't exist then create it
  try {
    folderId = VBAFileMapperMocker.getFolderId(localPath);
  } catch (e) {
    folderId = VBAFileMapperMocker.createFolder(localPath);
  }
  var folder = DriveApp.getFolderById(folderId);
  return folder;
}

/**
 * Clone file helper function
 * API clones all files to the target folder. Optionally deletes source files.
 * Apps Script does not have a move API. Move is implemented by making a copy
 * and deleting the original file.
 * @param {Array} sourceFilePaths List of local files to be moved
 * @param {string} targetFolderPath Destination folder path
 * @param {boolean} deleteOriginal If true, source files will be deleted
 */
function cloneFiles(sourceFilePaths, targetFolderPath, deleteOriginal) {
  // Get folder, if it doesn't exist then create it
  var targetFolder = getOrCreateFolder(targetFolderPath);
  // Move all files
  for (var i = 0; i < sourceFilePaths.length; i++) {
    var fileId = VBAFileMapperMocker.getFileId(sourceFilePaths[i]);
    var file = DriveApp.getFileById(fileId);
    file.makeCopy(file.getName(), targetFolder);
    if (deleteOriginal) {
      file.setTrashed(true);
    }
  }
}

/**
 * Clone file helper function
 * API clones all folders to the target folder. Optionally deletes source
 * folders. Apps Script does not have a move API. Move is implemented by making
 * a recursive copy and deleting the original folder.
 * @param {Array} sourceFilePaths List of local files to be moved
 * @param {string} targetFolderPath Destination folder path
 * @param {boolean} deleteOriginal If true, source folders will be deleted
 */
function cloneFolder(sourceFolderPaths, targetFolderPath, deleteOriginal) {
  // Get folder, if it doesn't exist then create it
  var targetFolder = getOrCreateFolder(targetFolderPath);
  // Move all folders
  for (var i = 0; i < sourceFolderPaths.length; i++) {
    var folderId = VBAFileMapperMocker.getFolderId(sourceFolderPaths[i]);
    var folder = DriveApp.getFolderById(folderId);
    var destination = targetFolder.createFolder(folder.getName());
    recursiveCopyFolder(folder, destination);
    if (deleteOriginal) {
      folder.setTrashed(true);
    }
  }
}

/**
 * Recursively copy source folder to target folder
 * @param {Folder} source Source Folder
 * @param {Folder} target Target Folder
 */
function recursiveCopyFolder(source, target) {
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
    recursiveCopyFolder(subFolder, targetFolder);
  }
}

/**
 * Find files or folders by pattern helper function
 * VBAFileMapperMocker function searches for  file or folders which match the
 * given pattern consisting of wildcards. Wildcard ? matches with any one valid
 * character. Wildcard * matches with one or more valid characters
 * @param {string} localPath Local file path of the folder
 * @param {boolean} isFile Boolean indicating if localPath is a file
 * @return {Array} List of files/folders matching the pattern
 */
function findByPattern(localPath, isFile) {
  // Get platform agnostic relative path split
  var pathSplit = VBAFileMapperMocker.getRelativePathSplit(localPath);
  // Get base directory
  var root;
  try {
    root = getFinalFolder(pathSplit);
  } catch (e) {
    return [];  // No matches found
  }
  // Generate regex matching pattern
  var pattern = pathSplit[pathSplit.length - 1];
  var patternRegex = generateRegexFromPattern(pattern);
  var iterator = isFile ? root.getFiles() : root.getFolders();
  var matches = [];
  // Search for files/ folders matching the pattern
  while (iterator.hasNext()) {
    var item = iterator.next();
    if (patternRegex.test(item.getName())) {
      matches.push(item.getName());
    }
  }
  return matches;
}

/**
 * Generates equivalent Regex expression of pattern
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