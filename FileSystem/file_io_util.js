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
 * @fileoverview Helper functions and structures for FileIO API
 */

/**
 * Print VbaTab
 * @param(object) file File structure
 * @param(object) tab Tab structure
 */
function printTab(file, tab) {
  var filePointer = file.pointer;

  // Get index of start of current line
  var lineStartIndex = getLineStart(file);
  // Calculate current line length
  var lineLength = filePointer - lineStartIndex;
  var insertSpaceCount;
  if (tab.column == 'NEXT_ZONE') {
    // If tab is next zone, then we need to insert the
    // next character on the nearest column with multiple of 14.
    // Calculate spaces to get to nearest column index which is multiple of 14
    insertSpaceCount = (14 - (lineLength % 14)) % 14;
  } else {
    // Calculate spaces to get to the exact column index
    insertSpaceCount = tab.column - lineLength - 1;
  }

  printSpace(file, new Space(insertSpaceCount));
}

/**
 * Print VbaDate
 * @param(object) file File structure
 * @param(VbaDate) date Date to be printed
 */
function printDate(file, date) {
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  // Prefix digit 0 to ensure double digit day/month
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }

  // Construct date string as per VBA format
  var str = day + '-' + month + '-' + year + ' ';
  stringInsert(file, str);
}

/**
 * Write VbaDate
 * @param(object) file File structure
 * @param(VbaDate) date Date to be written
 */
function writeDate(file, date) {
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  // Prefix digit 0 to ensure double digit day/month
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }

  // Construct date string as per VBA format
  var str = '#' + year + '-' + month + '-' + day + '#';
  stringInsert(file, str);
}

/**
 * Print space
 * @param(object) file File structure
 * @param(object) space Space structure
 */
function printSpace(file, space) {
  // Create string with space.count spaces
  var spaces = Array(space.count + 1).join(' ');
  stringInsert(file, spaces);
}

/**
 * Print string
 * @param(object) file File structure
 * @param(string) str string to be printed
 */
function printString(file, str) {
  stringInsert(file, str);
}

/**
 * Write string
 * @param(object) file File structure
 * @param(string) str string to be written
 */
function writeString(file, str) {
  stringInsert(file, '"' + str + '"');
}

/**
 * Print number
 * @param(object) file File structure
 * @param(number) num number to be printed
 */
function printNumber(file, num) {
  var numStr = ' ' + num + ' ';
  stringInsert(file, numStr);
}

/**
 * Write number
 * @param(object) file File structure
 * @param(number) num number to be written
 */
function writeNumber(file, num) {
  stringInsert(file, num.toString());
}

/**
 * Print boolean
 * @param(object) file File structure
 * @param(boolean) bool boolean to be printed
 */
function printBool(file, bool) {
  var boolStr = bool ? 'True' : 'False';
  stringInsert(file, boolStr);
}

/**
 * Write boolean
 * @param(object) file File structure
 * @param(boolean) bool boolean to be written
 */
function writeBool(file, bool) {
  var boolStr = bool ? '#TRUE#' : '#FALSE#';
  stringInsert(file, boolStr);
}

/**
 * Print newline
 * @param(object) file File structure
 */
function printNewline(file) {
  stringInsert(file, '\r\n');
}

/**
 * Print error
 * @todo Use VbaError instead of JS Error
 * @body Slight complication as information is lost in VbaError
 * @param(object) file File structure
 * @param(Error) err error to be printed
 */
function printError(file, err) {
  stringInsert(file, 'Error ' + err.message);
}

/**
 * Write error
 * @todo Use VbaError instead of JS Error
 * @body Slight complication as information is lost in VbaError
 * @param(object) file File structure
 * @param(Error) err error to be written
 */
function writeError(file, err) {
  stringInsert(file, '#ERROR ' + err.message + '#');
}

/**
 * Helper function to print string into file and progress the file pointer.
 * In case the file end is reached, the file size is increased
 * @param(object) file File structure
 * @param(string) str string to be inserted at file pointer
 */
function stringInsert(file, str) {
  var source = file.content;
  var index = file.pointer;

  var i = 0;
  // Overwrite existing file content if possible
  while (i < str.length && index < source.length) {
    source[index++] = str[i++];
  }
  // Append new content by extending the file
  if (i < str.length) {
    source += str.substr(i);
  }

  file.content = source;
  file.pointer += str.length;
}

/**
 * Helper function to find index of start of line
 * in which the current file pointer is present
 * @param(object) file File structure
 */
function getLineStart(file) {
  var content = file.content;
  var filePointer = file.pointer;
  // Traverse backwards till we find line ending
  while (filePointer >= 0 && content[filePointer] != '\n') {
    filePointer--;
  }
  return filePointer + 1;
}

/**
 * Helper function to parse one variable. This function is designed to be robust
 * against whitespaces. It will read a boolean, null, number, string, date or
 * error into the variable. It will attempt to match the input buffer with any
 * of the possible types and set the reference variable accordingly.
 * @param(object) file File structure
 * @param {VbaBox} variable reference variable to store value
 */
