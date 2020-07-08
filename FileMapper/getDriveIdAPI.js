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
 * API to find the Drive Id for a local file path
 *
 * @param {String} localPath Local File Path whose mapping is to be found
 * @return {String} driveMapping The Drive id of the mapped file
 */
function getFileId(localPath) {
  getDriveIdUtil = SharedLibrary.blockFunctionDecorator(
      getDriveIdUtil, PromptSettings.sleepTime, PromptSettings.retryCount,
      PromptSettings.retryCallback, PromptSettings.failureCallback,
      [ localPath ]);

  return getDriveIdUtil(localPath, true);
}

/**
 * API to find the Drive Id for a local folder path
 *
 * @param {String} localPath Local Folder Path whose mapping is to be found
 * @return {String} driveMapping The Drive id of the mapped folder
 */
function getFolderId(localPath) {
  getDriveIdUtil = SharedLibrary.blockFunctionDecorator(
      getDriveIdUtil, PromptSettings.sleepTime, PromptSettings.retryCount,
      PromptSettings.retryCallback, PromptSettings.failureCallback,
      [ localPath ]);
  
  return getDriveIdUtil(localPath, false);
}

/**
 * Utility function to find the Drive id for a local file/folder path
 *
 * @param {String} localPath Local Path whose mapping is to be found
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveMapping The Drive id of the mapped file/folder
 */
function getDriveIdUtil(localPath, isFile, showPrompt) {
  // Checking if the path represents windows file system or unix file system
  var isUnix = PathUtil.checkIfUnixPath(localPath);

  var mappedPath = localPath;
  var relativePath = "";
  var found = false;
  var driveMapping = null;

  while (!found && mappedPath.length > 0) {
    var currentDirectoryMapping = CONFIG.getMappingFromConfigData(mappedPath);

    if (currentDirectoryMapping) {
      var currentDirectoryId = currentDirectoryMapping.id;

      // If the file whose id is to be returned has been deleted
      if (ApiUtil.checkIfMarkedDeleted(mappedPath)) {
        var errorMessage =
            ((currentDirectoryMapping.isfolder) ? "Folder" : "File") +
            " mapped to the local path " + mappedPath + " has been deleted.";
        throw new FileDoesNotExistException(errorMessage);
      }

      // If the current directory has been moved
      if (ConfigUtil.checkIfDrivePathChanged(currentDirectoryMapping)) {
        var errorMessage =
            ((currentDirectoryMapping.isfolder) ? "Folder" : "File") +
            " mapped to the local path " + mappedPath +
            " has been moved to another location.";
        throw new FileHasBeenMovedException(errorMessage);
      }

      if (relativePath.length > 0) {
        var currentDirectory = DriveApp.getFolderById(currentDirectoryId);
        var relativeMapping =
            ApiUtil.findInDrive(currentDirectory, relativePath, isUnix, isFile);

        // If the mapping is found
        if (relativeMapping !== null) {
          found = true;
          driveMapping = relativeMapping;
        }
      } else {
        // If we have found the complete path in the config
        found = true;
        driveMapping = currentDirectoryId;
      }
      // We have already checked the longest mapping
      break;
    }

    // To convert "C:\Desktop\MyFolder" + "MyFile.txt" to "C:\Desktop" +
    // "MyFolder\MyFile.txt"
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

  // If the mapping is null then we need to prompt the user
  if (driveMapping === null) {
    if (showPrompt) {
      // Show prompt to the user to get mapping
      showPromptToGetMappingFromUser(localPath, isFile);
    }

    throw new MappingNotFoundException(
        "Mapping for the local path provided is not found. Provide a mapping for " +
        localPath);
  } else {
    return driveMapping;
  }
}
