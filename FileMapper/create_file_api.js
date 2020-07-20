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
 * API to create a file corresponding to the absolute local file path
 *
 * @param {String} localPath Local File Path corresponding to which new file is
 *     to be created
 * @return {String} driveId The Drive id of the newly created file
 */
function createFile(localPath) {
  var exists = hasFile(localPath);
  if (exists) {
    // File already exists hence can't create a new file
    var errorMessage =
        "File mapped to the local path " + localPath + " already exists.";
    throw new FileAlreadyExistsException(errorMessage);
  }
  createFileOrFolderUtilDecorated = SharedLibrary.blockFunctionDecorator(
      createFileOrFolderUtil, PromptSettings.sleepTime,
      PromptSettings.retryCount, PromptSettings.retryCallback,
      PromptSettings.failureCallback, [ localPath ]);

  return createFileOrFolderUtilDecorated(localPath, true);
}

/**
 * API to create a folder corresponding to the absolute local folder path
 *
 * @param {String} localPath Local folder Path corresponding to which new folder
 *     is to be created
 * @return {String} driveId The Drive id of the newly created folder
 */
function createFolder(localPath) {
  var exists = hasFolder(localPath);
  if (exists) {
    // Folder already exists hence can't create a new folder
    var errorMessage =
        "Folder mapped to the local path " + localPath + " already exists.";
    throw new FileAlreadyExistsException(errorMessage);
  }
  createFileOrFolderUtilDecorated = SharedLibrary.blockFunctionDecorator(
      createFileOrFolderUtil, PromptSettings.sleepTime,
      PromptSettings.retryCount, PromptSettings.retryCallback,
      PromptSettings.failureCallback, [ localPath ]);
  
  return createFileOrFolderUtilDecorated(localPath, false);
}

/**
 * Utility function to create a file/folder corresponding to the absolute local
 * path
 *
 * @param {String} localPath Local Path corresponding to which new file/folder
 *     is to be created
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The Drive id of the newly created file/folder
 */
function createFileOrFolderUtil(localPath, isFile, showPrompt) {
  // Checking if the path is windows or unix
  var isUnix = PathUtil.checkIfUnixPath(localPath);

  // Find the part of the absolutePath whose mapping already exists in the
  // config
  var mappedPath = localPath;
  var relativePath = "";
  var created = false;
  var driveId = null;

  while (!created && mappedPath.length > 0) {
    var currentDirectoryMapping = CONFIG.getMappingFromConfigData(mappedPath);

    if (currentDirectoryMapping) {
      var currentDirectoryId = currentDirectoryMapping.id;

      if (ApiUtil.checkIfMarkedDeleted(mappedPath)) {
        currentDirectoryId = ApiUtil.createDeletedDestination(mappedPath);
      }

      // If the current directory has been moved
      if (ConfigUtil.checkIfDrivePathChanged(currentDirectoryMapping)) {
        currentDirectoryId = ApiUtil.createDeletedDestination(mappedPath);
      }

      if (relativePath.length > 0) {
        var currentDirectory = DriveApp.getFolderById(currentDirectoryId);
        var relativeMapping = ApiUtil.createInDrive(
            currentDirectory, relativePath, isUnix, isFile);

        if (relativeMapping !== null) {
          ApiUtil.addNewMappingToConfig(localPath, relativeMapping, isFile);
          driveId = relativeMapping;
          created = true;
        }
      } else {
        driveId = currentDirectoryId;
        created = true;
      }
      // We have already checked the longest mapping
      break;
    }

    var position = PathUtil.getLastSlash(mappedPath, isUnix);
    if (position == -1) {
      relativePath = PathUtil.joinPath(mappedPath, relativePath, isUnix);
      mappedPath = "";
    } else {
      relativePath = PathUtil.joinPath(mappedPath.slice(position + 1),
                                       relativePath, isUnix);
      mappedPath = mappedPath.slice(0, position);
    }
  }

  // if no such part can be found then prompt the user to select a folder using
  // a file picker
  if (!created) {
    if (showPrompt) {
      // Show prompt to the user to get mapping
      showPromptToGetMappingFromUser(localPath, isFile);
    }

    throw new MappingNotFoundException(
        "Mapping for the local path provided is not found. Provide a mapping for " +
        localPath);
  }
  // else if a part was created
  return driveId;
}