function inputFileHelper(file, variable) {
  var content = file.content;
  var filePointer = file.pointer;
  // Jump over whitespace
  while (filePointer < content.length && content[filePointer] == ' ') {
    filePointer++;
  }
  // No input left
  if (filePointer == content.length) {
    throw new Error('End of file reached');
  }
  file.pointer = filePointer;
  // Try obtaining an input
  if (!(tryInputConstant(file, variable) || tryInputVariable(file, variable))) {
    throw new Error('Unknown Expression');
  }
  filePointer = file.pointer;
  // Jump over whitespace and break at any delimiting characters
  while (filePointer < content.length) {
    var char = content[filePointer];
    if (char == ' ') {
      filePointer++;  // Jump over whitespace
    } else if (content.substr(filePointer, 2) == '\r\n') {
      filePointer += 2;
      break;  // Break at delimiter
    } else if (char == ',' || char == '\r' || char == '\n') {
      filePointer++;
      break;  // Break at delimiter
    } else {
      throw new Error('Unknown Error Occurred');
    }
  }
  file.pointer = filePointer;
}

/**
 * Helper function to parse one constant value. Constants include true, false,
 * null and empty. It attempts to match the buffer with the various constant
 * expressions
 * @param(object) file File structure
 * @param {VbaBox} variable reference variable to store value
 * @return {boolean} true if constant is found
 */
function tryInputConstant(file, variable) {
  var filePointer = file.pointer;
  var content = file.content;

  var nullExp = '#NULL#';
  var trueExp = '#TRUE#';
  var falseExp = '#FALSE#';
  // Tests the different constant expressions
  if (content[filePointer] == ',' || content.substr(filePointer, 2) == '\r\n' ||
      content[filePointer] == '\r' || content[filePointer] == '\n') {
    // Empty Match
    variable.referenceValue = '';
    return true;
  } else if (content.substr(filePointer, nullExp.length) == nullExp) {
    // Null Match
    file.pointer += nullExp.length;
    variable.referenceValue = null;
    return true;
  } else if (content.substr(filePointer, trueExp.length) == trueExp) {
    // True Match
    file.pointer += trueExp.length;
    variable.referenceValue = true;
    return true;
  } else if (content.substr(filePointer, falseExp.length) == falseExp) {
    // False Match
    file.pointer += falseExp.length;
    variable.referenceValue = false;
    return true;
  }
  return false;  // No match found
}

/**
 * Helper function to parse one variable value. The different types include
 * string, numbers, error and 3 forms of date format. This helper function
 * attempts to match the input buffer with the various variable regex
 * expressions. On a successful match, relevant details are extracted from the
 * input and the required Apps Script variable is constructed.
 * @param(object) file File structure
 * @param {VbaBox} variable reference variable to store value
 * @return {boolean} true if variable is found
 */
function tryInputVariable(file, variable) {
  var remainingString = file.content.substring(file.pointer);
  // Regex expressions for parsing variable values
  // Match "someString", extracts someString
  var stringRegExp = /^"([^"]*)"/;
  // Match #ERROR errCode#, extracts errCode
  var errorRegExp = /^#ERROR ([^#]*)#/;
  // Match #yyyy-mm-dd#, extracts yyyy, mm, dd
  var dateRegExp = /^#(\d{4})-(\d{2})-(\d{2})#/;
  // Match #yyyy-mm-dd hh:mm:ss#, extracts yyyy, mm, dd, hh, mm, ss
  var dateTimeRegExp = /^#(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})#/;
  // Match #hh:mm:ss#, extracts hh, mm, ss
  var timeRegExp = /^#(\d{2}):(\d{2}):(\d{2})#/;
  // Match decimal numbers - supports .123, 1.23,12.3, 123., 123
  var numberRegExp = /^[0-9]*(\.[0-9]*)?/;

  if (stringRegExp.test(remainingString)) {
    // String match
    var match = remainingString.match(stringRegExp);
    file.pointer += match[0].length;
    variable.referenceValue = match[1];
    return true;
  } else if (errorRegExp.test(remainingString)) {
    // Error Match
    var match = remainingString.match(errorRegExp);
    file.pointer += match[0].length;
    var errCode = match[1];
    variable.referenceValue = new Error(errCode);
    return true;
  } else if (dateRegExp.test(remainingString)) {
    // Date Match - Format 1
    var match = remainingString.match(dateRegExp);
    file.pointer += match[0].length;
    var year = parseInt(match[1]);
    var month = parseInt(match[2]);
    var day = parseInt(match[3]);
    variable.referenceValue = new VbaDate(new Date(year, month - 1, day));
    return true;
  } else if (dateTimeRegExp.test(remainingString)) {
    // Date Match - Format 2
    var match = remainingString.match(dateTimeRegExp);
    file.pointer += match[0].length;
    var year = parseInt(match[1]);
    var month = parseInt(match[2]);
    var day = parseInt(match[3]);
    var hour = parseInt(match[4]);
    var minute = parseInt(match[5]);
    var second = parseInt(match[6]);
    var date = new Date(year, month - 1, day, hour, minute, second);
    variable.referenceValue = new VbaDate(date);
    return true;
  } else if (timeRegExp.test(remainingString)) {
    // Date Match - Format 3
    var match = remainingString.match(timeRegExp);
    file.pointer += match[0].length;
    var hour = parseInt(match[1]);
    var minute = parseInt(match[2]);
    var second = parseInt(match[3]);
    var date = new Date();
    date.setHours(hour, minute, second);
    variable.referenceValue = new VbaDate(date);
    return true;
  } else if (numberRegExp.test(remainingString)) {
    // Number match
    var match = remainingString.match(numberRegExp);
    var number = match[0];
    file.pointer += match[0].length;
    variable.referenceValue = parseFloat(number);
    return true;
  }
  return false;
}
