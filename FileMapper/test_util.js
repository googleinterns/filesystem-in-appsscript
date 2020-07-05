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
 * Test Utilities
 */
var TestUtil =
    {
      setWindowsTestingEnvironment : setWindowsTestingEnvironment,
      setUnixTestingEnvironment : setUnixTestingEnvironment,
      addTestMappingsToConfig : addTestMappingsToConfig,
      printConfigData : printConfigData,
      clearAllMappingsInConfig : clearAllMappingsInConfig
    }

/**
 * To set the testing environment
 */
function setWindowsTestingEnvironment() {
  // Mapping object containing mappings which are need to setup the test
  // environment
  var mappingObj = {
    "C:\\user" : {
      id : "16Dyjs72UkD2SFkVlUmUxxx03RW5dXx-F",
      drivepath : "My Drive/Root",
      isfolder : true
    }
  };

  // Add the mappings needed to setup the test environment
  addTestMappingsToConfig(mappingObj);
}

/**
 * To set the testing environment for Unix file system
 */
function setUnixTestingEnvironment() {
  // Mapping object containing mappings which are need to setup the test
  // environment
  var mappingObj = {
    "/home" : {
      id : "16Dyjs72UkD2SFkVlUmUxxx03RW5dXx-F",
      drivepath : "My Drive/Root",
      isfolder : true
    }
  };

  // Add the mappings needed to setup the test environment
  addTestMappingsToConfig(mappingObj);
}

/**
 * Adding Test Mappings to the config
 */
function addTestMappingsToConfig(mappings) {
  for (var localPath in mappings) {
    CONFIG.setMappingInConfigData(localPath, mappings[localPath]);
  }
  CONFIG.flushConfigDataToFile();
}

/**
 * Print all mappings in the config
 */
function printConfigData() {
  var configData = CONFIG.getConfigData();
  for (var mapping in configData) {
    Logger.log(' %s -> %s ', mapping, configData[mapping]);
  }
}

/**
 * Delete all mappings in the config
 */
function clearAllMappingsInConfig() {
  var configData = CONFIG.getConfigData();
  for (var mapping in configData) {
    CONFIG.deleteMappingInConfigData(mapping);
  }
  for (var localpath in CONFIG.localPathMap) {
    CONFIG.deleteLocalPathCaseMapping(localpath);
  }
  CONFIG.flushConfigDataToFile();
}
