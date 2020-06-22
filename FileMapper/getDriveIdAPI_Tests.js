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
 * Get Drive Id API Unit Tests
 */
function get_drive_id_api_tests() {
  QUnit.module("getDriveId API");

  TestUtil.setTestingEnvironment();

  // Testing the return values
  QUnit.test("direct mapping is present in config", 1, function() {
    var localPath = "C:\\user";
    var expectedId = "16Dyjs72UkD2SFkVlUmUxxx03RW5dXx-F";
    equal(getFolderId(localPath), expectedId, "Correct Folder Id Found");
  });

  QUnit.test("indirect mapping at level-1", 1, function() {
    var localPath = "C:\\user\\Folder1";
    var expectedId = "17zQindbRjJgj6Vyz6kvR9sa_QIivjkEu";
    equal(getFolderId(localPath), expectedId, "Correct Id Found for level-1");
  });

  QUnit.test("indirect mapping at level-2", 1, function() {
    var localPath = "C:\\user\\Folder3\\File31.docx";
    var expectedId = "1FfHIcLeCYosRnZ_UVTkJEXDA80eJ0JlrCvJqwPsimKE";
    equal(getFileId(localPath), expectedId, "Correct Id Found for level-2");
  });

  QUnit.test("indirect mapping at level-3", 1, function() {
    var localPath = "C:\\user\\Folder2\\Folder22\\Folder221";
    var expectedId = "1A-JWyksT1BK-PU09SWpdyTbpNs_CFhgH";
    equal(getFolderId(localPath), expectedId, "Correct Id Found for level-3");
  });

  QUnit.test("indirect mapping at level-4", 1, function() {
    var localPath = "C:\\user\\Folder4\\Folder41\\Folder411\\File4111.xls";
    var expectedId = "1ILMNOiSZ0cy-jgEILW2PwAhZ1JvjpEIidqUSGzg8dcs";
    equal(getFileId(localPath), expectedId, "Correct Id Found for level-4");
  });

  // Testing the errors thrown
  QUnit.test("MappingNotFoundException - Error to prompt the user for mapping",
             1, function() {
               var localPath = "C:\\Folder2\\Folder22\\File232.xls";
               throws(function() { getFileId(localPath); },
                      MappingNotFoundException,
                      "MappingNotFoundException caught.");
             });

  QUnit.test(
      "FileDoesNotExistException - Error for deleted file", 3, function() {
        var localPath = "C:\\user\\MyFile.txt";
        ok(createFile(localPath), "File Created.");
        ok(deleteFile(localPath), "File Deleted.");
        throws(function() { getFileId(localPath); }, FileDoesNotExistException,
               "FileDoesNotExistException caught.");
      });
}
