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
 * API to copy a file from it’s source location to a destination location.
 * 
 * @param {StringArray} sourceFilePaths An array of Absolute local file paths of 
 *                      the files which are needed to be copied.
 * @param {String} targetFolderPath Absolute local folder path of the folder to which 
 *                 the files are needed to be copied to.
 */
function copyFiles(sourceFilePaths, targetFolderPath) {
  // First find the drive id for the target folder
  var exists = hasFolder(targetFolderPath);
  if(!exists){
    // If the target folder doesn't exist
    throw new FolderDoesNotExistException("Folder Mapped to the target path provided has been previously deleted.");
  }
  var targetFolderId = getFolderId(targetFolderPath);

  for (filePath in sourceFilePaths) {
    var exists = hasFile(filePath);
    // Copy the file only if it exists else ignore
    if (exists) {
      var sourceFileId = getFileId(filePath);
      copyFileById(sourceFileId, targetFolderId);
    }
  }
}

/**
 * API to copy a folder from it’s source location to a destination location.
 * 
 * @param {StringArray} sourceFolderPaths An array of Absolute local folder paths of 
 *                      the folders which are needed to be copied.
 * @param {String} targetFolderPath Absolute local folder path of the folder to which 
 *                 the files are needed to be copied to.
 */
function copyFolders(sourceFolderPaths, targetFolderPath) {
  // First find the drive id for the target folder
  var exists = hasFolder(targetFolderPath);
  if(!exists){
    // If the target folder doesn't exist
    throw new FolderDoesNotExistException("Folder Mapped to the target path provided has been previously deleted.");
  }
  var targetFolderId = getFolderId(targetFolderPath);

  for (folderPath in sourceFolderPaths) {
    var exists = hasFolder(folderPath);
    // Copy the folder only if it exists else ignore
    if (exists) {
      var sourceFolderId = getFolderId(folderPath);
      copyFolderById(sourceFolderId, targetFolderId);
    }
  }
}

/**
 * Utility function to copy a file given by its drive id to a destination folder
 * 
 * @param {String} sourceId Drive id of the source file
 * @param {String} targetFolderId Drive id of the target folder
 */
function copyFileById(sourceId, targetFolderId) {
  var file = DriveApp.getFileById(sourceId);
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  file.makeCopy(targetFolder);
}

/**
 * Utility function to copy a folder given by its drive id to a destination folder
 * 
 * @param {String} sourceId Drive id of the source folder
 * @param {String} targetFolderId Drive id of the target folder
 */
function copyFolderById(sourceId, targetFolderId){
  var sourceFolder = DriveApp.getFolderById(sourceId);
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  copyFolder(sourceFolder, targetFolder);
}

/**
 * Utility function to copy a folder given by Folder Object to the target folder
 * 
 * @param {FolderObject} source The Drive Folder Object of the source folder
 * @param {FolderObject} target The Drive Folder Object of the target folder
 */
function copyFolder(source, target) {
  var folders = source.getFolders();
  var files = source.getFiles();

  // Make copy of all the files in the source to the target folder
  while(files.hasNext()) {
    var file = files.next();
    file.makeCopy(target);
  }

  // Recursive call to copyFolder function to make copies of all the folders inside source
  while(folders.hasNext()) {
    var subFolder = folders.next();
    var folderName = subFolder.getName();
    var targetFolder = target.createFolder(folderName);
    copyFolder(subFolder, targetFolder);
  }
}



