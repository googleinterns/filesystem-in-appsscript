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
 * @fileoverview FileSystem Unit Tests
 */

var fileSystemApiTests = {
  setup: file_system_tests_setup,
  tests: {
    build_path: file_system_build_path_tests,
    temp_name: file_system_temp_tests,
    extension: file_system_extension_tests,
    name: file_system_name_tests,
    parent_folder: file_system_parent_folder_tests,
    base_names: file_system_base_names_test,
  }
};

function file_system_run_all_tests() {
  file_system_tests_setup();
  file_system_build_path_tests();
  file_system_temp_tests();
  file_system_extension_tests();
  file_system_name_tests();
  file_system_parent_folder_tests();
  file_system_base_names_test();
  file_system_file_handling_tests();
}

function file_system_tests_setup() {
  QUnit.module('FileSystem', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
    }
  });
}

function file_system_build_path_tests() {
  var buildPathTests = [
    {
      localPath: 'c:\\user\\desktop',
      name: 'folder1',
      expectedPath: 'c:\\user\\desktop\\folder1'
    },
    {
      localPath: 'c:\\user\\desktop\\',
      name: 'folder1',
      expectedPath: 'c:\\user\\desktop\\folder1'
    },
    {
      localPath: 'desktop\\folder2',
      name: 'folder1',
      expectedPath: 'desktop\\folder2\\folder1'
    },
    {
      localPath: 'desktop/folder2/',
      name: 'folder1',
      expectedPath: 'desktop/folder2/folder1'
    },
    {
      localPath: '..\\desktop\\',
      name: 'folder1',
      expectedPath: '..\\desktop\\folder1'
    },
  ];

  QUnit.test('Build Path testing', buildPathTests.length, function() {
    for (var i = 0; i < buildPathTests.length; i++) {
      var localPath = buildPathTests[i].localPath;
      var name = buildPathTests[i].name;
      var expectedPath = buildPathTests[i].expectedPath;
      var result = FileSystem.buildPath(localPath, name);
      var message = localPath + name + ' -> ' + expectedPath;
      equal(result, expectedPath, message);
    }
  });
}

function file_system_temp_tests() {
  QUnit.test('Get Temp Name testing', 100, function() {
    var tempNames = [];
    for (var i = 0; i < 101; i++) {
      tempNames.push(FileSystem.getTempName());
    }
    tempNames.sort();
    for (var i = 0; i < 100; i++) {
      notEqual(tempNames[i], tempNames[i + 1], 'Temp Names are random');
    }
  });
}

function file_system_extension_tests() {
  var extensionNameTests = {
    'c:\\user\\desktop\\file.txt': 'txt',
    '..\\file.txt': 'txt',
    'c:\\user\\desktop\\file.exe': 'exe',
    'file.exe': 'exe',
    'file': '',
  };

  var extensionNameTestsCount = Object.keys(extensionNameTests).length;

  QUnit.test('Get Extension Name testing', extensionNameTestsCount, function() {
    for (localPath in extensionNameTests) {
      var expectedExtension = extensionNameTests[localPath];
      var result = FileSystem.getExtensionName(localPath);
      var message = localPath + ' -> ' + expectedExtension;
      equal(result, expectedExtension, message);
    }
  });
}

function file_system_name_tests() {
  var fileNameTests = {
    'c:\\user\\desktop\\file.txt': 'file.txt',
    '..\\file.txt': 'file.txt',
    'c:\\user\\desktop\\file.exe': 'file.exe',
    'file.exe': 'file.exe',
    'file': 'file',
  };

  var fileNameTestsCount = Object.keys(fileNameTests).length;

  QUnit.test('Get File Name testing', fileNameTestsCount, function() {
    for (localPath in fileNameTests) {
      var expectedFileName = fileNameTests[localPath];
      var result = FileSystem.getFileName(localPath);
      var message = localPath + ' -> ' + expectedFileName;
      equal(result, expectedFileName, message);
    }
  });
}

function file_system_parent_folder_tests() {
  var parentFolderTests = {
    'c:\\user\\desktop\\file.txt': 'desktop',
    '..\\file.txt': 'user',
    'c:\\user\\desktop\\file.exe': 'desktop',
    'file.exe': 'desktop',
    'file': 'desktop',
  };

  var parentFolderTestsCount = Object.keys(parentFolderTests).length;

  QUnit.test(
      'Get Parent Folder Name testing', parentFolderTestsCount, function() {
        for (localPath in parentFolderTests) {
          var expectedFolderName = parentFolderTests[localPath];
          var result = FileSystem.getParentFolderName(localPath);
          var message = localPath + ' -> ' + expectedFolderName;
          equal(result, expectedFolderName, message);
        }
      });
}

