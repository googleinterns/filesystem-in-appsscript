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
    throw Error('File Number: ' + fileNumber + ' is already being used');
  }

  // Check if file number is valid
  if (fileNumber < 1 || fileNumber > 511) {
    throw Error(
      'File Number: ' +
        fileNumber +
        ' is invalid. File numbers need to be an number value between 1 and 511'
    );
  }

  var fileId;

  // If file exists, get file id else create and get file id
  if (FileMapper.hasMapping(FileSystem.currentDirectory, path)) {
    fileId = FileMapper.getFileId(FileSystem.currentDirectory, path);
  } else {
    fileId = createFile(FileSystem.currentDirectory, path, MimeType.PLAIN_TEXT);
  }

  // In memory file object
  var file = {
    fileId: fileId,
    filePath: path,
    accessMode: accessMode,
    openMode: openMode,
    lockMode: lockMode,
  };

  // Set file content (In memory buffer)
  switch (openMode) {
    case OpenMode.INPUT:
    case OpenMode.APPEND:
    case OpenMode.RANDOM:
      file.content = DriveApp.getFileById(file.fileId)
        .getBlob()
        .getDataAsString();
      break;
    case OpenMode.OUTPUT:
      file.content = '';
      break;
    case OpenMode.BINARY:
      file.content = DriveApp.getFileById(file.fileId).getBlob().getBytes();
      break;
  }

  // Set file pointer
  switch (openMode) {
    case OpenMode.INPUT:
    case OpenMode.RANDOM:
    case OpenMode.OUTPUT:
    case OpenMode.BINARY:
      file.pointer = 0;
      break;
    case OpenMode.APPEND:
      file.pointer = file.content.length;
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
    throw Error('File Number: ' + fileNumber + ' is not open');
  }

  var file = this.openFiles[fileNumber];

  if (file.openMode == OpenMode.BINARY) {
    DriveApp.getFileById(file.fileId).getBlob().setBytes(file.content);
  } else {
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

  throw Error('No free filenumber available');
}

/**
 * Emulates VBA lof statement API
 * @param {number} fileNumber File number
 * @return {number} length of the open file
 */
function lof(fileNumber) {
  if (!(fileNumber in this.openFiles)) {
    throw Error('File Number: ' + fileNumber + ' is not open');
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
    throw Error('File Number: ' + fileNumber + ' is not open');
  }
  var file = this.openFiles[fileNumber];
  return file.content.length == file.pointer;
}
