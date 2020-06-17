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
 * Directory Manager Library
 */
var DirectoryManager = {
  currentDirectory: '',
  getCurrentDirectory: getCurrentDirectory,
  setCurrentDirectory: setCurrentDirectory,
  getAbsolutePath: getAbsolutePath,
  curDir: curDir,
  fileSystemType: '',
  getFileSystemType: getFileSystemType_,
  changeDirectory: changeDirectory,
  changeDrive: changeDrive,
  getFileLength: getFileLength,
  getFileDateTime: getFileDateTime,
  searchResults: [],
  searchFiles: searchFiles,
  deleteFiles: deleteFiles,
  deleteDirectory: deleteDirectory,
  createDirectory: createDirectory,
};

/**
 * Internal function to get the current directory.
 * If file directory is not initialized, it is
 * initialized to current active workbook path.
 * @return {string} current directory
 */
function getCurrentDirectory() {
  if (this.currentDirectory == '') {
    // Initialize current directory to active workbook path
    var path = Workbook.getActiveWorkbookPath();
    this.setCurrentDirectory(path);
  }
  return this.currentDirectory;
}

/**
 * Internal function to set the current directory.
 * @param {string} path Current directory path
 */
function setCurrentDirectory(path) {
  if (!isValidAbsolutePath(path)) {
    throw new Error(path + ' is an invalid path');
  }
  path = sanitizePath(path, this.getFileSystemType());
  if (!FileMapper.hasFolder(path)) {
    throw new Error(path + ' directory does not exist');
  }
  this.currentDirectory = path;
}

/**
 * Function to get absolute path given relative path.
 * If the relative path is absolute, then the relative path is returned
 * @param {string} relativePath Relative path
 * @return {string} Absolute Path
 */
function getAbsolutePath(relativePath) {
  var currentDirectory = this.getCurrentDirectory();
  return getAbsoluteLocalPath(currentDirectory, relativePath);
}

/**
 * Emulates VBA CurDir statement API
 * If drive is empty return current directory
 * Else return root directory of that drive
 * @param {string} drive Drive letter
 * @return {string} Current directory
 */
function curDir(drive) {
  var path = this.getCurrentDirectory();
  var fileSystemType = this.getFileSystemType();
  if (drive) {
    if (fileSystemType == FileSystemType.UNIX) {
      return path;  // If Unix System, ignore drive letter
    } else if (drive.toLowerCase() == path[0].toLowerCase()) {
      return path;  // Current Directory same as drive letter
    }
    var newPath = drive + ':\\';
    if (!isValidAbsolutePath(newPath)) {
      throw new Error(drive + 'is an invalid drive');
    }
    return newPath;
  } else {
    return path;
  }
}

/**
 * Gets file system type from active workbook path.
 * @return {string} File system type enumeration
 */
function getFileSystemType_() {
  if (!this.fileSystemType) {
    var activeWorkbookPath = Workbook.getActiveWorkbookPath();
    this.fileSystemType = getFileSystemType(activeWorkbookPath);
  }
  return this.fileSystemType;
}

/**
 * Emulates VBA FileLen API
 * Returns length of file in bytes
 * @param {string} path Path of file
 * @return {number} Length of file in bytes
 */
function getFileLength(path) {
  path = this.getAbsolutePath(path);
  var driveId = FileMapper.getFileId(path);
  var file = DriveApp.getFileById(driveId);
  return file.getSize();
}

/**
 * Emulates VBA FileDateTime API
 * Returns time file was last modified
 * @todo Handle user locale for datatime
 * @body Currently using US/English locale
 * @param {string} path Path of file
 * @return {string} Datetime string of file's last modification date
 */
function getFileDateTime(path) {
  path = this.getAbsolutePath(path);
  var driveId = FileMapper.getFileId(path);
  var file = DriveApp.getFileById(driveId);
  var date = file.getLastUpdated();
  // Extract Date attributes
  var day = date.getDate().toString();
  var month = (date.getMonth() + 1).toString();
  var year = date.getFullYear().toString().substr(2);
  var hour = date.getHours().toString();
  var minutes = date.getMinutes().toString();
  var seconds = date.getSeconds().toString();
  var period = 'AM';
  if (hour >= 12) {
    period = 'PM';
  }
  if (hour > 12) {
    hour -= 12;
  }
  // Construct Date Time String
  var date = day + '/' + month + '/' + year;
  var time = hour + ':' + minutes + ':' + seconds;
  var dateTime = date + ' ' + time + ' ' + period;
  return dateTime;
}

