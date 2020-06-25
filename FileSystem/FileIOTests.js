/**
 * @fileoverview FileIO Unit Tests
 */

var fileIoTests = {
  setup: file_io_test_setup,
  tests: {
    open_close: file_open_close_tests,
    file_io: file_io_tests,
    misc: file_misc_tests,
  },
  teardown: file_io_cleanup
};

function file_io_run_all_tests() {
  file_io_test_setup();
  file_open_close_tests();
  file_io_tests();
  file_misc_tests();
  file_io_cleanup();
}

function file_io_test_setup() {
  var moduleName = 'FileIO';
  QUnit.module(moduleName, {
    setup: function() {
      if (currentRunningTestModule != moduleName) {
        currentRunningTestModule = moduleName;
        Workbook.setActiveWorkbookPath('c:\\user\\desktop');
        DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
      }
    }
  });
}

function file_io_tests() {
  QUnit.test('File print testing', function() {
    var fileNumber;
    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile('PRINT_TEST', fileNumber, OpenMode.OUTPUT);
    FileIO.printToFile(fileNumber, ['This is a test']);
    FileIO.printToFile(fileNumber, []);
    FileIO.printToFile(fileNumber, ['Zone 1', new Tab(), 'Zone 2']);
    FileIO.printToFile(fileNumber, ['Hello', ' ', 'World']);
    FileIO.printToFile(fileNumber, [new Space(5), '5 leading spaces ']);
    FileIO.printToFile(fileNumber, [new Tab(10), 'Hello']);
    FileIO.printToFile(fileNumber, [false, ' is a Boolean value']);
    FileIO.printToFile(fileNumber, [
      new VbaDate(new Date('2/12/1969')),
      ' is a date',
    ]);
    FileIO.printToFile(fileNumber, [null, ' is a null value']);
    FileIO.printToFile(fileNumber, [new Error(32767), ' is an error value']);
    FileIO.closeFileList();

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile('PRINT_TEST', fileNumber, OpenMode.INPUT);
    var content = FileIO.openFiles[fileNumber].content;
    var actualContent =
        'This is a test\r\n\r\nZone 1        Zone 2\r\nHello World\r\n     5 leading spaces \r\n         Hello\r\nFalse is a Boolean value\r\n12-02-1969  is a date\r\nNull is a null value\r\nError 32767 is an error value\r\n';
    equal(content, actualContent, 'Test for exact print match');
  });

  QUnit.test('File line input testing', function() {
    var actualContent = [
      'This is a test',
      '',
      'Zone 1        Zone 2',
      'Hello World',
      '     5 leading spaces ',
      '         Hello',
      'False is a Boolean value',
      '12-02-1969  is a date',
      'Null is a null value',
      'Error 32767 is an error value',
    ];
    expect(actualContent.length + 1);
    var fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile('PRINT_TEST', fileNumber, OpenMode.INPUT);
    for (var i = 0; i < actualContent.length; i++) {
      var variable = new VbaBox('');
      FileIO.lineInputFile(fileNumber, variable);
      equal(variable.referenceValue, actualContent[i]);
    }

    ok(FileIO.isEOF(fileNumber));
    FileIO.closeFileList();
  });

  QUnit.test('File append testing', function() {
    var fileNumber;
    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile('PRINT_TEST', fileNumber, OpenMode.APPEND);
    FileIO.printToFile(fileNumber, ['This is a test']);
    FileIO.closeFileList();

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile('PRINT_TEST', fileNumber, OpenMode.INPUT);
    var actualContent =
        'This is a test\r\n\r\nZone 1        Zone 2\r\nHello World\r\n     5 leading spaces \r\n         Hello\r\nFalse is a Boolean value\r\n12-02-1969  is a date\r\nNull is a null value\r\nError 32767 is an error value\r\nThis is a test\r\n';
    var content = FileIO.openFiles[fileNumber].content;
    equal(content, actualContent, 'Test for exact print match');
    FileIO.closeFileList();
  });

  QUnit.test('File write testing', function() {
    expect(1);
    var fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile('WRITE_TEST', fileNumber, OpenMode.OUTPUT);
    FileIO.writeToFile(fileNumber, ['Hello World', 234]);
    FileIO.writeToFile(fileNumber, []);
    FileIO.writeToFile(fileNumber, [false, ' is a Boolean value']);
    FileIO.writeToFile(fileNumber, [
      new VbaDate(new Date('2/12/1969')),
      ' is a date',
    ]);
    FileIO.writeToFile(fileNumber, [null, ' is a null value']);
    FileIO.writeToFile(fileNumber, [new Error(32767), ' is an error value']);

    var actualContent =
        '"Hello World",234\r\n\r\n#FALSE#," is a Boolean value"\r\n#1969-02-12#," is a date"\r\n#NULL#," is a null value"\r\n#ERROR 32767#," is an error value"\r\n';
    var content = FileIO.openFiles[fileNumber].content;
    equal(content, actualContent, 'Test for exact write match');
    FileIO.closeFileList();
  });
}

