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

var vbaFolderTests = {
  setup: vba_folder_tests_setup,
  tests: {
    create: vba_folder_create_testing,
    date: folder_date_testing,
    misc: folder_misc_testing,
    directory: folder_directory_testing,
    get: {
      tests: {
        'sub_folders': folder_get_subfolders_testing,
        'files': folder_get_files_testing,
      }
    }
  }
};

function vba_folder_run_all_tests() {
  vba_folder_tests_setup();
  vba_folder_create_testing();
  folder_date_testing();
  folder_misc_testing();
  folder_directory_testing();
  folder_get_files_testing();
  folder_get_subfolders_testing();
}

function vba_folder_create_testing() {
  var folderPath = 'folder1';
  var fullPath = 'c:\\user\\desktop\\folder1';
  var folderId = FileMapper.getFolderId(fullPath);
  QUnit.test('Folder create testing', 2, function() {
    var vbaFolder = FileSystem.getFolder(folderPath);
    equal(folderId, vbaFolder.driveId, 'Folder created correctly - Id Check');
    equal(fullPath, vbaFolder.localPath, 'Folder created correctly - Id Check');
  });
}

function folder_date_testing() {
  var folderPath = 'folder1';
  var fullPath = 'c:\\user\\desktop\\folder1';
  var folderId = FileMapper.getFolderId(fullPath);
  var driveFolder = DriveApp.getFolderById(folderId);
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
}

function folder_misc_testing() {
  var folderPath = 'folder1';
  var fullPath = 'c:\\user\\desktop\\folder1';
  var folderId = FileMapper.getFolderId(fullPath);
  var driveFolder = DriveApp.getFolderById(folderId);
  QUnit.test('Folder misc property testing', 3, function() {
    var vbaFolder = FileSystem.getFolder(folderPath);
    var folderType = vbaFolder.getType();
    var folderSize = vbaFolder.getSize();
    var path = vbaFolder.getPath();
    deepEqual(folderType, 'File Folder', 'Folder Type Test');
    deepEqual(folderSize, driveFolder.getSize(), 'Folder Size Test');
    deepEqual(path, fullPath, 'Folder Path Test');
  });
}

function folder_directory_testing() {
  var folderPath = 'folder1';
  var fullPath = 'c:\\user\\desktop\\folder1';
  QUnit.test('Folder directory property testing', 2, function() {
    var vbaFolder = FileSystem.getFolder(folderPath);
    var vbaDrive = vbaFolder.getDrive();
    var vbaParentFolder = vbaFolder.getParentFolder();
    var parentFolderPath = vbaParentFolder.getPath();
    var actualParentFolderPath = getParentFolderPath(fullPath);
    equal(vbaDrive, 'C:', 'Drive Test');
    equal(parentFolderPath, actualParentFolderPath, 'Parent Folder Path Test');
  });
}

function folder_get_files_testing() {
  QUnit.test('Folder get files testing', 1, function() {
    var vbaFolder = FileSystem.getFolder('folder1\\files');
    var vbaFileCollection = vbaFolder.getFiles();
    var fileNames = [];
    var Item;
    for (__iter1 = new ValueIterator(vbaFileCollection),
        Item = __iter1.getNext();
         !isValueIteratorEnd(Item); Item = __iter1.getNext()) {
      fileNames.push(Item.name());
    }
    var actualFileNames = ['file1.txt', 'file2.txt', 'somefile.txt'];
    fileNames.sort();
    actualFileNames.sort();
    deepEqual(fileNames, actualFileNames, 'Get Files Test')
  });
}

function folder_get_subfolders_testing() {
  QUnit.test('Folder get sub folders testing', 1, function() {
    var vbaFolder = FileSystem.getFolder('filesystem/folders');
    var vbaFolderCollection = vbaFolder.getSubFolders();
    var folderNames = [];
    var Item;
    for (__iter1 = new ValueIterator(vbaFolderCollection),
        Item = __iter1.getNext();
         !isValueIteratorEnd(Item); Item = __iter1.getNext()) {
      folderNames.push(Item.name());
    }
    var actualFolderNames = ['folder1', 'folder2', 'folder3'];
    folderNames.sort();
    actualFolderNames.sort();
    deepEqual(folderNames, actualFolderNames, 'Get Folders Test')
  });
}

function vba_folder_tests_setup() {
  QUnit.module('VbaFolder', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
    }
  });
}
