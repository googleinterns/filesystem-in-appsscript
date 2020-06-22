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
var TestUtil = {
  sampleMapings : {},
  addTestDocumentProperties : addTestDocumentProperties,
  printDocumentProperties : printDocumentProperties,
  clearAllProperties : clearAllProperties,
  setTestingEnvironment : setTestingEnvironment
}

var sampleMapings =
    {
      'C:\\Downloads\\MyProject\\file1.txt' : JSON.stringify({
        id : "1Y56QbYd_VhILIByrqVZRASgQUdX3-7BEm9M2L5kKe6yzNv8oBbxhXdQ3",
        drivepath : "My Drive/project/Check Config",
        isfolder : false
      }),
      'C:\\Documents\\MyFolder' : JSON.stringify({
        id : "1GF40damPMEBwrlsnapgoT5qZoTy9ooG_",
        drivepath : "My Drive/test1",
        isfolder : true
      }),
      'C:\\Documents\\DeletedFolder' : JSON.stringify({
        id : "1yTF_j7Rxm6y0XvqnVSoykux0Jv32Ic1I",
        drivepath : "My Drive/Untitled folder",
        isfolder : true
      })
    }

/**
 * To set the testing environment
 */
function
setTestingEnvironment() {
  // Mapping object containing mappings which are need to setup the test
  // environment
  var mappingObj = {
    "C:\\user" : JSON.stringify({
      id : "16Dyjs72UkD2SFkVlUmUxxx03RW5dXx-F",
      drivepath : "My Drive/Root",
      isfolder : true
    })
  };

  // Clear all the mappings
  clearAllProperties();
  // Add the mappings needed to setup the test environment
  addTestDocumentProperties(mappingObj);
}

/**
 * Test adding document properties
 */
function addTestDocumentProperties(mappings) {
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperties(mappings);
}

/**
 * Print all document properties
 */
function
printDocumentProperties() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var mappings = documentProperties.getProperties();

  for (var mapping in mappings) {
    Logger.log(' %s -> %s ', mapping, mappings[mapping]);
  }
}

/**
 * Delete all document properties
 */
function
clearAllProperties() {
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteAllProperties();
}
