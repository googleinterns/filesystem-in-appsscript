/**
 * @fileoverview DirectoryManager Unit Tests
 */
function directory_manager_run_all_tests() {
  Workbook.setActiveWorkbookPath('c:\\user\\desktop');
  QUnit.module('DirectoryManager', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
    }
  });
  validation_util_tests();
  current_directory_tests();
  absolute_localpath_tests();
  misc_tests();
  dir_tests();
  kill_tests();
}

function validation_util_tests() {
  QUnit.test('Absolute Windows Path - Regex Expression Testing', function() {
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
    expect(winCorrectPaths.length + winIncorrectPaths.length);
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

  QUnit.test('Absolute Unix Path - Regex Expression Testing', function() {
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
    expect(unixCorrectPaths.length + unixIncorrectPaths.length);
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
      'Current Directory is initialized to active workbook path', function() {
        Workbook.setActiveWorkbookPath('C:\\User\\Desktop\\');
        DirectoryManager.currentDirectory = '';
        var directory = DirectoryManager.getCurrentDirectory();
        var workbookPath = Workbook.getActiveWorkbookPath();
        equal(directory, workbookPath, 'Current Directory set correctly');
      });

  QUnit.test('CurDir API - Returns Current Directory', function() {
    Workbook.setActiveWorkbookPath('C:\\User\\Desktop\\');
    DirectoryManager.currentDirectory = '';
    var currentDirectory = DirectoryManager.getCurrentDirectory();
    var curDirResponse = DirectoryManager.curDir();
    equal(currentDirectory, curDirResponse, 'CurDir() works correctly');
  });

  QUnit.test('CurDir API - Drive Parameter Tests', function() {
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

  QUnit.test('ChDir API - Change Directory Tests', function() {
    expect(4);
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
  QUnit.test(
      'Windows Conversion of Relative Path to Absolute Path Tests', function() {
        var currentDirectory = 'C:\\Users\\Desktop';
        var absolutePathTests = {
          'C:\\Users': 'C:\\Users',
          'C:\\Users\\': 'C:\\Users',
          'C:\\': 'C:\\',
        };
        var relativePathTests = {
          'Documents\\file1.txt': currentDirectory + '\\Documents\\file1.txt',
          '..': 'C:\\Users',
          '..\\folder1': 'C:\\Users\\folder1',
          '.\\folder1': currentDirectory + '\\folder1',
          '.\\folder1\\..': currentDirectory,
          '..\\..\\': 'C:\\',
          '..\\..': 'C:\\',
          '..\\..\\..': 'C:\\',
          '..\\..\\..\\': 'C:\\',
          '..\\..\\..\\Users\\': 'C:\\Users',
        };
        var absoluteCount = Object.keys(absolutePathTests).length;
        var relativeCount = Object.keys(relativePathTests).length;
        expect(absoluteCount + relativeCount);
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
  QUnit.test(
      'Unix Conversion of Relative Path to Absolute Path Tests', function() {
        var currentDirectory = '/Users/Satvik/Desktop';
        DirectoryManager.fileSystemType = FileSystemType.UNIX;
        var absolutePathTests = {
          '/Users': '/Users',
          '/Users/': '/Users',
          '/Users/Desktop': '/Users/Desktop',
        };
        var relativePathTests = {
          'Documents/file1.txt': currentDirectory + '/Documents/file1.txt',
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
        var absoluteCount = Object.keys(absolutePathTests).length;
        var relativeCount = Object.keys(relativePathTests).length;
        expect(absoluteCount + relativeCount);
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
  QUnit.test('FileLen - File Length Testing', function() {
    expect(1);
    var filePath = 'c:\\User\\Desktop\\folder1\\FileLengthTest.txt';
    var fileLength = DirectoryManager.getFileLength(filePath);
    equal(fileLength, 192, 'File length is correct');
  });

  QUnit.test('FileDateTime - DateTime String Testing', function() {
    expect(1);
    var filePath = 'c:\\User\\Desktop\\marks.xlsx';
    var dateTime = DirectoryManager.getFileDateTime(filePath);
    var dateTimeRegExp =
        /^\d{1,2}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2} (AM|PM)$/;
    ok(dateTimeRegExp.test(dateTime), 'Date Time format is correct');
  });
}

function dir_tests() {
  QUnit.test('Dir() - Search Files by Pattern Testing - 1', function() {
    expect(5);
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

  QUnit.test('Dir() - Search Files by Pattern Testing - 2', function() {
    expect(4);
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

  QUnit.test('Dir() - Search Files by Pattern Testing - 3', function() {
    expect(3);
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
  QUnit.test('Kill() - Delete Files by Pattern Testing', function() {
    expect(4);
    var file;
    var pattern = 'folder1\\killtests\\*.txt';
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
