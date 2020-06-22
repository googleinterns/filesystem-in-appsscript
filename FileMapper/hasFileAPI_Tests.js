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
 * File Exists API Unit Tests
 */
function has_file_api_tests() {
  QUnit.module("hasFile API");

  TestUtil.setTestingEnvironment();

  var availableFiles = [
    "C:\\user\\Folder1\\File12.docx",
    "C:\\user\\Folder2\\Folder22\\File222.xls",
    "C:\\user\\Folder3\\File31.docx", "C:\\user\\Folder4\\File41.xls",
    "C:\\user\\Folder2\\Folder21\\File211.docx"
  ];

  var availableFolders = [
    "C:\\user\\Folder1\\Folder11", "C:\\user\\Folder2\\Folder22\\Folder221",
    "C:\\user\\Folder2\\Folder23\\Folder231", "C:\\user\\Folder3",
    "C:\\user\\Folder4\\Folder41\\Folder411"
  ];

  var unavailableFiles = [
    "C:\\user\\File7.docs", "C:\\user\\Folder1\\File12.xls",
    "C:\\user\\Folder2\\Folder22\\File231.xls",
    "C:\\user\\Folder3\\Folder31\\File311.docx",
    "C:\\user\\Folder4\\Folder41\\Folder411\\File4111.docs"
  ];

  var unavailableFolders = [
    "C:\\user\\Folder5", "C:\\user\\Folder3\\Folder38",
    "C:\\user\\Folder1\\Folder1111", "C:\\user\\Folder2\\Folder22\\Folder222",
    "C:\\user\\Folder4\\Folder41\\Folder411\\Folder4111"
  ];

  var errorFilePaths =
      [ "C:\\Muskan\\File1.xls", "C:\\Muskan\\Folder2\\File23.docx" ];

  var errorFolderPaths = [ "C:\\Muskan", "C:\\Muskan\\Desktop" ];

  // Tests for available files
  QUnit.test("Available file paths", availableFiles.length, function() {
    for (var i = 0; i < availableFiles.length; i++) {
      var message = "File found at " + availableFiles[i];
      ok(hasFile(availableFiles[i]), message);
    }
  });

  // Tests for available folders
  QUnit.test("Available folder paths", availableFolders.length, function() {
    for (var i = 0; i < availableFolders.length; i++) {
      var message = "Folder found at " + availableFolders[i];
      ok(hasFolder(availableFolders[i]), message);
    }
  });

  // Tests for unavailable files
  QUnit.test("Not Available file paths", unavailableFiles.length, function() {
    for (var i = 0; i < unavailableFiles.length; i++) {
      var message = "No File found at " + unavailableFiles[i];
      ok(!hasFile(unavailableFiles[i]), message);
    }
  });

  // Tests for unavailable folders
  QUnit.test("Not Available folder paths", unavailableFolders.length,
             function() {
               for (var i = 0; i < unavailableFolders.length; i++) {
                 var message = "No Folder found at " + unavailableFolders[i];
                 ok(!hasFolder(unavailableFolders[i]), "Folder not found.");
               }
             });

  // Tests for files whose mapping is not present in the config
  QUnit.test("MappingNotFoundException - File Paths Mapping Not Found Error",
             errorFilePaths.length, function() {
               for (var i = 0; i < errorFilePaths.length; i++) {
                 throws(function() { hasFile(errorFilePaths[i]); },
                        MappingNotFoundException,
                        "MappingNotFoundException caught.");
               }
             });

  // Tests for folders whose mapping is not present in the config
  QUnit.test("MappingNotFoundException - Folder Paths Mapping Not Found Error",
             errorFolderPaths.length, function() {
               for (var i = 0; i < errorFolderPaths.length; i++) {
                 throws(function() { hasFolder(errorFolderPaths[i]); },
                        MappingNotFoundException,
                        "MappingNotFoundException caught");
               }
             });
}
