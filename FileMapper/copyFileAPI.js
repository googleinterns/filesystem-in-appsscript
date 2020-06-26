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
 * @param {String} sourceFilePath Absolute local file paths of the files which
 *     are needed to be copied.
 * @param {String} targetFolderPath Absolute local folder path of the folder to
 *     which the files are needed to be copied to.
 */
function copyFile(sourceFilePath, targetFolderPath) {
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
  // Copy the file only if it exists else throw error
  if (!exists) {
    var errorMessage = "File Mapped to the source path " + sourceFilePath +
                       " has been previously deleted."
    throw new FileDoesNotExistException(errorMessage);
  }
  var sourceFileId = getFileId(sourceFilePath);

  var newCopiedFileId = 
      ApiUtil.copyFileById(sourceFileId, targetFolderId);

  // Add the mapping of the newly copied file to the config
  var newPath = PathUtil.createNewMovedPath(targetFolderPath, sourceFilePath);
  ApiUtil.addNewMappingToConfig(newPath, newCopiedFileId, true);
}

/**
 * API to copy a folder from it’s source location to a destination location.
 *
 * @param {String} sourceFolderPath Absolute local folder paths of the folders
 *     which is needed to be copied.
 * @param {String} targetFolderPath Absolute local folder path of the folder to
 *     which the files are needed to be copied to.
 */
function copyFolder(sourceFolderPath, targetFolderPath) {
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
  // Copy the folder only if it exists else throw error
  if (!exists) {
    var errorMessage = "Folder Mapped to the source path " + sourceFolderPath +
                       " has been previously deleted."
    throw new FileDoesNotExistException(errorMessage);
  }
  var sourceFolderId = getFolderId(sourceFolderPath);

  var newCopiedFolderId =
      ApiUtil.copyFolderById(sourceFolderId, targetFolderId);

  // Add the mapping of the newly moved folder to the config
  var newPath = PathUtil.createNewMovedPath(targetFolderPath, sourceFolderPath);
  ApiUtil.addNewMappingToConfig(newPath, newCopiedFolderId, false);
}
