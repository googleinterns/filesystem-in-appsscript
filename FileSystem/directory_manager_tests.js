/**
 * @fileoverview DirectoryManager Unit Tests
 */

var directoryManagerTests = {
  setup: directory_manager_setup,
  tests: {
    util: validation_util_tests,
    current_directory: current_directory_tests,
    absolute_path: absolute_localpath_tests,
    misc: misc_tests,
    dir: dir_tests,
    kill: kill_tests,
  }
};

function directory_manager_run_all_tests() {
  directory_manager_setup();
  validation_util_tests();
  current_directory_tests();
  absolute_localpath_tests();
  misc_tests();
  dir_tests();
  kill_tests();
  directory_manipulate_api_tests();
}

function directory_manager_setup() {
  QUnit.module('DirectoryManager', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
    }
  });
}

function validation_util_tests() {
  var winCorrectPaths = [
    'C:\\',
    'c:\\',
    'D:\\',
    'C:\\Users',
    'C:\\Desktop',
    'C:\\users\\Desktop',
    'C:\\users\\Desktop\\',
    'C:\\users\\Desktop\\space allowed',
    'C:\\users\\Desktop\\file1.html',
    'C:\\users\\Desktop\\characters allowed #$,[]{}',
    'C:\\users\\folder\\date allowed 12-23-2015',
  ];
  var winIncorrectPaths = [
    'C:/',
    'C:\\Desktop/users',
    'C:\\Desktop\\users\\\\',
    'C:\\Desktop\\users\\okay/',
    'C:\\Desktop\\users\\reserved <',
    'C:\\Desktop\\users\\reserved >',
    'C:\\Desktop\\users\\reserved :',
    'C:\\Desktop\\users\\reserved ?',
    'C:\\Desktop\\users\\reserved *',
    'C:\\Desktop\\users\\reserved /',
    '../RelativeNotAllowed',
    'RelativeNotAllowed',
    './RelativeNotAllowed',
    '\\Desktio\\Users',
    'C\\Desktio\\Users',
    'Drive:\\Desktop\\Users',
    '/abc/def/ghi',
    'abc/def/ghi',
  ];
  var winTests = winCorrectPaths.length + winIncorrectPaths.length;
  QUnit.test(
      'Absolute Windows Path - Regex Expression Testing', winTests, function() {
        // Windows Tests - Positive
        for (var i = 0; i < winCorrectPaths.length; i++) {
          var errorMessage = winCorrectPaths[i] + ' is valid';
          ok(windowsPathRegExp.test(winCorrectPaths[i]), errorMessage);
        }
        // Windows Tests - Negative
        for (var i = 0; i < winIncorrectPaths.length; i++) {
          var errorMessage = winIncorrectPaths[i] + ' is invalid';
          ok(!windowsPathRegExp.test(winIncorrectPaths[i]), errorMessage);
        }
      });

  var unixCorrectPaths = [
    '/',
    '/users',
    '/users/Desktop',
    '/users/Desktop/',
    '/users/Desktop/file',
    '/users/Desktop/file.html',
    '/users/Desktop/characters allowed #$,[]{}',
    '/users/Desktop/date allowed 12-23-2015',
  ];
  var unixIncorrectPaths = [
    '\\users',
    '\\users\\Desktop',
    '/users\\desktop',
    'C:\\Desktop\\users\\',
    'C:\\',
    'relativeNotAllowed',
    '../relativeNotAllowed',
    './relativeNotAllowed',
    '/Desktop/users/reserved <',
    '/Desktop/users/reserved >',
    '/Desktop/users/reserved :',
    '/Desktop/users/reserved ?',
    '/Desktop/users/reserved *',
    '/Desktop/users/reserved\\hef',
  ];
  var unixTests = unixCorrectPaths.length + unixIncorrectPaths.length;

  QUnit.test(
      'Absolute Unix Path - Regex Expression Testing', unixTests, function() {
        // Unix Tests - Positive
        for (var i = 0; i < unixCorrectPaths.length; i++) {
          var errorMessage = unixCorrectPaths[i] + ' is valid';
          ok(unixPathRegExp.test(unixCorrectPaths[i]), errorMessage);
        }
        // Unix Tests - Negative
        for (var i = 0; i < unixIncorrectPaths.length; i++) {
          var errorMessage = unixIncorrectPaths[i] + ' is invalid';
          ok(!unixPathRegExp.test(unixIncorrectPaths[i]), errorMessage);
        }
      });
}

