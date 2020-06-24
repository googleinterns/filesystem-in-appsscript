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
 * @fileoverview VbaFolder Unit Tests
 */

function vba_folder_run_all_tests() {
  QUnit.module('VbaFolder', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
    }
  });

  var folderPath = 'folder1';
  var fullPath = 'c:\\user\\desktop\\folder1';
  var folderId = FileMapper.getFolderId(fullPath);
  var driveFolder = DriveApp.getFolderById(folderId);

  QUnit.test('Folder create testing', 2, function() {
    var vbaFolder = FileSystem.getFolder(folderPath);
    equal(
        folderId, vbaFolder.driveId, 'Folder created correctly - Id Check');
    equal(
        fullPath, vbaFolder.localPath,
        'Folder created correctly - Id Check');
  });

  QUnit.test('Folder date property testing', 3, function() {
    var vbaFolder = FileSystem.getFolder(folderPath);
    var dateCreated = vbaFolder.getDateCreated();
    var dateLastAccessed = vbaFolder.getDateLastAccessed();
    var dateLastModified = vbaFolder.getDateLastModified();
    equal(
        dateCreated.date.getTime(), driveFolder.getDateCreated().getTime(),
        'Date Created Test');
    equal(
        dateLastAccessed.date.getTime(), driveFolder.getLastUpdated().getTime(),
        'Date Accessed Test');
    equal(
        dateLastModified.date.getTime(), driveFolder.getLastUpdated().getTime(),
        'Date Modified Test');
  });

  QUnit.test('Folder misc property testing', 3, function() {
    var vbaFolder = FileSystem.getFolder(folderPath);
    var folderType = vbaFolder.getType();
    var folderSize = vbaFolder.getSize();
    var path = vbaFolder.getPath();
    deepEqual(folderType, 'File Folder', 'Folder Type Test');
    deepEqual(folderSize, driveFolder.getSize(), 'Folder Size Test');
    deepEqual(path, fullPath, 'Folder Path Test');
  });

  QUnit.test('Folder directory property testing', 2, function() {
    var vbaFolder = FileSystem.getFolder(folderPath);
    var vbaDrive = vbaFolder.getDrive();
    var vbaParentFolder = vbaFolder.getParentFolder();
    var parentFolderPath = vbaParentFolder.getPath();
    var actualParentFolderPath = getParentFolderPath(fullPath);
    equal(vbaDrive, 'C:', 'Drive Test');
    equal(parentFolderPath, actualParentFolderPath, 'Parent Folder Path Test');
  });

  QUnit.test('Folder get files testing', 1, function() {
    var vbaFolder = FileSystem.getFolder('folder1\\files');
    var vbaFiles = vbaFolder.getFiles();
    var fileNames = [];
    for (var i = 0; i < vbaFiles.length; i++) {
      fileNames.push(vbaFiles[i].name());
    }
    var actualFileNames = ['file1.txt', 'file2.txt', 'somefile.txt'];
    fileNames.sort();
    actualFileNames.sort();
    deepEqual(fileNames, actualFileNames, 'Get Files Test')
  });

  QUnit.test('Folder get sub folders testing', 1, function() {
    var vbaFolder = FileSystem.getFolder(DirectoryManager.curDir());
    var vbaFolders = vbaFolder.getSubFolders();
    var folderNames = [];
    for (var i = 0; i < vbaFolders.length; i++) {
      folderNames.push(vbaFolders[i].name());
    }
    var actualFolderNames = ['folder1', 'folder2', 'original'];
    folderNames.sort();
    actualFolderNames.sort();
    deepEqual(folderNames, actualFolderNames, 'Get Folders Test')
  });
}
