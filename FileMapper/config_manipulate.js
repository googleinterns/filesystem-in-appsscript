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
 *                  and its type (whether folder or file).
 */
function getConfigData() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var properties = documentProperties.getProperties();

  var configData = {};
  for (var property in properties) {
    var object = JSON.parse(properties[property]);
    configData[property] = {
      drivepath : object.drivepath,
      isfolder : object.isfolder
    }
  }

  return configData;
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
 *                   False otherwise
 */
function addMapping(localPath, drivePath, driveId, isFolder) {
  var documentProperties = PropertiesService.getDocumentProperties();

  if (ConfigUtil.checkIfMimeTypeMatches(localPath, driveId)) {
    var mappingObject = {
      id : driveId,
      drivepath : drivePath,
      isfolder : isFolder
    };
    documentProperties.setProperty(localPath, JSON.stringify(mappingObject));
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
 *                   False otherwise
 */
function updateMapping(localPath, drivePath, driveId, isFolder) {
  var documentProperties = PropertiesService.getDocumentProperties();

  // If only isFolder was updated
  if (!driveId) {
    var property = documentProperties.getProperty(localPath);
    driveId = JSON.parse(property).id;
  }

  if (ConfigUtil.checkIfMimeTypeMatches(localPath, driveId)) {
    documentProperties.deleteProperty(localPath);
    var mappingObject = {
      id : driveId,
      drivepath : drivePath,
      isfolder : isFolder
    };
    documentProperties.setProperty(localPath, JSON.stringify(mappingObject));
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
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteProperty(localPath);
}