function file_system_base_names_test() {
  var baseNameTests = {
    'c:\\user\\desktop\\file.txt': 'file',
    '..\\file.txt': 'file',
    'c:\\user\\desktop\\file.exe': 'file',
    'file.exe': 'file',
    'file': 'file',
  };

  var baseNameTestsCount = Object.keys(baseNameTests).length;

  QUnit.test('Get Base Name testing', baseNameTestsCount, function() {
    for (localPath in baseNameTests) {
      var expectedBaseName = baseNameTests[localPath];
      var result = FileSystem.getBaseName(localPath);
      var message = localPath + ' -> ' + expectedBaseName;
      equal(result, expectedBaseName, message);
    }
  });
}

var fileSystemHandlingTests = {
  setup: file_system_file_handling_tests_setup,
  tests: {
    exists: file_system_exists_testing,
    delete_tests: file_system_delete_testing,
    copy: file_system_copy_testing,
    move: file_system_move_testing,
  }
};

function file_system_file_handling_all_tests() {
  file_system_file_handling_tests_setup();
  file_system_exists_testing();
  file_system_delete_testing();
  file_system_copy_testing();
  file_system_move_testing();
}

function file_system_file_handling_tests_setup() {
  var moduleName = 'FileSystem - File Handling';
  QUnit.module('FileSystem - File Handling', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
      if (currentRunningTestModule != moduleName) {
        deleteFolderIfExists('c:\\user\\desktop\\filesystem_temp');
        var sourceFolder = 'c:\\user\\desktop\\original\\filesystem_temp';
        FileMapper.copyFolder(sourceFolder, 'c:\\user\\desktop');
      }
    }
  });
}

function file_system_exists_testing() {
  QUnit.test('Has File testing', 2, function() {
    var file1 = 'c:\\User\\Desktop\\filesystem\\file1.txt';
    var file2 = 'c:\\User\\Desktop\\filesystem\\doesnotexist.txt';
    var response1 = FileSystem.fileExists(file1);
    var response2 = FileSystem.fileExists(file2);
    ok(response1, 'File exists');
    ok(!response2, 'File does not exist');
  });

  QUnit.test('Has Folder testing', 2, function() {
    var folder1 = 'c:\\User\\Desktop\\filesystem\\folder1';
    var folder2 = 'c:\\User\\Desktop\\filesystem\\doesnotexist';
    var response1 = FileSystem.folderExists(folder1);
    var response2 = FileSystem.folderExists(folder2);
    ok(response1, 'Folder exists');
    ok(!response2, 'Folder does not exist');
  });
}

function file_system_delete_testing() {
  QUnit.test('Folder delete testing', 4, function() {
    var folder1 = 'filesystem_temp\\folder1';
    var folder2 = 'filesystem_temp\\folder2';
    var response1 = FileSystem.folderExists(folder1);
    var response2 = FileSystem.folderExists(folder2);
    ok(response1, 'Folder exists');
    ok(response2, 'Folder exists');
    FileSystem.deleteFolders('filesystem_temp\\folder?');
    var response3 = FileSystem.folderExists(folder1);
    var response4 = FileSystem.folderExists(folder2);
    ok(!response3, 'Folder does not exist');
    ok(!response4, 'Folder does not exist');
  });
}

