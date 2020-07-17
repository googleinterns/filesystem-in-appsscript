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
 * Delete File API Unit Tests for Windows File System
 */
function delete_file_api_windows_tests() {
  QUnit.module("WINDOWS - deleteFile API");

  var deleteFiles = [
    "C:\\user\\Folder1\\File13.docx",
    "C:\\user\\Folder3\\Folder31\\File311.xls",
  ];

  var deleteFolders = [
    "C:\\user\\Folder3\\Folder32", 
    "C:\\user\\Folder4\\Folder42",
    "C:\\user\\Folder3\\Folder31"
  ];

  // Tests for deleting files
  QUnit.test("Deleting files", deleteFiles.length, function() {
    for (var i = 0; i < deleteFiles.length; i++) {
      var message = "File deleted from " + deleteFiles[i];
      ok(deleteFile(deleteFiles[i]), message);
      deleteMapping(deleteFiles[i]);
    }
  });

  // Tests for deleting folders
  QUnit.test("Deleting folders", deleteFolders.length, function() {
    for (var i = 0; i < deleteFolders.length; i++) {
      var message = "Folder deleted from " + deleteFolders[i];
      ok(deleteFolder(deleteFolders[i]), message);
      deleteMapping(deleteFolders[i]);
    }
  });

  // Tests for files and folders which are not available hence can't be deleted
  QUnit.test(
      "FileDoesNotExistException - Error for already deleted file", 6,
      function() {
        var file = "C:\\user\\MyFile.txt";
        ok(createFile(file), "File Created.");
        ok(deleteFile(file), "File Deleted.");
        throws(function() { deleteFile(file); }, FileDoesNotExistException,
               "FileDoesNotExistException caught for file.");
        deleteMapping(file);  

        var folder = "C:\\user\\MyFolder";
        ok(createFolder(folder), "Folder Created.");
        ok(deleteFolder(folder), "Folder Deleted.");
        throws(function() { deleteFolder(folder); }, FileDoesNotExistException,
               "FileDoesNotExistException caught for folder.");
        deleteMapping(folder);
      });
}

/**
 * Delete File API Unit Tests for Unix File System
 */
function delete_file_api_unix_tests() {
  QUnit.module("UNIX - deleteFile API");

  var deleteFiles = [
    "/home/Folder1/File13.docx",
    "/home/Folder3/Folder31/File311.xls",
  ];

  var deleteFolders = [
    "/home/Folder3/Folder32", 
    "/home/Folder4/Folder42",
    "/home/Folder3/Folder31"
  ];

  // Tests for deleting files
  QUnit.test("Deleting files", deleteFiles.length, function() {
    for (var i = 0; i < deleteFiles.length; i++) {
      var message = "File deleted from " + deleteFiles[i];
      ok(deleteFile(deleteFiles[i]), message);
      deleteMapping(deleteFiles[i]);
    }
  });

  // Tests for deleting folders
  QUnit.test("Deleting folders", deleteFolders.length, function() {
    for (var i = 0; i < deleteFolders.length; i++) {
      var message = "Folder deleted from " + deleteFolders[i];
      ok(deleteFolder(deleteFolders[i]), message);
      deleteMapping(deleteFolders[i]);
    }
  });

  // Tests for files and folders which are not available hence can't be deleted
  QUnit.test(
      "FileDoesNotExistException - Error for already deleted file", 6,
      function() {
        var file = "/home/MyFile.txt";
        ok(createFile(file), "File Created.");
        ok(deleteFile(file), "File Deleted.");
        throws(function() { deleteFile(file); }, FileDoesNotExistException,
               "FileDoesNotExistException caught for file.");
        deleteMapping(file);

        var folder = "/home/MyFolder";
        ok(createFolder(folder), "Folder Created.");
        ok(deleteFolder(folder), "Folder Deleted.");
        throws(function() { deleteFolder(folder); }, FileDoesNotExistException,
               "FileDoesNotExistException caught for folder.");
        deleteMapping(folder); 
      });
}