function current_directory_tests() {
  QUnit.test(
      'Current Directory is initialized to active workbook path', 1,
      function() {
        Workbook.setActiveWorkbookPath('C:\\User\\Desktop\\');
        DirectoryManager.currentDirectory = '';
        var directory = DirectoryManager.getCurrentDirectory();
        var workbookPath = Workbook.getActiveWorkbookPath();
        equal(directory, workbookPath, 'Current Directory set correctly');
      });

  QUnit.test('CurDir API - Returns Current Directory', 1, function() {
    Workbook.setActiveWorkbookPath('C:\\User\\Desktop\\');
    DirectoryManager.currentDirectory = '';
    var currentDirectory = DirectoryManager.getCurrentDirectory();
    var curDirResponse = DirectoryManager.curDir();
    equal(currentDirectory, curDirResponse, 'CurDir() works correctly');
  });

  QUnit.test('CurDir API - Drive Parameter Tests', 3, function() {
    Workbook.setActiveWorkbookPath('C:\\User\\Desktop\\');
    DirectoryManager.currentDirectory = '';
    var currentDirectory = DirectoryManager.getCurrentDirectory();
    var curDirResponse = DirectoryManager.curDir('C');
    equal(currentDirectory, curDirResponse, 'CurDir("C") works correctly');
    curDirResponse = DirectoryManager.curDir('c');
    equal(currentDirectory, curDirResponse, 'CurDir("c") works correctly');
    curDirResponse = DirectoryManager.curDir('D');
    equal('D:\\', curDirResponse, 'CurDir("D") works correctly');
  });

  QUnit.test('ChDir API - Change Directory Tests', 4, function() {
    var currentDirectory = DirectoryManager.curDir();
    var rootPath = 'c:\\user\\desktop';
    var folder1 = 'c:\\user\\desktop\\folder1';
    var folder2 = 'c:\\user\\desktop\\folder2';
    var folderOriginal = 'c:\\user\\desktop\\original';
    equal(currentDirectory, rootPath, 'Current Directory is at root');
    DirectoryManager.changeDirectory('folder1');
    currentDirectory = DirectoryManager.curDir();
    equal(currentDirectory, folder1, 'current directory is folder1');
    DirectoryManager.changeDirectory('..\\folder2');
    currentDirectory = DirectoryManager.curDir();
    equal(currentDirectory, folder2, 'current directory is folder2');
    DirectoryManager.changeDirectory(folderOriginal);
    currentDirectory = DirectoryManager.curDir();
    equal(currentDirectory, folderOriginal, 'current directory is original');
  });
}

function absolute_localpath_tests() {
  var winCurrentDirectory = 'C:\\Users\\Desktop';
  var windowsAbsolutePathTests = {
    'C:\\Users': 'C:\\Users',
    'C:\\Users\\': 'C:\\Users',
    'C:\\': 'C:\\',
  };
  var windowsRelativePathTests = {
    'Documents\\file1.txt': winCurrentDirectory + '\\Documents\\file1.txt',
    '..': 'C:\\Users',
    '..\\folder1': 'C:\\Users\\folder1',
    '.\\folder1': winCurrentDirectory + '\\folder1',
    '.\\folder1\\..': winCurrentDirectory,
    '..\\..\\': 'C:\\',
    '..\\..': 'C:\\',
    '..\\..\\..': 'C:\\',
    '..\\..\\..\\': 'C:\\',
    '..\\..\\..\\Users\\': 'C:\\Users',
  };
  var winAbsoluteCount = Object.keys(windowsAbsolutePathTests).length;
  var winRelativeCount = Object.keys(windowsRelativePathTests).length;
  var winTestsCount = winAbsoluteCount + winRelativeCount;

  QUnit.test(
      'Windows Conversion of Relative Path to Absolute Path Tests',
      winTestsCount, function() {
        var currentDirectory = winCurrentDirectory;
        var absolutePathTests = windowsAbsolutePathTests;
        var relativePathTests = windowsRelativePathTests;
        for (var path in absolutePathTests) {
          var response = getAbsoluteLocalPath(currentDirectory, path);
          var message = path + ' -> ' + absolutePathTests[path];
          equal(response, absolutePathTests[path], message);
        }
        for (var path in relativePathTests) {
          var response = getAbsoluteLocalPath(currentDirectory, path);
          var message = path + ' -> ' + relativePathTests[path];
          equal(response, relativePathTests[path], message);
        }
      });

  var unixCurrentDirectory = '/Users/Satvik/Desktop';
  var unixAbsolutePathTests = {
    '/Users': '/Users',
    '/Users/': '/Users',
    '/Users/Desktop': '/Users/Desktop',
  };
  var unixRelativePathTests = {
    'Documents/file1.txt': unixCurrentDirectory + '/Documents/file1.txt',
    '..': '/Users/Satvik',
    '../': '/Users/Satvik',
    '../folder1': '/Users/Satvik/folder1',
    '../folder1/': '/Users/Satvik/folder1',
    '../folder1/..': '/Users/Satvik',
    '../folder1/../folder2': '/Users/Satvik/folder2',
    '../..': '/Users',
    '../../..': '/',
    '../../../..': '/',
    '../../../../Users': '/Users',
  };
  var unixAbsoluteCount = Object.keys(unixAbsolutePathTests).length;
  var unixRelativeCount = Object.keys(unixRelativePathTests).length;
  var unixTestCount = unixAbsoluteCount + unixRelativeCount;

  QUnit.test(
      'Unix Conversion of Relative Path to Absolute Path Tests', unixTestCount,
      function() {
        var currentDirectory = unixCurrentDirectory;
        DirectoryManager.fileSystemType = FileSystemType.UNIX;
        var absolutePathTests = unixAbsolutePathTests;
        var relativePathTests = unixRelativePathTests;
        for (var path in absolutePathTests) {
          var response = getAbsoluteLocalPath(currentDirectory, path);
          var message = path + ' -> ' + absolutePathTests[path];
          equal(response, absolutePathTests[path], message);
        }
        for (var path in relativePathTests) {
          var response = getAbsoluteLocalPath(currentDirectory, path);
          var message = path + ' -> ' + relativePathTests[path];
          equal(response, relativePathTests[path], message);
        }
        DirectoryManager.fileSystemType = FileSystemType.WINDOWS;
      });
}

