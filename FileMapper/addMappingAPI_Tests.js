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
 * Add Mapping API Unit Tests
 */
function add_mapping_api_tests() {
  QUnit.module("addMapping API");

  TestUtil.setTestingEnvironment();

  // Tests for adding new file mappings
  QUnit.test("Add new file mapping", 3, function() {
    var localPath = "C:\\user\\Folder3\\File31.docx";
    var driveId = "1FfHIcLeCYosRnZ_UVTkJEXDA80eJ0JlrCvJqwPsimKE";
    var message = "File Mapping added for " + localPath;
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't Exist.");
    equal(addFileMapping(localPath, driveId), 0, message);
    ok(ConfigUtil.checkMappingExists(localPath, driveId), "Mapping Exists!!");
  });

  QUnit.test("Add new file mapping", 3, function() {
    var localPath = "C:\\user\\Folder4\\Folder41\\Folder411\\File4111.xls";
    var driveId = "1ILMNOiSZ0cy-jgEILW2PwAhZ1JvjpEIidqUSGzg8dcs";
    var message = "File Mapping added for " + localPath;
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't Exist.");
    equal(addFileMapping(localPath, driveId), 0, message);
    ok(ConfigUtil.checkMappingExists(localPath, driveId), "Mapping Exists!!");
  });

  // Tests for adding new folder mappings
  QUnit.test("Add new folder mapping", 3, function() {
    var localPath = "C:\\user\\Folder1";
    var driveId = "17zQindbRjJgj6Vyz6kvR9sa_QIivjkEu";
    var message = "Folder Mapping added for " + localPath;
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't Exist.");
    equal(addFolderMapping(localPath, driveId), 0, message);
    ok(ConfigUtil.checkMappingExists(localPath, driveId), "Mapping Exists!!");
  });

  QUnit.test("Add new folder mapping", 3, function() {
    var localPath = "C:\\user\\Folder2\\Folder22\\Folder221";
    var driveId = "1pR-u6ptKzLIv428KJ7zh_xYMGURZvBf5";
    var message = "Folder Mapping added for " + localPath;
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't Exist.");
    equal(addFolderMapping(localPath, driveId), 0, message);
    ok(ConfigUtil.checkMappingExists(localPath, driveId), "Mapping Exists!!");
  });

  // Tests to check if mapping with Incorrect Local File Path is rejected or not
  QUnit.test("Incorrect Local File Path", 2, function() {
    var localPath = "User\\Folder3\\File31.docx";
    var driveId = "1FfHIcLeCYosRnZ_UVTkJEXDA80eJ0JlrCvJqwPsimKE";
    var message = "File Mapping not added for " + localPath;
    equal(addFileMapping(localPath, driveId), 1, message);
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't exist");
  });

  // Tests to check if mapping with Invalid File Drive Id is rejected or not
  QUnit.test("Invalid File Drive Id", 2, function() {
    var localPath = "C:\\user\\Folder4\\Folder44\\Folder411\\File4111.xls";
    var driveId = "5iuu51ILMNOiSZ0cy-jgwAhZ1JvjpEIidqUSGzg8dcs";
    var message = "File Mapping not added for " + localPath;
    equal(addFileMapping(localPath, driveId), 2, message);
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't exist");
  });

  // Test to check if an already existing file mapping is added or not
  QUnit.test("Add Mapping for already mapped local file path", 2, function() {
    var localPath = "C:\\user\\Folder4\\Folder41\\Folder411\\File4111.xls";
    var driveId = "1FfHIcLeCYosRnZ_UVTkJEXDA80eJ0JlrCvJqwPsimKE";
    var message = "File Mapping not added for " + localPath;
    equal(addFileMapping(localPath, driveId), 3, message);
    ok(CONFIG.checkIfLocalPathExists(localPath), "Mapping Already Exists!!");
  });

  // Tests to check if mapping with Incorrect Local Folder Path is rejected or
  // not
  QUnit.test("Incorrect Local Folder Path", 2, function() {
    var localPath = "User\\Folder1";
    var driveId = "17zQindbRjJgj6Vyz6kvR9sa_QIivjkEu";
    var message = "Folder Mapping not added for " + localPath;
    equal(addFolderMapping(localPath, driveId), 1, message);
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't exist");
  });

  // Tests to check if mapping with Invalid Folder Drive Id is rejected or not
  QUnit.test("Invalid Folder Drive Id", 2, function() {
    var localPath = "C:\\user\\Folder2\\Folder24\\Folder221";
    var driveId = "kshdb1A-JWyksT1BK-PU09SWpdyTbpNs_CFhgH";
    var message = "Folder Mapping not added for " + localPath;
    equal(addFolderMapping(localPath, driveId), 2, message);
    ok(!ConfigUtil.checkMappingExists(localPath, driveId),
       "Mapping doesn't exist");
  });

  // Test to check if an already existing folder mapping is added or not
  QUnit.test("Add Mapping for already mapped local folder path", 2, function() {
    var localPath = "C:\\user\\Folder2\\Folder22\\Folder221";
    var driveId = "17zQindbRjJgj6Vyz6kvR9sa_QIivjkEu";
    var message = "Folder Mapping not added for " + localPath;
    equal(addFolderMapping(localPath, driveId), 3, message);
    ok(CONFIG.checkIfLocalPathExists(localPath), "Mapping Exists Already!!");
  });
}