function file_open_close_tests() {
  QUnit.test('File available testing', function() {
    expect(3);
    equal(FileIO.getNextAvailableFile(), 1, 'Test for no input');
    equal(FileIO.getNextAvailableFile(0), 1, 'Test for 0 as input');
    equal(FileIO.getNextAvailableFile(1), 256, 'Test for 1 as input');
  });

  QUnit.test('File open testing', function() {
    expect(4);
    var fileName = 'TESTFILE';
    var fileNumber = FileIO.getNextAvailableFile();

    equal(fileNumber, 1, 'Test for file number');
    FileIO.openFile(fileName, fileNumber, OpenMode.OUTPUT);
    var hasMapping =
        FileMapper.hasMapping(FileSystem.currentDirectory, fileName);
    ok(hasMapping, 'Test for FileMapping');
    equal(FileIO.getNextAvailableFile(), 2, 'Test for file number');

    FileIO.closeFileList([1]);
    equal(FileIO.getNextAvailableFile(), 1, 'Test for file number');
  });

  QUnit.test('File close testing', function() {
    expect(6);
    var fileName = 'TESTFILE';
    var fileNumber;

    fileNumber = FileIO.getNextAvailableFile();
    equal(fileNumber, 1, 'Test for file number');
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.OUTPUT);

    fileNumber = FileIO.getNextAvailableFile();
    equal(fileNumber, 2, 'Test for file number');
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.OUTPUT);

    equal(Object.keys(FileIO.openFiles).length, 2, 'Test for 2 open files');

    FileIO.closeFileList([1]);
    equal(Object.keys(FileIO.openFiles).length, 1, 'Test for 1 open files');

    fileNumber = FileIO.getNextAvailableFile();
    equal(fileNumber, 1, 'Test for file number');
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.OUTPUT);

    FileIO.closeFileList();
    equal(Object.keys(FileIO.openFiles).length, 0, 'Test for 0 open files');
  });

  QUnit.test('File close write testing', function() {
    var fileName = 'TESTFILE';
    var fileNumber;
    var fileContent = 'This is a string';

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.OUTPUT);

    FileIO.openFiles[fileNumber].content = fileContent;
    FileIO.closeFileList([fileNumber]);

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.INPUT);
    var content = FileIO.openFiles[fileNumber].content;
    equal(content, fileContent, 'Test for text save');
    FileIO.closeFileList();
  });

  QUnit.test('File length testing', function() {
    var fileName = 'TESTFILE';
    var fileNumber;
    var fileContent = 'This is a string';

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.INPUT);
    equal(FileIO.lof(fileNumber), fileContent.length, 'File Length Test');

    FileIO.closeFileList();
  });
}

function file_misc_tests() {
  QUnit.test('File getPointer testing', function() {
    var fileName = 'TESTFILE';
    var fileNumber;
    var fileContent = 'This is a string';

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.OUTPUT);
    equal(
        FileIO.getFilePointer(fileNumber),
        0);  // file pointer should be in beginning of file
    FileIO.printToFile(fileNumber, [fileContent]);
    equal(
        FileIO.getFilePointer(fileNumber),
        fileContent.length + 2);  // +2 for line ending (\r\n)
    FileIO.closeFileList();
  });

  QUnit.test('File setPointer testing', function() {
    var fileName = 'TESTFILE';
    var fileNumber;
    var fileContent = 'This is a string';

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.OUTPUT);
    // file pointer should be in beginning of file
    equal(FileIO.getFilePointer(fileNumber), 0);
    FileIO.printToFile(fileNumber, [fileContent]);
    // File should contain 1 line now
    equal(
        FileIO.getFilePointer(fileNumber),
        fileContent.length + 2);  // +2 for line ending (\r\n)
    FileIO.printToFile(fileNumber, [fileContent]);
    // File should contain 2 lines now
    equal(
        FileIO.getFilePointer(fileNumber),
        2 * (fileContent.length + 2));  // +2 for line ending (\r\n)
    // Reset file pointer to beginning and write 3 times. It should contain 3
    // lines now
    FileIO.setFilePointer(fileNumber, 0);
    // file pointer should be in beginning of file
    equal(FileIO.getFilePointer(fileNumber), 0);
    FileIO.printToFile(fileNumber, [fileContent]);
    FileIO.printToFile(fileNumber, [fileContent]);
    FileIO.printToFile(fileNumber, [fileContent]);
    equal(
        FileIO.getFilePointer(fileNumber),
        3 * (fileContent.length + 2));  // +2 for line ending (\r\n)
    FileIO.closeFileList();
  });
}

function file_io_cleanup() {
  deleteFile('TESTFILE');
  deleteFile('PRINT_TEST');
  deleteFile('WRITE_TEST');
}
