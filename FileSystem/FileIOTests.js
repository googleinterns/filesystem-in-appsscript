/**
 * @fileoverview FileIO Unit Tests
 */

function file_io_run_all_tests() {
  QUnit.module('FileIO');

  file_open_close_tests();
  file_print_tests();

  cleanup();
}

function file_print_tests() {
  QUnit.test('File print testing', function () {
    FileIO.openFile('PRINT_TEST', 1, OpenMode.OUTPUT);
    FileIO.printToFile(1, ['This is a test']);
    FileIO.printToFile(1, []);
    FileIO.printToFile(1, ['Zone 1', new Tab(), 'Zone 2']);
    FileIO.printToFile(1, ['Hello', ' ', 'World']);
    FileIO.printToFile(1, [new Space(5), '5 leading spaces ']);
    FileIO.printToFile(1, [new Tab(10), 'Hello']);
    FileIO.printToFile(1, [false, ' is a Boolean value']);
    FileIO.printToFile(1, [new VbaDate(new Date('2/12/1969')), ' is a date']);
    FileIO.printToFile(1, [null, ' is a null value']);
    FileIO.printToFile(1, [new Error(32767), ' is an error value']);
    FileIO.closeFileList();
    FileIO.openFile('PRINT_TEST', 1, OpenMode.INPUT);

    var content = FileIO.openFiles[1].content;
    var actualContent =
      'This is a test\r\n\r\nZone 1        Zone 2\r\nHello World\r\n     5 leading spaces \r\n         Hello\r\nFalse is a Boolean value\r\n12-02-1969  is a date\r\nNull is a null value\r\nError 32767 is an error value\r\n';
    equal(content, actualContent, 'Test for exact print match');
  });
}

function file_open_close_tests() {
  QUnit.test('File available testing', function () {
    expect(3);
    equal(FileIO.getNextAvailableFile(), 1, 'Test for no input');
    equal(FileIO.getNextAvailableFile(0), 1, 'Test for 0 as input');
    equal(FileIO.getNextAvailableFile(1), 256, 'Test for 1 as input');
  });

  QUnit.test('File open testing', function () {
    expect(4);
    var fileName = 'TESTFILE';
    var fileNumber = FileIO.getNextAvailableFile();

    equal(fileNumber, 1, 'Test for file number');
    FileIO.openFile(fileName, fileNumber, OpenMode.OUTPUT);
    ok(
      FileMapper.hasMapping(FileSystem.currentDirectory, fileName),
      'Test for FileMapping'
    );
    equal(FileIO.getNextAvailableFile(), 2, 'Test for file number');

    FileIO.closeFileList([1]);
    equal(FileIO.getNextAvailableFile(), 1, 'Test for file number');
  });

  QUnit.test('File close testing', function () {
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

  QUnit.test('File close write testing', function () {
    var fileName = 'TESTFILE';
    var fileNumber;
    var fileContent = 'This is a string';

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.OUTPUT);

    FileIO.openFiles[fileNumber].content = fileContent;
    FileIO.closeFileList([fileNumber]);

    fileNumber = FileIO.getNextAvailableFile();
    FileIO.openFile(fileName, FileIO.getNextAvailableFile(), OpenMode.INPUT);
    equal(
      FileIO.openFiles[fileNumber].content,
      fileContent,
      'Test for text save'
    );
    equal(FileIO.lof(fileNumber), fileContent.length, 'File Length Test');

    FileIO.closeFileList();
  });
}

function cleanup() {
  deleteFile('TESTFILE');
  deleteFile('PRINT_TEST');
}