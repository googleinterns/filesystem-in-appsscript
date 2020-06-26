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
 * Config Utilities
 */
var ConfigUtil =
    {
      getFullDrivePath : getFullDrivePath,
      checkIfDrivePathChanged : checkIfDrivePathChanged,
      checkMappingExists : checkMappingExists,
      checkIfMimeTypeMatches : checkIfMimeTypeMatches,
      getMimeTypeFromExtension : getMimeTypeFromExtension
    }

/**
 * Computes the Drive path for a file/folder using their Id
 *
 * @param {String} id The drive destination Id whose path needs to be computed
 * @param {boolean} isFolder To signify whether its a file or folder
 * @return {String} drivePath The corresponding drive path
 */
function getFullDrivePath(id, isFolder) {
  var current =
      (!isFolder) ? DriveApp.getFileById(id) : DriveApp.getFolderById(id);

  var folders = [];
  var parent = current.getParents();

  while (parent.hasNext()) {
    parent = parent.next();
    folders.push(parent.getName());
    parent = parent.getParents();
  }

  var drivePath = folders.reverse().join("/") + "/" + current.getName();
  return drivePath;
}

/**
 * Checks if the Drive Path for a particular mapping has been changed due to
 * the file being moved
 *
 * @param {Object} mapping The mapping object containg the drive id and previous
 *     drive path
 * @return {boolean} True if drive path is changed,
 *     False otherwise
 */
function checkIfDrivePathChanged(mapping) {
  var newDrivePath = ConfigUtil.getFullDrivePath(mapping.id, !mapping.isfolder);
  return !(newDrivePath === mapping.drivepath);
}

/**
 * Checks if the mapping for a particular pair of Local path and drive id exists
 * or not in the config
 *
 * @param {String} localPath The local destination path whose mapping is to be
 *     checked
 * @param {String} driveId The drive Id which needs to be mapped to the provided
 *     local path
 * @return {boolean} True if mapping pair exists,
 *     False otherwise
 */
function checkMappingExists(localPath, driveId) {
  var localPathInConfig = CONFIG.getLocalPathCaseMapping(localPath);

  if (localPathInConfig) {
    var mappedData = CONFIG.getMappingFromConfigData(localPathInConfig);
    return (mappedData.id === driveId);
  } else {
    return false;
  }
}

/**
 * Checks if the MimeType for the desination of a Local Path and a drive Id
 * matches or not
 *
 * @param {String} localPath The local destination path
 * @param {String} driveId The corresponding drive destination Id
 * @return {boolean} True if MimeType matches,
 *                   False otherwise
 */
function checkIfMimeTypeMatches(localPath, driveId) {
  var extension = PathUtil.getExtension(localPath);

  var localMimeType = ConfigUtil.getMimeTypeFromExtension(extension);
  var driveMimeType = DriveApp.getFileById(driveId).getMimeType();
  if (!driveMimeType) {
    driveMimeType = MimeType.FOLDER;
  }

  return (driveMimeType === localMimeType);
}

/**
 * Function to return the MimeType based on the file extension
 */
function getMimeTypeFromExtension(extension) {
  if (extension === "xls" || extension === "xlsx" || extension === "csv")
    return MimeType.GOOGLE_SHEETS;

  if (extension === "doc" || extension === "docx" || extension === "pdf" ||
      extension === "txt")
    return MimeType.GOOGLE_DOCS;

  if (extension === "ppt" || extension === "pptx")
    return MimeType.GOOGLE_SLIDES;

  if (extension === "")
    return MimeType.FOLDER;
}
