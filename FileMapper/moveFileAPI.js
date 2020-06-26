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
 *     which the files are needed to be moved to.
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

  ApiUtil.moveFileById(sourceFileId, targetFolderId);

  // Add the mapping of the newly moved file to the config
  var newPath = PathUtil.createNewMovedPath(targetFolderPath, sourceFilePath);
  ApiUtil.addNewMappingToConfig(newPath, sourceFileId, true);
}

/**
 * API to move a folder from it’s source location to a destination location.
 *
 * @param {String} sourceFolderPath Absolute local folder paths of the folders
 *     which is needed to be moved.
 * @param {String} targetFolderPath Absolute local folder path of the folder to
 *     which the files are needed to be moved to.
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

  ApiUtil.moveFolderById(sourceFolderId, targetFolderId);

  // Add the mapping of the newly moved folder to the config
  var newPath = PathUtil.createNewMovedPath(targetFolderPath, sourceFolderPath);
  ApiUtil.addNewMappingToConfig(newPath, sourceFolderId, false);
}
