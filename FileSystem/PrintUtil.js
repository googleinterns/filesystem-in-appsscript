/**
 * @fileoverview Helper functions and structures for print API
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
 * @param(Date) date Date structure
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
 * Print number
 * @param(object) file File structure
 * @param(number) num number to be printed
 */
function printNumber(file, num) {
  var numStr = ' ' + num + ' ';
  stringInsert(file, numStr);
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
