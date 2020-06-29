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
  this.currentDirectory = sanitizePath(path);
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
