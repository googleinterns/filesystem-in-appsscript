/**
 * File open mode enumeration
 */
var OpenMode = {
  APPEND: 'append',
  BINARY: 'binary',
  INPUT: 'input',
  OUTPUT: 'output',
  RANDOM: 'random',
};

/**
 * File lock mode enumeration
 */
var LockMode = {
  SHARED: 'shared',
  READ: 'read',
  WRITE: 'write',
  READ_WRITE: 'read_write',
  NONE: 'none',
};

/**
 * File access mode enumeration
 */
var AccessMode = {
  READ: 'read',
  WRITE: 'write',
  READ_WRITE: 'read_write',
};

/**
 * File Input Output library
 */
var FileIO = {
  openFile: openFile,
  closeFileList: closeFileList,
  getNextAvailableFile: getNextAvailableFile,
  lof: lof,
  isEOF: isEOF,
  printToFile: printToFile,
  lineInputFile: lineInputFile,
  writeToFile: writeToFile,
  getFilePointer: getFilePointer,
  setFilePointer: setFilePointer,
  openFiles: {},
  closeFile: closeFile,
};

/**
 * Emulates VBA open statement API
 * @todo Implement file locking
 * @body File locking is not possible in Google Drive but it could be emulated by using PropertyServices.
 * @param {string} path The local file path
 * @param {number} fileNumber File number
 * @param {string} openMode Open Mode enumeration
 * @param {string} accessMode Access Mode enumeration
 * @param {string} lockMode lockMode enumeration
 */
function openFile(path, fileNumber, openMode, accessMode, lockMode) {
  // Set default arguments
  openMode = openMode || OpenMode.RANDOM;
  accessMode = accessMode || AccessMode.READ_WRITE;
  lockMode = lockMode || LockMode.NONE;

  // Check if file number is available
  if (fileNumber in this.openFiles) {
    throw new Error('File Number: ' + fileNumber + ' is already being used');
  }

  // Check if file number is valid
  if (fileNumber < 1 || fileNumber > 511) {
    throw new Error('File Number: ' + fileNumber + ' is invalid.');
  }

  // If file exists, get file id else create and get file id
  var fileId;
  if (FileMapper.hasMapping(FileSystem.currentDirectory, path)) {
    fileId = FileMapper.getFileId(FileSystem.currentDirectory, path);
  } else if (openMode != OpenMode.INPUT) {
    fileId = createFile(FileSystem.currentDirectory, path, MimeType.PLAIN_TEXT);
  } else {
    throw new Error('File not present');
  }

  // In memory file object
  var file = {
    fileId: fileId,
    filePath: path,
    accessMode: accessMode,
    openMode: openMode,
    lockMode: lockMode,
  };

  // Set file content and file pointer (In memory buffer) depending on type
  var driveFile = DriveApp.getFileById(file.fileId);
  switch (openMode) {
    case OpenMode.RANDOM:
    case OpenMode.INPUT:
      file.pointer = 0; // Beginning of file
      file.content = driveFile.getBlob().getDataAsString();
      break;
    case OpenMode.APPEND:
      file.content = driveFile.getBlob().getDataAsString();
      file.pointer = file.content.length; // End of file
      break;
    case OpenMode.OUTPUT:
      file.pointer = 0; // Beginning of file
      file.content = ''; // Empty file
      break;
    case OpenMode.BINARY:
      file.pointer = 0; // Beginning of file
      file.content = driveFile.getBlob().getBytes();
      break;
  }

  // Register Open File
  this.openFiles[fileNumber] = file;
}

/**
 * Internal method to close file
 * Saves the file content and closes the removed the file
 * @param {number} fileNumber File number to be closed
 */
function closeFile(fileNumber) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }

  var file = this.openFiles[fileNumber];
  /**
   * @todo Test Binary operation for open/close
   * @body DriveAPI doesn't provide much support for binary operations
   */
  if (file.openMode == OpenMode.BINARY) {
    DriveApp.getFileById(file.fileId).getBlob().setBytes(file.content);
  } else if (file.openMode != OpenMode.INPUT) {
    DriveApp.getFileById(file.fileId).setContent(file.content);
  }

  delete this.openFiles[fileNumber];
}

/**
 * Emulates VBA close statement API
 * @param {Array.<number>} fileNumberList List of file numbers to close
 */
function closeFileList(fileNumberList) {
  // Set default argument
  fileNumberList = fileNumberList || [];

  // Close all files
  if (fileNumberList.length == 0) {
    for (fileNumber in this.openFiles) {
      this.closeFile(fileNumber);
    }
  }

  // Close selected files
  for (var i = 0; i < fileNumberList.length; i++) {
    this.closeFile(fileNumberList[i]);
  }
}

/**
 * Emulates VBA freefile statement API
 * If range = 0, return number from 1 to 255
 * Else if range = 1, return number from 256 to 511
 * @param {number} range File Number Range
 */
