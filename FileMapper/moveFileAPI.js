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
 * @param {String} sourceFilePath Absolute local file paths of the file which is
 *     needed to be moved.
 * @param {String} targetFolderPath Absolute local folder path of the folder to
 *     which
 *                 the files are needed to be moved to.
 */
function moveFile(sourceFilePath, targetFolderPath) {
  // First find the drive id for the target folder
  var exists = hasFolder(targetFolderPath);
  if (!exists) {
    // If the target folder doesn't exist
    var errorMessage = "Folder Mapped to the target path " + targetFolderPath +
                       " has been previously deleted."
    throw new FileDoesNotExistException(errorMessage);
  }
  var targetFolderId = getFolderId(targetFolderPath);

  var exists = hasFile(sourceFilePath);
  // Move the file only if it exists else throw an error
  if (!exists) {
    // If the target folder doesn't exist
    var errorMessage = "File Mapped to the source path " + sourceFilePath +
                       " has been previously deleted."
    throw new FileDoesNotExistException(errorMessage);
  }
  var sourceFileId = getFileId(sourceFilePath);
  moveFileById(sourceFileId, targetFolderId);

  eraseMapping(sourceFilePath);
}

/**
 * API to move a folder from it’s source location to a destination location.
 *
 * @param {String} sourceFolderPath Absolute local folder paths of the folders
 *     which is needed to be moved.
 * @param {String} targetFolderPath Absolute local folder path of the folder to
 *     which
 *                 the files are needed to be moved to.
 */
function moveFolder(sourceFolderPath, targetFolderPath) {
  // First find the drive id for the target folder
  var exists = hasFolder(targetFolderPath);
  if (!exists) {
    // If the target folder doesn't exist
    var errorMessage = "Folder Mapped to the target path " + targetFolderPath +
                       " has been previously deleted."
    throw new FileDoesNotExistException(errorMessage);
  }
  var targetFolderId = getFolderId(targetFolderPath);

  var exists = hasFolder(sourceFolderPath);
  // Move the folder only if it exists else throw an error
  if (!exists) {
    // If the target folder doesn't exist
    var errorMessage = "Folder Mapped to the source path " + sourceFolderPath +
                       " has been previously deleted."
    throw new FileDoesNotExistException(errorMessage);
  }
  var sourceFolderId = getFolderId(sourceFolderPath);
  moveFolderById(sourceFolderId, targetFolderId);

  // To delete all the mappings in the config which has this localPath as a part
  // of their path
  var documentProperties = PropertiesService.getDocumentProperties();
  var properties = documentProperties.getProperties();

  for (var property in properties) {
    var prefix = property.slice(0, sourceFolderPath.length);
    if (prefix === sourceFolderPath) {
      documentProperties.deleteProperty(property);
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
 * Utility function to move a folder given by its drive id to a destination
 * folder
 *
 * @param {String} sourceId Drive id of the source folder
 * @param {String} targetFolderId Drive id of the target folder
 */
function moveFolderById(sourceId, targetFolderId) {
  var folder = DriveApp.getFolderById(sourceId);
  folder.getParents().next().removeFolder(folder);
  DriveApp.getFolderById(targetFolderId).addFolder(folder);
}
