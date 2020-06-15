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
 * API to move a file from it’s source location to a destination location.
 * 
 * @param {StringArray} sourceFilePaths An array of Absolute local file paths of 
 *                      the files which are needed to be moved.
 * @param {String} targetFolderPath Absolute local folder path of the folder to which 
 *                 the files are needed to be moved to.
 */
function moveFiles(sourceFilePaths, targetFolderPath) {
  // First find the drive id for the target folder
  var exists = hasFolder(targetFolderPath);
  if(!exists){
    // If the target folder doesn't exist
    throw new FolderDoesNotExistException("Folder Mapped to the target path provided has been previously deleted.");
  }
  var targetFolderId = getFolderId(targetFolderPath);

  for (filePath in sourceFilePaths) {
    var exists = hasFile(filePath);
    // Move the file only if it exists else ignore
    if (exists) {
      var sourceFileId = getFileId(filePath);
      moveFileById(sourceFileId, targetFolderId);
    }
  }
}

/**
 * API to move a folder from it’s source location to a destination location.
 * 
 * @param {StringArray} sourceFolderPaths An array of Absolute local folder paths of 
 *                      the folders which are needed to be moved.
 * @param {String} targetFolderPath Absolute local folder path of the folder to which 
 *                 the files are needed to be moved to.
 */
function moveFolders(sourceFolderPaths, targetFolderPath) {
  // First find the drive id for the target folder
  var exists = hasFolder(targetFolderPath);
  if(!exists){
    // If the target folder doesn't exist
    throw new FolderDoesNotExistException("Folder Mapped to the target path provided has been previously deleted.");
  }
  var targetFolderId = getFolderId(targetFolderPath);

  for (folderPath in sourceFolderPaths) {
    var exists = hasFolder(folderPath);
    // Move the folder only if it exists else ignore
    if (exists) {
      var sourceFolderId = getFolderId(folderPath);
      moveFileById(sourceFolderId, targetFolderId);
    }
  }
}

/**
 * Utility function to move a file given by its drive id to a destination folder
 * 
 * @param {String} sourceId Drive id of the source file
 * @param {String} targetFolderId Drive id of the target folder
 */
function moveFileById(sourceId, targetFolderId) {
  var file = DriveApp.getFileById(sourceId);
  file.getParents().next().removeFile(file);
  DriveApp.getFolderById(targetFolderId).addFile(file);
}

/**
 * Utility function to move a folder given by its drive id to a destination folder
 * 
 * @param {String} sourceId Drive id of the source folder
 * @param {String} targetFolderId Drive id of the target folder
 */
function moveFolderById(sourceId, targetFolderId){
  var folder = DriveApp.getFolderById(sourceId);
  folder.getParents().next().removeFolder(folder);
  DriveApp.getFolderById(targetFolderId).addFolder(folder);
}