function file_system_copy_testing() {
  QUnit.test('File copy file testing - 1', 5, function() {
    emptyFolder('temp');
    var file1 = 'filesystem/file1.txt';
    var file2 = 'filesystem/folder1/file1.txt';
    var target = 'temp/';
    // Check if file does not exist
    var response1 = FileSystem.fileExists('temp/file1.txt');
    ok(!response1, 'File does not exist');
    // Copy file
    FileSystem.copyFile(file1, target, false);
    var response2 = FileSystem.fileExists('temp/file1.txt');
    ok(response2, 'File exists');
    var file = FileSystem.getFile('temp/file1.txt');
    var data1 = file.driveEntity.getBlob().getDataAsString();
    var actualContent1 = 'Hello World.\r\nIt is a bright new world.\r\n';
    equal(data1, actualContent1, 'Data copied correctly');
    // Copy file with same name but overwrite
    FileSystem.copyFile(file2, target, true);
    var response3 = FileSystem.fileExists('temp/file1.txt');
    ok(response3, 'File exists');
    file = FileSystem.getFile('temp/file1.txt');
    var data2 = file.driveEntity.getBlob().getDataAsString();
    var actualContent2 = 'It is a bright new world.\r\n';
    equal(data2, actualContent2, 'Data copied correctly');
  });

  QUnit.test('File copy file testing - 2', 5, function() {
    emptyFolder('temp');
    var file1 = 'filesystem/file1.txt';
    var file2 = 'filesystem/folder1/file1.txt';
    var target = 'temp/file2.txt';
    // Check if file does not exist
    var response1 = FileSystem.fileExists(target);
    ok(!response1, 'File does not exist');
    // Copy file
    FileSystem.copyFile(file1, target, false);
    var response2 = FileSystem.fileExists(target);
    ok(response2, 'File exists');
    var file = FileSystem.getFile(target);
    var data1 = file.driveEntity.getBlob().getDataAsString();
    var actualContent1 = 'Hello World.\r\nIt is a bright new world.\r\n';
    equal(data1, actualContent1, 'Data copied correctly');
    // Copy file with same name but overwrite
    FileSystem.copyFile(file2, target, true);
    var response3 = FileSystem.fileExists(target);
    ok(response3, 'File exists');
    file = FileSystem.getFile(target);
    var data2 = file.driveEntity.getBlob().getDataAsString();
    var actualContent2 = 'It is a bright new world.\r\n';
    equal(data2, actualContent2, 'Data copied correctly');
  });

  QUnit.test('File copy folder testing', 5, function() {
    emptyFolder('temp');
    var folder1 = 'filesystem/copythis';
    var target = 'temp/new_folder';
    var targetFile = 'temp/new_folder/file.txt';
    // Check if file does not exist
    var response1 = FileSystem.folderExists(target);
    var response2 = FileSystem.folderExists(folder1);
    ok(!response1, 'Folder does not exist');
    ok(response2, 'Folder exists');
    // Copy folder
    FileSystem.copyFolder(folder1, target, false);
    var response3 = FileSystem.folderExists(target);
    var response4 = FileSystem.folderExists(folder1);
    var response5 = FileSystem.fileExists(targetFile);
    ok(response3, 'Folder exists');
    ok(response4, 'Folder exists');
    ok(response5, 'File exists');
  });
}

function file_system_move_testing() {
  QUnit.test('File move file testing - 1', 4, function() {
    emptyFolder('temp');
    var file1 = 'filesystem_temp/movethis.txt';
    var target = 'temp/';
    // Check if file does not exist
    var response1 = FileSystem.fileExists('temp/movethis.txt');
    var response2 = FileSystem.fileExists(file1);
    ok(!response1, 'File does not exist');
    ok(response2, 'Source File exists');
    // Move file
    FileSystem.moveFile(file1, target);
    var response3 = FileSystem.fileExists('temp/movethis.txt');
    ok(response3, 'File exists');
    var response4 = FileSystem.fileExists(file1);
    ok(!response4, 'File does not exist');
  });

  QUnit.test('File move file testing - 2', 4, function() {
    emptyFolder('temp');
    var file1 = 'filesystem_temp/movethis1.txt';
    var target = 'temp/some_new_name.txt';
    // Check if file does not exist
    var response1 = FileSystem.fileExists(target);
    var response2 = FileSystem.fileExists(file1);
    ok(!response1, 'File does not exist');
    ok(response2, 'Source File exists');
    // Move file
    FileSystem.moveFile(file1, target);
    var response3 = FileSystem.fileExists(target);
    ok(response3, 'File exists');
    var response4 = FileSystem.fileExists(file1);
    ok(!response4, 'File does not exist');
  });

  QUnit.test('File move folder testing', 4, function() {
    emptyFolder('temp');
    var folder1 = 'filesystem_temp/movethis';
    var target = 'temp/new_folder';
    // Check if file does not exist
    var response1 = FileSystem.folderExists(target);
    var response2 = FileSystem.folderExists(folder1);
    ok(!response1, 'Folder does not exist');
    ok(response2, 'Folder exists');
    // Copy folder
    FileSystem.moveFolder(folder1, target, false);
    var response3 = FileSystem.folderExists(target);
    var response4 = FileSystem.folderExists(folder1);
    ok(response3, 'Folder exists');
    ok(!response4, 'Folder does not exist');
  });
}
