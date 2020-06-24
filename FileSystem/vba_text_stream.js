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
 * IO Modes supported by VBA OpenTextFile
 * The enumeration numbering is based on the numbering in VBA
 */
var IoMode = {FOR_READING: 1, FOR_WRITING: 2, FOR_APPENDING: 8}

/**
 * @todo Implement in memory same process - File Locking
 * @body VBA doesn't allow 2 files to be opened for writing at the same time.
 *
 * Create a new VbaTextStream Object. The VbaTextStream object represents an
 * open file.
 * @constructor
 * @param {string} localPath Local file path of the file to be opened
 * @param {string} ioMode IoMode mode enumeration - Reading, writing or append
 * @return {VbaTextStream} New VbaTextStream Object
 */
function VbaTextStream(localPath, ioMode) {
  this.fileId = FileMapper.getFileId(localPath);
  this.filePath = localPath;
  this.driveFile = DriveApp.getFileById(this.fileId);
  this.ioMode = ioMode;
  if (ioMode == IoMode.FOR_WRITING) {
    this.content = '';
    this.pointer = 0;
  } else if (ioMode == IoMode.FOR_READING) {
    this.content = this.driveFile.getBlob().getDataAsString();
    this.pointer = 0;
  } else if (ioMode == IoMode.FOR_APPENDING) {
    this.content = this.driveFile.getBlob().getDataAsString();
    this.pointer = this.content.length;
  } else {
    throw new Error('Unknown Io Mode: ' + ioMode);
  }
  return this;
};

/**
 * Emulates VBA TextStream.AtEndOfStream API
 * Check if end of file is reached. That is file pointer is at the end of file
 * @return {boolean} true if end of file is reached
 */
VbaTextStream.prototype.isEndOfStream = function() {
  if (this.ioMode != IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for reading');
  }
  return this.pointer == this.content.length;
};

/**
 * Emulates VBA TextStream.AtEndOfLine API
 * Checks if the file pointer is positioned immediately before the end-of-line
 * marker in a TextStream file.
 * @return {boolean} true if the file pointer is positioned immediately before
 *     the end-of-line marker
 */
VbaTextStream.prototype.isEndOfLine = function() {
  if (this.ioMode != IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for reading');
  }
  if (this.isEndOfStream()) {
    return true;
  }
  var nextChar = this.content[this.pointer];
  return nextChar == '\r' || nextChar == '\n';
};

/**
 * Emulates VBA TextStream.Column API
 * Get the position of the file pointer in the current line in the textStream
 * @return {number} Column number of the current character position
 */
VbaTextStream.prototype.getColumn = function() {
  var lineStartIndex = getLineStart(this);
  return this.pointer - lineStartIndex + 1;
};

/**
 * Emulates VBA TextStream.Line API
 * Get the current line number in the textStream file.
 * @return {number} Current line number
 */
VbaTextStream.prototype.getLineNumber = function() {
  var line = 1;
  for (var i = 0; i < this.pointer; i++) {
    if (this.content[i] == '\r') {
      line++;  // Line ending of CR format (\r)
      if (i + 1 < this.pointer && this.content[i + 1] == '\n') {
        i++;  // Line ending of CR LF format (\r\n)
      }
    } else if (this.content[i] == '\n') {
      line++;  // Line ending of LF format (\n)
    }
  }
  return line;
};

/**
 * Emulates VBA TextStream.Read API
 * Read a specified number of characters from the textStream file and return the
 * result
 * @param {number} charCount Number of characters to read
 * @return {string} String consisting of charCount number of characters
 */
VbaTextStream.prototype.read = function(charCount) {
  if (this.ioMode != IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for reading');
  }
  // If no data left, throw error
  if (this.pointer == this.content.length && charCount > 0) {
    throw new Error('End of file reached');
  }
  var response = this.content.substr(this.pointer, charCount);
  this.pointer += response.length;
  return response;
};

/**
 * Emulates VBA TextStream.ReadAll API
 * Read an entire textStream file and return the result
 * @return {string} Entire textStream file content
 */
VbaTextStream.prototype.readAll = function() {
  if (this.ioMode != IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for reading');
  }
  // No data left, throw error
  if (this.pointer == this.content.length) {
    throw new Error('End of file reached');
  }
  var response = this.content.substr(this.pointer);
  this.pointer += response.length;
  return response;
};

/**
 * Emulates VBA TextStream.ReadLine API
 * Read one line from the text stream file and return the result
 * @return {string} String consisting of one line from the text stream
 */
VbaTextStream.prototype.readLine = function() {
  if (this.ioMode != IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for reading');
  }
  return readLine(this);
};

/**
 * Emulates VBA TextStream.Skip API
 * Skips a specified number of characters when reading a TextStream file
 * @param {number} skipCount Number of characters to skip
 */
VbaTextStream.prototype.skip = function(charCount) {
  if (this.ioMode != IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for reading');
  }
  // No data left, throw error
  if (this.pointer == this.content.length && charCount) {
    throw new Error('End of file reached');
  }
  this.pointer += Math.min(charCount, this.content.length - this.pointer);
};

/**
 * Emulates VBA TextStream.SkipLine API
 * Skips the current line when reading a text stream file
 */
VbaTextStream.prototype.skipLine = function() {
  if (this.ioMode != IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for reading');
  }
  this.readLine();
};

/**
 * Emulates VBA TextStream.Write API
 * Writes a specified text into the textStream file
 * @param {string} text Text to be written to the textStream file
 */
VbaTextStream.prototype.write = function(text) {
  if (this.ioMode == IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for writing');
  }
  stringInsert(this, text);
};

/**
 * Emulates VBA TextStream.WriteLine API
 * Writes a specified text and a new line character to the textStream file
 * @param {string} text Text to be written to the textStream file
 */
VbaTextStream.prototype.writeLine = function(text) {
  if (this.ioMode == IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for writing');
  }
  stringInsert(this, text);
  printNewline(this);
};

/**
 * Emulates VBA TextStream.WriteBlankLines API
 * Writes a specified number of blank lines to the textStream file
 * @param {number} lineCount Number of blank lines to write
 */
VbaTextStream.prototype.writeBlankLines = function(lineCount) {
  if (this.ioMode == IoMode.FOR_READING) {
    throw new Error('File' + this.filePath + ' is not open for writing');
  }
  var newLines = Array(lineCount + 1).join('\r\n');
  stringInsert(this, newLines);
};

/**
 * Emulates VBA TextStream.close API
 * Closes the text stream file. If the text stream is opened for writing, then
 * the text stream content is flushed to drive.
 */
VbaTextStream.prototype.close = function() {
  if (this.ioMode != IoMode.FOR_READING) {
    DriveApp.getFileById(this.fileId).setContent(this.content);
  }
};