function misc_tests() {
  QUnit.test('FileLen - File Length Testing', 1, function() {
    var filePath = 'c:\\User\\Desktop\\folder1\\FileLengthTest.txt';
    var fileLength = DirectoryManager.getFileLength(filePath);
    equal(fileLength, 192, 'File length is correct');
  });

  QUnit.test('FileDateTime - DateTime String Testing', 1, function() {
    var filePath = 'c:\\User\\Desktop\\marks.xlsx';
    var dateTime = DirectoryManager.getFileDateTime(filePath);
    var dateTimeRegExp =
        /^\d{1,2}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2} (AM|PM)$/;
    ok(dateTimeRegExp.test(dateTime), 'Date Time format is correct');
  });
}

function dir_tests() {
  QUnit.test('Dir() - Search Files by Pattern Testing - 1', 5, function() {
    var file;
    var pattern = 'folder1\\files\\*.txt';
    file = DirectoryManager.searchFiles(pattern);
    equal(file, 'file1.txt');
    file = DirectoryManager.searchFiles();
    equal(file, 'file2.txt');
    file = DirectoryManager.searchFiles();
    equal(file, 'somefile.txt');
    file = DirectoryManager.searchFiles();
    equal(file, '');
    throws(function() {
      file = DirectoryManager.searchFiles();
    }, 'No more matching files', 'Error thrown correctly');
  });

  QUnit.test('Dir() - Search Files by Pattern Testing - 2', 4, function() {
    var file;
    var pattern = 'folder1\\files\\file?.txt';
    file = DirectoryManager.searchFiles(pattern);
    equal(file, 'file1.txt');
    file = DirectoryManager.searchFiles();
    equal(file, 'file2.txt');
    file = DirectoryManager.searchFiles();
    equal(file, '');
    throws(function() {
      file = DirectoryManager.searchFiles();
    }, 'No more matching files', 'Error thrown correctly');
  });

  QUnit.test('Dir() - Search Files by Pattern Testing - 3', 3, function() {
    var file;
    var pattern = 'folder1\\files\\somefile.txt';
    file = DirectoryManager.searchFiles(pattern);
    equal(file, 'somefile.txt');
    file = DirectoryManager.searchFiles();
    equal(file, '');
    throws(function() {
      file = DirectoryManager.searchFiles();
    }, 'No more matching files', 'Error thrown correctly');
  });
}

function kill_tests() {
  QUnit.test('Kill() - Delete Files by Pattern Testing', 4, function() {
    var folder1 = 'c:\\User\\Desktop\\killtests';
    try {
      FileMapper.deleteFolder(folder1);
    } catch (e) {
      // Do Nothing
    }
    var originalFolder1 = 'c:\\User\\Desktop\\original\\killtests';
    FileMapper.copyFolder(originalFolder1, 'c:\\User\\Desktop');
    var file;
    var pattern = 'killtests\\*.txt';
    file = DirectoryManager.searchFiles(pattern);
    equal(file, 'killthis1.txt');
    file = DirectoryManager.searchFiles();
    equal(file, 'killthis2.txt');
    file = DirectoryManager.searchFiles();
    equal(file, '');
    DirectoryManager.deleteFiles(pattern);
    file = DirectoryManager.searchFiles(pattern);
    equal(file, '');
  });
}

function directory_manipulate_api_tests() {
  QUnit.test('RmDir() - Delete Empty Folder Testing', 2, function() {
    var folderPath = 'folder1/rmdirthis';
    var absolutePath = DirectoryManager.getAbsolutePath(folderPath);
    var folderExists = FileMapper.hasFolder(absolutePath);
    ok(folderExists, 'Folder exists');
    DirectoryManager.deleteDirectory(folderPath);
    folderExists = FileMapper.hasFolder(absolutePath);
    ok(!folderExists, 'Folder is deleted');
  });

  QUnit.test('RmDir() - Delete Folder with files Testing', 3, function() {
    var folderPath = 'folder1/files';
    var absolutePath = DirectoryManager.getAbsolutePath(folderPath);
    var folderExists = FileMapper.hasFolder(absolutePath);
    ok(folderExists, 'Folder exists');
    var errorMessage = absolutePath + ' is not an empty directory';
    throws(function() {
      DirectoryManager.deleteDirectory(folderPath);
    }, errorMessage, 'Error thrown correctly');
    folderExists = FileMapper.hasFolder(absolutePath);
    ok(folderExists, 'Folder is not deleted');
  });
}