function getNextAvailableFile(range) {
  // Set default argument
  range = range || 0;

  if (range == 0) {
    for (var fileNumber = 1; fileNumber <= 255; fileNumber++) {
      if (!(fileNumber in this.openFiles)) {
        return fileNumber;
      }
    }
  } else {
    for (var fileNumber = 256; fileNumber <= 511; fileNumber++) {
      if (!(fileNumber in this.openFiles)) {
        return fileNumber;
      }
    }
  }

  throw new Error('No free filenumber available');
}

/**
 * Emulates VBA lof statement API
 * @param {number} fileNumber File number
 * @return {number} length of the open file
 */
function lof(fileNumber) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }
  return this.openFiles[fileNumber].content.length;
}

/**
 * Emulates VBA eof statement API
 * @param {number} fileNumber File number
 * @return {boolean} True if end of file is reached
 */
function isEOF(fileNumber) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }
  var file = this.openFiles[fileNumber];
  return file.content.length == file.pointer;
}

/**
 * Emulates VBA print statement API
 * @param {number} fileNumber File number
 * @param {Array} outputList Expression List
 */
function printToFile(fileNumber, outputList) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }

  // Set default argument
  outputList = outputList || [];

  var file = this.openFiles[fileNumber];
  if (file.accessMode == AccessMode.READ) {
    throw new Error('File is not open for writing');
  }

  for (var i = 0; i < outputList.length; i++) {
    var exp = outputList[i];
    if (typeof exp === 'string') {
      printString(file, exp);
    } else if (typeof exp === 'number') {
      printNumber(file, exp);
    } else if (typeof exp === 'boolean') {
      printBool(file, exp);
    } else if (exp instanceof VbaDate) {
      printDate(file, exp);
    } else if (exp instanceof Tab) {
      printTab(file, exp);
    } else if (exp instanceof Space) {
      printSpace(file, exp);
    } else if (exp instanceof Error) {
      printError(file, exp);
    } else if (exp === null) {
      stringInsert(file, 'Null');
    } else {
      throw new Error('Unknown Expression');
    }
  }

  // Print new line
  printNewline(file);
}

/**
 * Emulates VBA Line Input statement API
 * @param {number} fileNumber File number
 * @param {VbaBox} variable reference variable to store line
 */
function lineInputFile(fileNumber, variable) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }

  var file = this.openFiles[fileNumber];
  if (file.accessMode == AccessMode.WRITE) {
    throw new Error('File is not open for reading');
  }
  var content = file.content;

  // No data left, throw error
  if (file.pointer == content.length) {
    throw new Error('End of file reached');
  }

  var line = '';

  // Read till \r or end of file
  while (file.pointer < file.content.length && content[file.pointer] != '\r') {
    line += content[file.pointer++];
  }

  // Skip \r
  if (file.pointer < file.content.length) {
    file.pointer++;
  }

  // Skip \n
  if (file.pointer < content.length && content[file.pointer] == '\n') {
    file.pointer++;
  }

  variable.referenceValue = line;
}

/**
 * Emulates VBA write statement API
 * @param {number} fileNumber File number
 * @param {Array} outputList Expression List
 */
function writeToFile(fileNumber, outputList) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }

  // Set default argument
  outputList = outputList || [];

  var file = this.openFiles[fileNumber];
  if (file.accessMode == AccessMode.READ) {
    throw new Error('File is not open for writing');
  }

  for (var i = 0; i < outputList.length; i++) {
    var exp = outputList[i];

    // Insert Delimiter
    if (i > 0) {
      stringInsert(file, ',');
    }

    if (typeof exp === 'string') {
      writeString(file, exp);
    } else if (typeof exp === 'number') {
      writeNumber(file, exp);
    } else if (typeof exp === 'boolean') {
      writeBool(file, exp);
    } else if (exp instanceof VbaDate) {
      writeDate(file, exp);
    } else if (exp instanceof Error) {
      writeError(file, exp);
    } else if (exp === null) {
      stringInsert(file, '#NULL#');
    } else {
      throw new Error('Unknown Expression');
    }
  }

  printNewline(file);
}

/**
 * Emulates VBA loc statement API
 * @param {number} fileNumber File number
 * @return {number} file pointer
 */
function getFilePointer(fileNumber) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }
  return this.openFiles[fileNumber].pointer;
}

/**
 * Emulates VBA seek statement API
 * @param {number} fileNumber File number
 * @param {number} position File pointer position
 */
function setFilePointer(fileNumber, position) {
  if (!(fileNumber in this.openFiles)) {
    throw new Error('File Number: ' + fileNumber + ' is not open');
  }

  this.openFiles[fileNumber].pointer = position;
  var content = this.openFiles[fileNumber].content;
  if(position > content.length) {
    content +=  Array(position - content.length + 1).join(' ');
  }
  this.openFiles[fileNumber].content = content;
}
