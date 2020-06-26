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
 * Returns the Config data present in the document properties as local path
 * and drive path pairs.
 *
 * @return {Object} absPath The object containing local path, drive path pairs
 *     and its type (whether folder or file).
 */
function getConfigDataToBuildTable() {
  var configData = CONFIG.getConfigData();

  var data = {};
  for (var mapping in configData) {
    var isDeleted = false;
    if (ApiUtil.checkIfMarkedDeleted(mapping)) {
      isDeleted = true;
    } else if (ConfigUtil.checkIfDrivePathChanged(configData[mapping])) {
      isDeleted = true;
    }

    data[mapping] = {
      drivepath : configData[mapping].drivepath,
      isfolder : configData[mapping].isfolder,
      isdeleted : isDeleted
    }
  }
  return data;
}

/**
 * Adds a mapping to the config if both paths corresponds to destinations having
 * compatible Mimetypes
 *
 * @param {String} localPath The local destination path
 * @param {String} drivePath The drive destination path
 * @param {String} driveId The corresponding drive destination Id
 * @param {boolean} isFolder To signify whether its a file or folder
 * @return {boolean} True if mapping was added,
 *     False otherwise
 */
function addMapping(localPath, drivePath, driveId, isFolder) {
  if (ConfigUtil.checkIfMimeTypeMatches(localPath, driveId)) {
    var mappingObject = {
      id : driveId,
      drivepath : drivePath,
      isfolder : isFolder
    };

    CONFIG.setMappingInConfigData(localPath, mappingObject);
    CONFIG.flushConfigDataToFile();
    return true;
  } else {
    return false;
  }
}

/**
 * Updates a mapping in the config if both paths corresponds to destinations
 * having compatible Mimetypes
 *
 * @param {String} localPath The local destination path
 * @param {String} drivePath The drive destination path
 * @param {String} driveId The corresponding drive destination Id
 * @param {boolean} isFolder To signify whether its a file or folder
 * @return {boolean} True if mapping was updated,
 *     False otherwise
 */
function updateMapping(localPath, drivePath, driveId, isFolder) {
  var localPathInConfig = CONFIG.getLocalPathCaseMapping(localPath);

  // If only isFolder was updated
  if (!driveId) {
    var mapping = CONFIG.getMappingFromConfigData(localPathInConfig);
    driveId = mapping.id;
  }

  if (ConfigUtil.checkIfMimeTypeMatches(localPath, driveId)) {
    var mappingObject = {
      id : driveId,
      drivepath : drivePath,
      isfolder : isFolder
    };

    CONFIG.setMappingInConfigData(localPathInConfig, mappingObject);
    CONFIG.flushConfigDataToFile();
    return true;
  } else {
    return false;
  }
}

/**
 * Deletes a mapping from the config
 *
 * @param {String} localPath The local destination path whose mapping is to be
 *     deleted
 */
function deleteMapping(localPath) {
  CONFIG.deleteMappingInConfigData(localPath);
  CONFIG.deleteLocalPathCaseMapping(localPath);

  CONFIG.flushConfigDataToFile();
}
