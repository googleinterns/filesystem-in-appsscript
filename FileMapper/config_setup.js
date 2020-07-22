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
 * Config Setup
 */
var CONFIG = {
  filename : 'VBA_FILESYSTEM_CONFIG_FILE.json',
  // Drive Id of the config file
  driveId : null,
  dataLoaded : false,

  /**
   * Object variable for storing the config data locally in the memory
   * @type {Object}
   */
  data : {},
  // Methods to access the data object
  getConfigData : getConfigData,
  getMappingFromConfigData : getMappingFromConfigData,
  setMappingInConfigData : setMappingInConfigData,
  deleteMappingInConfigData : deleteMappingInConfigData,

  /**
   * Object variable for keeping the mapping from lowercase localPaths to
   * the ones provided by the user (to handle the case-insensitivity in
   * local file systems)
   * @type {Object}
   */
  localPathCaseMap : {},
  // Methods to access the local path case mappings
  getLocalPathCaseMapping : getLocalPathCaseMapping,
  updateLocalPathCaseMapping : updateLocalPathCaseMapping,
  checkIfLocalPathExists : checkIfLocalPathExists,
  deleteLocalPathCaseMapping : deleteLocalPathCaseMapping,

  // Utility methods
  checkIfConfigDataLoaded : checkIfConfigDataLoaded,
  initConfigFile : initConfigFile,
  loadConfigData : loadConfigData,
  createLocalPathMap : createLocalPathMap,
  flushConfigDataToFile : flushConfigDataToFile
};

/**
 * Get the entire config data object
 */
function getConfigData() {
  CONFIG.checkIfConfigDataLoaded();
  return CONFIG.data;
}

/**
 * Get the mapping corresponding to a local path from the config
 *
 * @param {String} localpath The local destination path whose
 *     mapping is to be returned
 * @return {Object} The mapping object for the local path provided
 */
function getMappingFromConfigData(localpath) {
  CONFIG.checkIfConfigDataLoaded();
  var localPathInConfig = CONFIG.getLocalPathCaseMapping(localpath);
  // If not found, then it will return undefined
  return CONFIG.data[localPathInConfig];
}

/**
 * Set the mapping corresponding to the local path in the config
 *
 * @param {String} localpath The local destination path whose mapping is to be
 *     set
 * @param {Object} mappingObject The mapping object for the local path provided
 */
function setMappingInConfigData(localpath, mappingObject) {
  CONFIG.checkIfConfigDataLoaded();
  if (CONFIG.checkIfLocalPathExists(localpath)) {
    localpath = CONFIG.getLocalPathCaseMapping(localpath);
  }
  CONFIG.data[localpath] = mappingObject;
  CONFIG.updateLocalPathCaseMapping(localpath);
}

/**
 * Delete the mapping corresponding to a local path from the config
 *
 * @param {String} localpath The local destination path whose is needed
 *     to be deleted
 */
function deleteMappingInConfigData(localpath) {
  CONFIG.checkIfConfigDataLoaded();
  var localPathInConfig = CONFIG.getLocalPathCaseMapping(localpath);
  delete CONFIG.data[localPathInConfig];
}

/**
 * Get the original local path mapped by the lowercase version of the
 * provided local path
 *
 * @param {String} localpath The local destination path whose mapping is needed
 * @return {String} Local path case mapping of the provided local path
 */
function getLocalPathCaseMapping(localpath) {
  CONFIG.checkIfConfigDataLoaded();
  return CONFIG.localPathCaseMap[localpath.toLowerCase()];
}

/**
 * Update the original local path mapped by the lowercase version of the
 * provided local path
 *
 * @param {String} localpath The local destination path which is to be updated
 */
function updateLocalPathCaseMapping(localpath) {
  CONFIG.checkIfConfigDataLoaded();
  CONFIG.localPathCaseMap[localpath.toLowerCase()] = localpath;
}

/**
 * Checks if the  particular Local path exists or not in the config
 *
 * @param {String} localpath The local destination path which is to be checked
 * @return {boolean} True if local path exists,
 *     False otherwise
 */
function checkIfLocalPathExists(localpath) {
  CONFIG.checkIfConfigDataLoaded();
  return (localpath.toLowerCase() in CONFIG.localPathCaseMap);
}

/**
 * Delete a local path from the map
 *
 * @param {String} localpath The local destination path which is to be deleted
 */
function deleteLocalPathCaseMapping(localpath) {
  CONFIG.checkIfConfigDataLoaded();
  delete CONFIG.localPathCaseMap[localpath.toLowerCase()];
}

/**
 * Check if the config data has been loaded from the config file or not
 */
function checkIfConfigDataLoaded() {
  if (!CONFIG.dataLoaded) {
    CONFIG.loadConfigData();
  }
}

/**
 * Initialize the config file if it does not exist already
 */
function initConfigFile() {
  // Getting the parent folder of the current spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var file = DriveApp.getFileById(sheet.getId());
  var parentFolder = file.getParents().next();

  var files = parentFolder.getFilesByName(CONFIG.filename);
  var configFile;
  if (files.hasNext()) {
    // Get the config file by name from the parent folder
    configFile = files.next();
  } else {
    // Creating a new JSON file for storing the config data within the parent
    // folder
    configFile =
        parentFolder.createFile(CONFIG.filename, "", MimeType.PLAIN_TEXT);
  }
  CONFIG.driveId = configFile.getId();
}

/**
 * Load Config data from the config file and store in the data object
 */
function loadConfigData() {
  if (CONFIG.driveId === null) {
    CONFIG.initConfigFile();
  }

  var configFile = DriveApp.getFileById(CONFIG.driveId);
  var blob = configFile.getAs(MimeType.PLAIN_TEXT);
  var content = blob.getDataAsString();
  if (content) {
    CONFIG.data = JSON.parse(content);
    CONFIG.createLocalPathMap();
  }

  CONFIG.dataLoaded = true;
}

/**
 * Create local path map using the config data object
 */
function createLocalPathMap() {
  for (var localpath in CONFIG.data) {
    CONFIG.localPathCaseMap[localpath.toLowerCase()] = localpath;
  }
}

/**
 * Flush the config data into the config file
 */
function flushConfigDataToFile() {
  var file = DriveApp.getFileById(CONFIG.driveId);
  file.setContent(JSON.stringify(CONFIG.data));
}