/**
 * Emulates VBA ChDir statement API
 * Changes currentDirectory to given relative or absolute path
 * @param {string} localPath Local directory path
 */
function changeDirectory(localPath) {
  path = this.getAbsolutePath(localPath);
  this.setCurrentDirectory(path);
}

/**
 * Emulates VBA ChDrive statement API
 * Changes current working drive.
 * @todo Write tests for ChDrive
 * @body ChDrive cannot be tested by the File Mapper Mocker as the mocker
 * doesn't support drives
 * @param {string} drive Drive Letter
 */
function changeDrive(drive) {
  var fileSystemType = this.getFileSystemType();
  if (fileSystemType == FileSystemType.WINDOWS) {
    var currentDirectory = this.getCurrentDirectory();
    if (currentDirectory[0].toLowerCase() != drive.toLowerCase()) {
      var newCurrentDirectory = drive + ':\\';
      this.setCurrentDirectory(newCurrentDirectory);
    }
  }
}

/**
 * Emulates VBA Dir statement API
 * Method to search for files by pattern. Pattern can include wildcard
 * characters such as '*' and '?'. First file name matched with the pattern will
 * be returned. If method is called without filePathPattern parameter, then the
 * next file name that matches the pattern will be returned. The first time no
 * file name is matched, empty string will be returned. The second time no file
 * name is matched, an error will be thrown.
 * @param {string} filePathPattern File path pattern with wild cards
 * @return {string} Search Result
 */
function searchFiles(filePathPattern) {
  if (filePathPattern != undefined) {
    if (filePathPattern == '') {
      filePathPattern = '*';  // Empty string, match all files
    }
    // Get absolute path
    if (!isAbsolutePath(filePathPattern)) {
      filePathPattern = this.getAbsolutePath(filePathPattern);
    }
    var files = FileMapper.findFilesByPattern(filePathPattern);
    files.sort();  // Sort files alphabetically
    files.reverse();
    this.searchResults = files;  // Set search results
  }
  if (this.searchResults == null) {
    throw new Error('No more matching files');
  } else if (this.searchResults.length == 0) {
    this.searchResults = null;
    return '';
  } else {
    return this.searchResults.pop();
  }
}

/**
 * Emulates VBA kill statement API
 * @todo Kill API: Throw error if file is open
 * Searches for files by pattern containing wild cards '*' and '?' and then
 * deletes the files.
 * @param {string} filePathPattern File path pattern with wild cards
 */
function deleteFiles(filePathPattern) {
  var fileSystemType = this.getFileSystemType();
  var fileSeparator = fileSystemType == FileSystemType.UNIX ? '/' : '\\';
  // Get absolute path
  if (!isAbsolutePath(filePathPattern)) {
    filePathPattern = this.getAbsolutePath(filePathPattern);
  }
  // Find file matches
  var files = FileMapper.findFilesByPattern(filePathPattern);
  // Move up one level
  var filePathPattern = getAbsoluteLocalPath(filePathPattern, '..');
  // Delete files
  for (var i = 0; i < files.length; i++) {
    var filePath = filePathPattern + fileSeparator + files[i];
    FileMapper.deleteFile(filePath);
  }
}

/**
 * Emulates VBA RmDir statement API
 * Deletes an empty directory. If directory contains files, an error is thrown.
 * @param {string} localPath Local directory path
 */
function deleteDirectory(localPath) {
  localPath = this.getAbsolutePath(localPath);
  var folderId = FileMapper.getFolderId(localPath);
  var folder = DriveApp.getFolderById(folderId);
  var fileIterator = folder.getFiles();
  if (fileIterator.hasNext()) {
    throw new Error(localPath + ' is not an empty directory');
  }
  FileMapper.deleteFolder(localPath);
}

/**
 * Emulates VBA MkDir statement API
 * Creates an empty directory.
 * @param {string} localPath Local directory path
 */
function createDirectory(localPath) {
  localPath = this.getAbsolutePath(localPath);
  FileMapper.createFolder(localPath);
}
