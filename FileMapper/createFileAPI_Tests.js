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
 * Create File API Unit Tests
 */
function create_file_api_tests() {
  QUnit.module("createFile API");

  TestUtil.setTestingEnvironment();

  var newFiles = [
    "C:\\user\\Folder1\\File13.docx",
    "C:\\user\\Folder3\\Folder31\\File311.xls",
  ];

  var newFolders = [
    "C:\\user\\Folder3\\Folder32\\Folder321", 
    "C:\\user\\Folder4\\Folder42"
  ];

  // Tests for creating new files
  QUnit.test("Creating new files", newFiles.length, function() {
    for (var i = 0; i < newFiles.length; i++) {
      var message = "File created at " + newFiles[i];
      ok(createFile(newFiles[i]), message);
    }
  });

  // Tests for creating new folders
  QUnit.test("Creating new folders", newFolders.length, function() {
    for (var i = 0; i < newFolders.length; i++) {
      var message = "Folder created at " + newFolders[i];
      ok(createFolder(newFolders[i]), message);
    }
  });

  // Tests for creating a deleted file
  QUnit.test("Create a deleted file", 3, function() {
    var localPath = "C:\\user\\MyFile.txt";
    ok(createFile(localPath), "File Created.");
    ok(deleteFile(localPath), "File Deleted.");
    ok(createFile(localPath), "Deleted File Created.");
    deleteFile(localPath);
  });

  // Tests for files and folders which are already available hence can't be
  // created
  QUnit.test(
      "FileAlreadyExistsException - Cannot create existing file/folder", 2,
      function() {
        var file = "C:\\user\\Folder1\\File11.xls";
        throws(function() { createFile(file); }, FileAlreadyExistsException,
               "FileAlreadyExistsException caught for file.");

        var folder = "C:\\user\\Folder4\\Folder41\\Folder411";
        throws(function() { createFolder(folder); }, FileAlreadyExistsException,
               "FileAlreadyExistsException caught for folder.");
      });

  // Tests for files and folders whose mapping is not present in the config
  QUnit.test(
      "MappingNotFoundException - Error to prompt the user for mapping", 2,
      function() {
        var file = "C:\\Folder1\\File11.xls";
        throws(function() { createFile(file); }, MappingNotFoundException,
               "MappingNotFoundException caught for file.");

        var folder = "C:\\Folder4\\Folder41\\Folder411";
        throws(function() { createFolder(folder); }, MappingNotFoundException,
               "MappingNotFoundException caught for folder.");
      });
}
