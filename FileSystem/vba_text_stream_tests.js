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
 * @fileoverview VbaTextStream Unit Tests
 */

var vbaTextStreamTests = {
  setup: vba_text_stream_setup,
  tests: {
    write: vba_textstream_write_tests,
    read: vba_textstream_read_tests,
    misc: vba_textstream_misc_tests
  }
};

function vba_textstream_run_all_tests() {
  vba_text_stream_setup();
  vba_textstream_write_tests();
  vba_textstream_read_tests();
  vba_textstream_misc_tests();
}

function vba_text_stream_setup() {
  QUnit.module('VbaTextStream', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
    }
  });
}

function vba_textstream_write_tests() {
  QUnit.test('Text Stream Write testing', 1, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.write('Hello World');
    writeTextStream.close();
    writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_APPENDING, true, null);
    writeTextStream.write('.This is cool.');
    writeTextStream.close();

    var readTextStream = FileSystem.openTextFile(
        'FileSystemObjectTest.txt', IoMode.FOR_READING, true, null);
    var text = readTextStream.content;
    var expectedText = 'Hello World.This is cool.';
    readTextStream.close();
    equal(text, expectedText, 'File Written correctly');
  });

  QUnit.test('Text Stream Write Line testing', 1, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.writeLine('Hello World');
    writeTextStream.close();
    writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_APPENDING, true, null);
    writeTextStream.writeLine('.This is cool.');
    writeTextStream.close();

    var readTextStream = FileSystem.openTextFile(
        'FileSystemObjectTest.txt', IoMode.FOR_READING, true, null);
    var text = readTextStream.content;
    var expectedText = 'Hello World\r\n.This is cool.\r\n';
    readTextStream.close();
    equal(text, expectedText, 'File Written correctly');
  });

  QUnit.test('Text Stream Write Blank Line testing', 1, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.writeLine('Hello World');
    writeTextStream.writeBlankLines(1);
    writeTextStream.close();
    writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_APPENDING, true, null);
    writeTextStream.writeLine('.This is cool.');
    writeTextStream.writeBlankLines(2);
    writeTextStream.close();

    var readTextStream = FileSystem.openTextFile(
        'FileSystemObjectTest.txt', IoMode.FOR_READING, true, null);
    var text = readTextStream.content;
    var expectedText = 'Hello World\r\n\r\n.This is cool.\r\n\r\n\r\n';
    readTextStream.close();
    equal(text, expectedText, 'File Written correctly');
  });

  QUnit.test('Text Stream Complete Write testing', 1, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.write('Hello World');
    writeTextStream.writeLine('This is a new line');
    writeTextStream.writeBlankLines(2);
    writeTextStream.write('Hey');
    writeTextStream.writeBlankLines(1);
    writeTextStream.writeLine('End of story');
    writeTextStream.close();

    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    var text = readTextStream.content;
    var expectedText =
        'Hello WorldThis is a new line\r\n\r\n\r\nHey\r\nEnd of story\r\n';
    readTextStream.close();
    equal(text, expectedText, 'File Written correctly');
  });
}

function vba_textstream_read_tests() {
  QUnit.test('Text Stream read testing - 1', 1, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.write('Hello World.');
    writeTextStream.write('This is cool.');
    writeTextStream.close();

    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    var text = readTextStream.readAll();
    var expectedText = 'Hello World.This is cool.';
    equal(text, expectedText, 'File Read Correctly');
    readTextStream.close();
  });

  QUnit.test('Text Stream read testing - 2', 4, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.write('Hello World.');
    writeTextStream.write('This is cool.');
    writeTextStream.close();
    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    ok(!readTextStream.isEndOfStream(), 'End of stream not reached');
    var text = readTextStream.read(6);
    equal(text, 'Hello ');
    var expectedText = 'World.This is cool.';
    text = readTextStream.readAll();
    equal(text, expectedText);
    ok(readTextStream.isEndOfStream(), 'End of stream reached');
    readTextStream.close();
  });

  QUnit.test('Text Stream read testing - 3', 4, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.writeLine('Hello World.');
    writeTextStream.writeLine('This is cool.');
    writeTextStream.close();
    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    ok(!readTextStream.isEndOfStream(), 'End of stream not reached');
    var text = readTextStream.readLine();
    equal(text, 'Hello World.');
    text = readTextStream.readLine();
    equal(text, 'This is cool.');
    ok(readTextStream.isEndOfStream(), 'End of stream reached');
    readTextStream.close();
  });
}

function vba_textstream_misc_tests() {
  QUnit.test('Text Stream read skip testing', 2, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.writeLine('Hello World.');
    writeTextStream.writeLine('This is cool.');
    writeTextStream.writeLine('It is a bright new world.');
    writeTextStream.close();
    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    readTextStream.skipLine();
    var text = readTextStream.readLine();
    equal(text, 'This is cool.', 'Line skipped correctly.');
    readTextStream.skip(3);
    text = readTextStream.readLine();
    equal(text, 'is a bright new world.', 'Character skipped correctly.');
    readTextStream.close();
  });

  QUnit.test('Text Stream Read line number testing', 3, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.writeLine('Hello World.');
    writeTextStream.writeLine('This is cool.');
    writeTextStream.writeLine('It is a bright new world.');
    writeTextStream.close();
    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    equal(readTextStream.getLineNumber(), 1, 'Line number is correct.');
    readTextStream.skipLine();
    equal(readTextStream.getLineNumber(), 2, 'Line number is correct.');
    readTextStream.skip(5);
    equal(readTextStream.getLineNumber(), 2, 'Line number is correct.');
    readTextStream.close();
  });

  QUnit.test('Text Stream Read Column testing', 3, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.writeLine('Hello World.');
    writeTextStream.writeLine('This is cool.');
    writeTextStream.writeLine('It is a bright new world.');
    writeTextStream.close();
    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    equal(readTextStream.getColumn(), 1, 'Column number is correct.');
    readTextStream.skipLine();
    equal(readTextStream.getColumn(), 1, 'Column number is correct.');
    readTextStream.skip(5);
    equal(readTextStream.getColumn(), 6, 'Column number is correct.');
    readTextStream.close();
  });

  QUnit.test('Text Stream isEndOfLine testing', 4, function() {
    var fileName = 'FileSystemObjectTest.txt';
    var writeTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_WRITING, true, null);
    writeTextStream.writeLine('Hello World.');
    var lastLine = 'It is a bright new world.';
    writeTextStream.writeLine(lastLine);
    writeTextStream.close();
    var readTextStream =
        FileSystem.openTextFile(fileName, IoMode.FOR_READING, true, null);
    ok(!readTextStream.isEndOfLine(), 'Pointer is not at end of line');
    readTextStream.skipLine();
    ok(!readTextStream.isEndOfLine(), 'Pointer is not at end of line');
    readTextStream.skip(lastLine.length);
    ok(readTextStream.isEndOfLine(), 'Pointer is at end of line');
    ok(!readTextStream.isEndOfStream(), 'End of stream not reached');
    readTextStream.close();
  });
}
