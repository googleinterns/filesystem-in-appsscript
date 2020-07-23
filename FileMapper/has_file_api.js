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
 * API to check if the drive file corresponding to the absolute local file path
 * exists or it has been deleted.
 *
 * @param {String} localPath Local File Path whose mapping is to be checked
 * @return {boolean} found  True if the file exists,
 *     False if the file has been deleted
 */
function hasFile(localPath) {
  hasFileOrFolderUtilDecorated = SharedLibrary.blockFunctionDecorator(
      hasFileOrFolderUtil, PromptSettings.sleepTime, PromptSettings.retryCount,
      PromptSettings.retryCallback, PromptSettings.failureCallback, [ localPath ]);

  return hasFileOrFolderUtilDecorated(localPath, true);
}

/**
 * API to check if the drive folder corresponding to the absolute local folder
 * path exists or it has been deleted.
 *
 * @param {String} localPath Local folder Path whose mapping is to be checked
 * @return {boolean} found  True if the folder exists,
 *     False if the folder has been deleted
 */
function hasFolder(localPath) {
  hasFileOrFolderUtilDecorated = SharedLibrary.blockFunctionDecorator(
      hasFileOrFolderUtil, PromptSettings.sleepTime, PromptSettings.retryCount,
      PromptSettings.retryCallback, PromptSettings.failureCallback, [ localPath ]);
  
  return hasFileOrFolderUtilDecorated(localPath, false);
}

/**
 * Utility function to check if the drive file/folder corresponding to the
 * absolute local path exists or it has been deleted.
 *
 * @param {String} localPath Local Path whose mapping is to be checked
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {boolean} found  True if the file/folder exists,
 *     False if the file/folder has been deleted
 */
function hasFileOrFolderUtil(localPath, isFile, showPrompt) {
  // Checking if the path is windows or unix
  var isUnix = PathUtil.checkIfUnixPath(localPath);

  var mappedPath = localPath;
  var relativePath = "";
  var found = false;
  var checked = false;

  while (!found && mappedPath.length > 0) {
    var currentDirectoryMapping = CONFIG.getMappingFromConfigData(mappedPath);

    if (currentDirectoryMapping) {
      var currentDirectoryId = currentDirectoryMapping.id;
      checked = true;

      // If the file whose id is to be returned has been deleted
      if (ApiUtil.checkIfMarkedDeleted(mappedPath)) {
        break;
      }

      // If the current directory has been moved
      if (ConfigUtil.checkIfDrivePathChanged(currentDirectoryMapping)) {
        break;
      }

      if (relativePath.length > 0) {
        var currentDirectory = DriveApp.getFolderById(currentDirectoryId);
        var relativeMapping =
            ApiUtil.findInDrive(currentDirectory, relativePath, isUnix, isFile);

        // If the mapping is found
        if (relativeMapping !== null) {
          found = true;
        }
      } else {
        // If we have found the complete path in the config
        found = true;
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

  if (checked) {
    return found;
  } else {
    if (showPrompt) {
      // Show prompt to the user to get mapping
      showPromptToGetMappingFromUser(localPath, isFile);
    }

    // If the mapping was not checked in the config then we need to prompt the
    // user to add a mapping
    throw new MappingNotFoundException(
        "Mapping for the local path provided is not found. Provide a mapping for " +
        localPath);
  }
}
