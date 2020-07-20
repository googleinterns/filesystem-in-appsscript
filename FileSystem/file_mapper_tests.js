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
 * @fileoverview File Mapper Unit Tests
 */
var fileMapperTests = {
  setup: file_mapper_tests_setup,
  tests: {
    get: file_folder_get_tests,
    existence: file_folder_existence_tests,
    delete_tests: file_folder_delete_tests,
    create: file_folder_create_tests,
    move: file_folder_move_tests,
    copy: file_folder_copy_tests,
    search: file_folder_pattern_search_testing,
  }
};

function file_mapper_run_all_tests() {
  file_mapper_tests_setup();
  file_folder_get_tests();
  file_folder_existence_tests();
  file_folder_delete_tests();
  file_folder_create_tests();
  file_folder_move_tests();
  file_folder_copy_tests();
  file_folder_pattern_search_testing();
}

function file_mapper_tests_setup() {
  var moduleName = 'File Mapper';
  QUnit.module('FileMapper', {
    setup: function() {
      if (currentRunningTestModule != moduleName) {
        currentRunningTestModule = moduleName;
        DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
        setupTestEnvironment();
      }
    }
  });
  Workbook.setActiveWorkbookPath('c:\\user\\desktop');
}

function file_folder_get_tests() {
  QUnit.test('getFileID - Get file ID from localpath testing', 2, function() {
    var file1 = 'c:\\user\\desktop\\marks.xlsx';
    var file2 = 'c:\\user\\desktop\\attendance.xlsx';
    var fileId1 = FileMapper.getFileId(file1);
    var fileId2 = FileMapper.getFileId(file2);
    var actualId1 = '1i3M1cYfubmXnosn5LJQmHCghBzhPBrDjBQszkWvZkxA';
    var actualId2 = '1bJb_KzRHW9nqYLa0N1GqMNoWZIOwxIb-TxYlIrk1NSs';
    equal(fileId1, actualId1, file1 + ' found correctly');
    equal(fileId2, actualId2, file2 + ' found correctly');
  });

  QUnit.test(
      'getFolderID - Get folder ID from localpath testing', 1, function() {
        var folder = 'c:\\user\\desktop\\original';
        var folderId = FileMapper.getFolderId(folder);
        equal(folderId, '1x4uusmVrFYkOx_YJz6ikch8QzuR9uMDw');
      });
}

function file_folder_existence_tests() {
  QUnit.test('hasFile - Check if file exists testing', 2, function() {
    var file1 = 'c:\\user\\desktop\\marks.xlsx';
    var file2 = 'c:\\user\\desktop\\doesNotExist.xlsx';
    var hasFile1 = FileMapper.hasFile(file1);
    var hasFile2 = FileMapper.hasFile(file2);
    ok(hasFile1, 'hasFile works correctly');
    ok(!hasFile2, 'hasFile works correctly');
  });

  QUnit.test('hasFolder - Check if folder exists testing', 3, function() {
    var folder1 = 'c:\\User\\Desktop';
    var folder2 = 'c:\\user\\desktop\\folder2';
    var folder3 = 'c:\\user\\desktop\\doesNotExist';
    var hasFolder1 = FileMapper.hasFolder(folder1);
    var hasFolder2 = FileMapper.hasFolder(folder2);
    var hasFolder3 = FileMapper.hasFolder(folder3);
    ok(hasFolder1, 'hasFolder works correctly');
    ok(hasFolder2, 'hasFolder works correctly');
    ok(!hasFolder3, 'hasFolder works correctly');
  });
}

function file_folder_delete_tests() {
  QUnit.test('deleteFile - Delete a file testing', 2, function() {
    var file1 = 'c:\\user\\desktop\\folder1\\deletethis.txt';
    ok(FileMapper.hasFile(file1), 'File exists');
    FileMapper.deleteFile(file1);
    ok(!FileMapper.hasFile(file1), 'File does not exist');
  });

  QUnit.test('deleteFolder - Delete a folder testing', 2, function() {
    var folder1 = 'c:\\user\\desktop\\folder1\\deletethis';
    ok(FileMapper.hasFolder(folder1), 'Folder exists');
    FileMapper.deleteFolder(folder1);
    ok(!FileMapper.hasFolder(folder1), 'Folder does not exist');
  });
}

function file_folder_create_tests() {
  QUnit.test('createFile - Create a file testing', 2, function() {
    var file1 = 'c:\\user\\desktop\\folder1\\somenewfile.txt';
    ok(!FileMapper.hasFile(file1), 'File does not exist');
    FileMapper.createFile(file1);
    ok(FileMapper.hasFile(file1), 'File exists');
  });

  QUnit.test('createFolder - Create a folder testing', function() {
    expect(2);
    var folder1 = 'c:\\user\\desktop\\folder1\\somenewfolder';
    ok(!FileMapper.hasFolder(folder1), 'Folder does not exist');
    FileMapper.createFolder(folder1);
    ok(FileMapper.hasFolder(folder1), 'Folder exists');
  });
}

