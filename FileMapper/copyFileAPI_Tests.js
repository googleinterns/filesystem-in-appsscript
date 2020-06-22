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

function copy_file_api_tests() {
  QUnit.module("copyFile API");

  TestUtil.setTestingEnvironment();

  // @ts-ignore
  // Tests for moving files
  QUnit.test("Copying Files", function() {
    var sourceFile = [
      "C:\\user\\Folder1\\File11.xls",
      "C:\\user\\Folder2\\Folder21\\File211.docx"
    ];
    var newFile = [
      "C:\\user\\Folder4\\Folder41\\File11.xls",
      "C:\\user\\Folder3\\File211.docx"
    ];
    var targetFolder = [ "C:\\user\\Folder4\\Folder41", "C:\\user\\Folder3" ];

    expect(4 * sourceFile.length);

    for (var i = 0; i < sourceFile.length; i++) {
      ok(hasFile(sourceFile[i]), "Source File Exists");
      ok(!hasFile(newFile[i]), "Destination File doesnot Exist");
      copyFile(sourceFile[i], targetFolder[i]);
      ok(hasFile(sourceFile[i]), "Source File Exists");
      ok(hasFile(newFile[i]), "Destination File Exists");
      deleteFile(newFile[i]);
      ApiUtil.eraseMapping(newFile[i]);
    }
  });

  // @ts-ignore
  // Tests for moving folders
  QUnit.test("Copying Folders", function() {
    var sourceFolder = [ "C:\\user\\Folder2\\Folder22", "C:\\user\\Folder1" ];
    var newFolder = [
      "C:\\user\\Folder3\\Folder22", "C:\\user\\Folder4\\Folder41\\Folder1"
    ];
    var targetFolder = [ "C:\\user\\Folder3", "C:\\user\\Folder4\\Folder41" ];

    expect(4 * sourceFolder.length);

    for (var i = 0; i < sourceFolder.length; i++) {
      ok(hasFolder(sourceFolder[i]), "Source Folder Exists");
      ok(!hasFolder(newFolder[i]), "Destination Folder doesnot Exist");
      copyFolder(sourceFolder[i], targetFolder[i]);
      ok(hasFolder(sourceFolder[i]), "Source Folder Exists");
      ok(hasFolder(newFolder[i]), "Destination Folder Exists");
      deleteFolder(newFolder[i]);
      ApiUtil.eraseMapping(newFolder[i]);
    }

    // Tests for files and folders which are not available hence can't be copied
    QUnit.test("FileDoesNotExistException - caught in copyFile function", 2,
               function() {
                 var targetFolder = "C:\\user\\MyFolder";
                 var file = "C:\\user\\Folder1\\Folder11\\MyFile.txt";
                 throws(function() { copyFile(file, targetFolder); },
                        FileDoesNotExistException,
                        "FileDoesNotExistException caught for target folder.");

                 targetFolder = "C:\\user";
                 throws(function() { copyFile(file, targetFolder); },
                        FileDoesNotExistException,
                        "FileDoesNotExistException caught for source file.");
               });

    // Tests for folders which are not available hence can't be copied
    QUnit.test("FileDoesNotExistException - caught in copyFolder function", 2,
               function() {
                 var targetFolder = "C:\\user\\MyFolder";
                 var folder = "C:\\user\\Folder1\\Folder11\\MyFolder";
                 throws(function() { copyFolder(folder, targetFolder); },
                        FileDoesNotExistException,
                        "FileDoesNotExistException caught for target folder.");

                 targetFolder = "C:\\user";
                 throws(function() { copyFile(folder, targetFolder); },
                        FileDoesNotExistException,
                        "FileDoesNotExistException caught for source folder.");
               });
  });
}
