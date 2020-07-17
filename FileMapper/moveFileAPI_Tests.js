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
 * Move File API Unit Tests for Windows File System
 */
function move_file_api_windows_tests() {
  QUnit.module("WINDOWS - moveFile API");

  // @ts-ignore
  // Tests for moving files
  QUnit.test("Moving Files", function() {
    var sourceFile = [
      "C:\\user\\Folder1\\File11.xls", 
      "C:\\user\\Folder4\\Folder41\\File11.xls"
    ];
    var newFile = [
      "C:\\user\\Folder4\\Folder41\\File11.xls", 
      "C:\\user\\Folder1\\File11.xls"
    ];
    var targetFolder = [ 
      "C:\\user\\Folder4\\Folder41", 
      "C:\\user\\Folder1" 
    ];

    expect(4 * sourceFile.length);

    for (var i = 0; i < sourceFile.length; i++) {
      ok(hasFile(sourceFile[i]), "Source File Exists");
      ok(!hasFile(newFile[i]), "Destination File doesnot Exist");
      moveFile(sourceFile[i], targetFolder[i]);
      ok(!hasFile(sourceFile[i]), "Source File doesnot Exists");
      ok(hasFile(newFile[i]), "Destination File Exists");
      deleteMapping(newFile[i]);
    }
  });

  // @ts-ignore
  // Tests for moving folders
  QUnit.test("Moving Folders", function() {
    var sourceFolder = [ 
      "C:\\user\\Folder2\\Folder22", 
      "C:\\user\\Folder3\\Folder22" 
    ];
    var newFolder = [ 
      "C:\\user\\Folder3\\Folder22", 
      "C:\\user\\Folder2\\Folder22" 
    ];
    var targetFolder = [ 
      "C:\\user\\Folder3", 
      "C:\\user\\Folder2" 
    ];

    expect(4 * sourceFolder.length);

    for (var i = 0; i < sourceFolder.length; i++) {
      ok(hasFolder(sourceFolder[i]), "Source Folder Exists");
      ok(!hasFolder(newFolder[i]), "Destination Folder doesnot Exist");
      moveFolder(sourceFolder[i], targetFolder[i]);
      ok(!hasFolder(sourceFolder[i]), "Source Folder doesnot Exists");
      ok(hasFolder(newFolder[i]), "Destination Folder Exists");
      deleteMapping(newFolder[i]);
    }
  });

  // Tests for files and folders which are not available hence can't be moved
  QUnit.test("FileDoesNotExistException caught in moveFile function", 2,
             function() {
               var targetFolder = "C:\\user\\MyFolder";
               var file = "C:\\user\\Folder1\\Folder11\\MyFile.txt";
               throws(function() { moveFile(file, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for target folder.");

               targetFolder = "C:\\user";
               throws(function() { moveFile(file, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for source file.");
             });

  // Tests for folders which are not available hence can't be moved
  QUnit.test("FileDoesNotExistException caught in moveFolder function", 2,
             function() {
               var targetFolder = "C:\\user\\MyFolder";
               var folder = "C:\\user\\Folder1\\Folder11\\MyFolder";
               throws(function() { moveFolder(folder, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for target folder.");

               targetFolder = "C:\\user";
               throws(function() { moveFile(folder, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for source folder.");
             });
}

/**
 * Move File API Unit Tests for Unix File System
 */
function move_file_api_unix_tests() {
  QUnit.module("UNIX - moveFile API");

  // @ts-ignore
  // Tests for moving files
  QUnit.test("Moving Files", function() {
    var sourceFile = [
      "/home/Folder1/File11.xls", 
      "/home/Folder4/Folder41/File11.xls"
    ];
    var newFile = [
      "/home/Folder4/Folder41/File11.xls", 
      "/home/Folder1/File11.xls"
    ];
    var targetFolder = [ 
      "/home/Folder4/Folder41", 
      "/home/Folder1" 
    ];

    expect(4 * sourceFile.length);

    for (var i = 0; i < sourceFile.length; i++) {
      ok(hasFile(sourceFile[i]), "Source File Exists");
      ok(!hasFile(newFile[i]), "Destination File doesnot Exist");
      moveFile(sourceFile[i], targetFolder[i]);
      ok(!hasFile(sourceFile[i]), "Source File doesnot Exists");
      ok(hasFile(newFile[i]), "Destination File Exists");
      deleteMapping(newFile[i]);
    }
  });

  // @ts-ignore
  // Tests for moving folders
  QUnit.test("Moving Folders", function() {
    var sourceFolder = [ 
      "/home/Folder2/Folder22", 
      "/home/Folder3/Folder22" 
    ];
    var newFolder = [ 
      "/home/Folder3/Folder22", 
      "/home/Folder2/Folder22" 
    ];
    var targetFolder = [ 
      "/home/Folder3", 
      "/home/Folder2" 
    ];

    expect(4 * sourceFolder.length);

    for (var i = 0; i < sourceFolder.length; i++) {
      ok(hasFolder(sourceFolder[i]), "Source Folder Exists");
      ok(!hasFolder(newFolder[i]), "Destination Folder doesnot Exist");
      moveFolder(sourceFolder[i], targetFolder[i]);
      ok(!hasFolder(sourceFolder[i]), "Source Folder doesnot Exists");
      ok(hasFolder(newFolder[i]), "Destination Folder Exists");
      deleteMapping(newFolder[i]);
    }
  });

  // Tests for files and folders which are not available hence can't be moved
  QUnit.test("FileDoesNotExistException caught in moveFile function", 2,
             function() {
               var targetFolder = "/home/MyFolder";
               var file = "/home/Folder1/Folder11/MyFile.txt";
               throws(function() { moveFile(file, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for target folder.");

               targetFolder = "/home";
               throws(function() { moveFile(file, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for source file.");
             });

  // Tests for folders which are not available hence can't be moved
  QUnit.test("FileDoesNotExistException caught in moveFolder function", 2,
             function() {
               var targetFolder = "/home/MyFolder";
               var folder = "/home/Folder1/Folder11/MyFolder";
               throws(function() { moveFolder(folder, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for target folder.");

               targetFolder = "/home";
               throws(function() { moveFile(folder, targetFolder); },
                      FileDoesNotExistException,
                      "FileDoesNotExistException caught for source folder.");
             });
}
