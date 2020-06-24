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