function file_folder_move_tests() {
  QUnit.test('moveFile - Move a file testing', 4, function() {
    var file1 = 'c:\\user\\desktop\\folder1\\movethis.txt';
    var destinationFile = 'c:\\user\\desktop\\folder2\\movethis.txt';
    var destination = 'c:\\user\\desktop\\folder2';
    ok(FileMapper.hasFile(file1), 'File exists');
    ok(!FileMapper.hasFile(destinationFile), 'File does not exist');
    FileMapper.moveFile(file1, destination);
    ok(FileMapper.hasFile(destinationFile), 'File exists');
    ok(!FileMapper.hasFile(file1), 'File does not exist');
  });

  QUnit.test('moveFolder - Move a folder testing', 5, function() {
    var folder1 = 'c:\\user\\desktop\\folder1\\movethis';
    var destinationFolder = 'c:\\user\\desktop\\folder2\\movethis';
    var destination = 'c:\\user\\desktop\\folder2';
    var cloneFile = 'c:\\user\\desktop\\folder2\\movethis\\clonethis.txt';
    ok(FileMapper.hasFolder(folder1), 'Folder exists');
    ok(!FileMapper.hasFolder(destinationFolder), 'Folder does not exist');
    FileMapper.moveFolder(folder1, destination);
    ok(FileMapper.hasFolder(destinationFolder), 'Folder exists');
    ok(!FileMapper.hasFolder(folder1), 'Folder does not exist');
    ok(FileMapper.hasFile(cloneFile), 'Folder moves correctly');
  });
}

function file_folder_copy_tests() {
  QUnit.test('copyFile - Copy a file testing', 4, function() {
    var file1 = 'c:\\user\\desktop\\folder1\\copythis.txt';
    var destinationFile = 'c:\\user\\desktop\\folder2\\copythis.txt';
    var destination = 'c:\\user\\desktop\\folder2';
    ok(FileMapper.hasFile(file1), 'File exists');
    ok(!FileMapper.hasFile(destinationFile), 'File does not exist');
    FileMapper.copyFile(file1, destination);
    ok(FileMapper.hasFile(destinationFile), 'File exists');
    ok(FileMapper.hasFile(file1), 'File exists');
  });

  QUnit.test('copyFolder - Copy a folder testing', 5, function() {
    var folder1 = 'c:\\user\\desktop\\folder1\\copythis';
    var destinationFolder = 'c:\\user\\desktop\\folder2\\copythis';
    var destination = 'c:\\user\\desktop\\folder2';
    var cloneFile = 'c:\\user\\desktop\\folder2\\copythis\\clonethis.txt';
    ok(FileMapper.hasFolder(folder1), 'Folder exists');
    ok(!FileMapper.hasFolder(destinationFolder), 'Folder does not exist');
    FileMapper.copyFolder(folder1, destination);
    ok(FileMapper.hasFolder(destinationFolder), 'Folder exists');
    ok(FileMapper.hasFolder(folder1), 'Folder exists');
    ok(FileMapper.hasFile(cloneFile), 'Folder copies correctly');
  });
}

function file_folder_pattern_search_testing() {
  QUnit.test(
      'findFilesByPattern - Search for files using wildcard pattern testing', 2,
      function() {
        var filePattern1 = 'c:\\user\\desktop\\folder1\\files\\*.txt';
        var filePattern2 = 'c:\\user\\desktop\\folder1\\files\\file?.txt';
        var fileMatches1 = FileMapper.findFilesByPattern(filePattern1);
        var fileMatches2 = FileMapper.findFilesByPattern(filePattern2);
        fileMatches1.sort();
        fileMatches2.sort();
        var actualMatches1 = ['file1.txt', 'file2.txt', 'somefile.txt'];
        var actualMatches2 = ['file1.txt', 'file2.txt'];
        deepEqual(
            fileMatches1, actualMatches1, 'File Pattern matches correctly');
        deepEqual(
            fileMatches2, actualMatches2, 'File Pattern matches correctly');
      });

  QUnit.test(
      'findFoldersByPattern - Search for folders using wildcard pattern testing',
      2, function() {
        var folderPattern1 = 'c:\\user\\desktop\\filesystem\\*';
        var folderPattern2 = 'c:\\user\\desktop\\filesystem\\folder?';
        var folderMatches1 = FileMapper.findFoldersByPattern(folderPattern1);
        var folderMatches2 = FileMapper.findFoldersByPattern(folderPattern2);
        folderMatches1.sort();
        folderMatches2.sort();
        var actualMatches1 = ['folders', 'copythis', 'folder1'];
        var actualMatches2 = ['folder1', 'folders'];
        actualMatches1.sort();
        actualMatches2.sort();
        deepEqual(
            folderMatches1, actualMatches1, 'Folder Pattern matches correctly');
        deepEqual(
            folderMatches2, actualMatches2, 'Folder Pattern matches correctly');
      });
}
