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
  getFileLength: getFileLength,
  getFileDateTime: getFileDateTime,
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
  this.currentDirectory = sanitizePath(path, this.getFileSystemType());
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
      throw new Error(drive + ' is an invalid drive letter');
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
  var driveId = FileMapper.getFileId('', path);
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
  var driveId = FileMapper.getFileId('', path);
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
