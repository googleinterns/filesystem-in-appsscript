/**
 * @fileoverview DirectoryManager Unit Tests
 */
function directory_manager_run_all_tests() {
  QUnit.module('DirectoryManager');
  validation_util_tests();
  current_directory_tests();
  absolute_localpath_tests();
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
        Workbook.setActiveWorkbookPath('C:\\Users\\Desktop\\');
        DirectoryManager.currentDirectory = '';
        var directory = DirectoryManager.getCurrentDirectory();
        var workbookPath = Workbook.getActiveWorkbookPath();
        equal(directory, workbookPath, 'Current Directory set correctly');
      });

  QUnit.test('CurDir API - Returns Current Directory', function() {
    Workbook.setActiveWorkbookPath('C:\\Users\\Desktop\\');
    DirectoryManager.currentDirectory = '';
    var currentDirectory = DirectoryManager.getCurrentDirectory();
    var curDirResponse = DirectoryManager.curDir();
    equal(currentDirectory, curDirResponse, 'CurDir() works correctly');
  });

  QUnit.test('CurDir API - Drive Parameter Tests', function() {
    Workbook.setActiveWorkbookPath('C:\\Users\\Desktop\\');
    DirectoryManager.currentDirectory = '';
    var currentDirectory = DirectoryManager.getCurrentDirectory();
    var curDirResponse = DirectoryManager.curDir('C');
    equal(currentDirectory, curDirResponse, 'CurDir("C") works correctly');
    curDirResponse = DirectoryManager.curDir('c');
    equal(currentDirectory, curDirResponse, 'CurDir("c") works correctly');
    curDirResponse = DirectoryManager.curDir('D');
    equal('D:\\', curDirResponse, 'CurDir("D") works correctly');
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
      });
}
