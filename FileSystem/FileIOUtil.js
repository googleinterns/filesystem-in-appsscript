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

  var lineStartIndex = getLineStart(file);
  var lineLength = filePointer - lineStartIndex;
  var insertSpaceCount;
  if (tab.column == 'NEXT_ZONE') {
    insertSpaceCount = (14 - (lineLength % 14)) % 14;
  } else {
    insertSpaceCount = tab.column - lineLength - 1;
  }

  var spaces = '';
  for (var i = 0; i < insertSpaceCount; i++) {
    spaces += ' ';
  }
  stringInsert(file, spaces);
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
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
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
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  var str = '#' + year + '-' + month + '-' + day + '#';
  stringInsert(file, str);
}

/**
 * Print space
 * @param(object) file File structure
 * @param(object) space Space structure
 */
function printSpace(file, space) {
  var spaces = '';
  for (var i = 0; i < space.count; i++) {
    spaces += ' ';
  }
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
  num = ' ' + num + ' ';
  stringInsert(file, num);
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
  bool = bool ? 'True' : 'False';
  stringInsert(file, bool);
}

/**
 * Write boolean
 * @param(object) file File structure
 * @param(boolean) bool boolean to be written
 */
function writeBool(file, bool) {
  bool = bool ? '#TRUE#' : '#FALSE#';
  stringInsert(file, bool);
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
  while (i < str.length && index < source.length) {
    source[index++] = str[i++];
  }
  while (i < str.length) {
    source += str[i++];
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
  while (filePointer >= 0 && content[filePointer] !== '\n') {
    filePointer--;
  }
  return filePointer + 1;
}

/**
 * Helper function to parse one variable
 * @param(object) file File structure
 * @param {VbaBox} variable reference variable to store value
 */
function inputFileUtil(file, variable) {
  var content = file.content;
  var filePointer = file.pointer;

  while (filePointer < content.length && content[filePointer] == ' ') {
    filePointer++;
  }

  if (filePointer == content.length) {
    throw Error('End of file reached');
  }

  var remainingString = content.substring(filePointer);

  if (
    content[filePointer] == ',' ||
    /^\r\n/.test(remainingString) ||
    /^\r/.test(remainingString) ||
    /^\n/.test(remainingString)
  ) {
    variable.referenceValue = '';
  } else if (/^#NULL#/.test(remainingString)) {
    filePointer += '#NULL#'.length;
    variable.referenceValue = null;
  } else if (/^#TRUE#/.test(remainingString)) {
    filePointer += '#TRUE#'.length;
    variable.referenceValue = true;
  } else if (/^#FALSE#/.test(remainingString)) {
    filePointer += '#FALSE#'.length;
    variable.referenceValue = false;
  } else if (/^#FALSE#/.test(remainingString)) {
    filePointer += '#FALSE#'.length;
    variable.referenceValue = false;
  } else {
    var stringRegExp = /^"([^"]*)"/;
    var errorRegExp = /^#ERROR ([^#]*)#/;
    var dateRegExp = /^#(\d{4})-(\d{2})-(\d{2})#/;
    var dateTimeRegExp = /^#(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})#/;
    var timeRegExp = /^#(\d{2}):(\d{2}):(\d{2})#/;
    var numberRegExp = /^[\d\.]*/;

    if (stringRegExp.test(remainingString)) {
      var match = remainingString.match(stringRegExp);
      filePointer += match[0].length;
      variable.referenceValue = match[1];
    } else if (errorRegExp.test(remainingString)) {
      var match = remainingString.match(errorRegExp);
      filePointer += match[0].length;
      variable.referenceValue = new Error(match[1]);
    } else if (dateRegExp.test(remainingString)) {
      var match = remainingString.match(dateRegExp);
      filePointer += match[0].length;
      var year = parseInt(match[1]);
      var month = parseInt(match[2]);
      var day = parseInt(match[3]);
      variable.referenceValue = new VbaDate(new Date(year, month - 1, day));
    } else if (dateTimeRegExp.test(remainingString)) {
      var match = remainingString.match(dateTimeRegExp);
      filePointer += match[0].length;
      var year = parseInt(match[1]);
      var month = parseInt(match[2]);
      var day = parseInt(match[3]);
      var hour = parseInt(match[4]);
      var minute = parseInt(match[5]);
      var second = parseInt(match[6]);
      var date = new Date(year, month - 1, day, hour, minute, second);
      variable.referenceValue = new VbaDate(date);
    } else if (timeRegExp.test(remainingString)) {
      var match = remainingString.match(timeRegExp);
      filePointer += match[0].length;
      var hour = parseInt(match[1]);
      var minute = parseInt(match[2]);
      var second = parseInt(match[3]);
      var date = new Date();
      date.setHours(hour, minute, second);
      variable.referenceValue = new VbaDate(date);
    } else if (numberRegExp.test(remainingString)) {
      var match = remainingString.match(numberRegExp);
      filePointer += match[0].length;
      variable.referenceValue = parseFloat(match[0]);
    } else {
      throw Error('Unknown Expression');
    }
  }

  // Jump over whitespace and break at any delimiting characters
  while (filePointer < content.length) {
    if (content[filePointer] == ' ') {
      filePointer++;
    } else if (content[filePointer] == ',') {
      filePointer++;
      break;
    } else {
      var remainingString = content.substring(filePointer);
      if (/^\r\n/.test(remainingString)) {
        filePointer += 2;
        break;
      } else if (/^\r/.test(remainingString)) {
        filePointer++;
        break;
      } else if (/^\n/.test(remainingString)) {
        filePointer++;
        break;
      } else {
        break;
      }
    }
  }

  file.pointer = filePointer;
}
