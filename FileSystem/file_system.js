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

var FileSystem = {};

/**
 * Emulates VBA FileSystemObject.GetFile API
 * Get Vba File object given relative or absolute file path
 * @param {string} localPath Local file path of the file
 * @return {VbaFile} Vba File object representing the file
 */
FileSystem.getFile = function(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  return new VbaFile(localPath);
};

/**
 * Emulates VBA FileSystemObject.GetFolder API
 * Get Vba Folder object given relative or absolute folder path
 * @param {string} localPath Local file path of the folder
 * @return {VbaFile} Vba Folder object representing the folder
 */
FileSystem.getFolder = function(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  return new VbaFolder(localPath);
};

/**
 * Emulates VBA FileSystemObject.BuildPath API
 * Combines a folder path and the name of a folder or file and returns the
 * combination with valid path separators. Method doesn't check if the file or
 * folder actually exists.
 * @param {string} localPath Local file path of the folder. Can be either
 *     relative or absolute path.
 * @param {string} name Existing path with which name is combined.
 * @return {string} Combined file and folder path
 */
FileSystem.buildPath = function(localPath, name) {
  var lastChar = localPath[localPath.length - 1];
  if (lastChar != '/' && lastChar != '\\') {
    localPath += '\\';
  }
  return localPath + name;
};

/**
 * Emulates VBA FileSystemObject.GetTempName API
 * Get a randomly generated temporary file or folder name that is useful for
 * performing operations that require a temporary file or folder.
 * @return {string} Temporary file or folder name
 */
FileSystem.getTempName = function() {
  var prefix = 'rad';
  var suffix = '.tmp';
  var randomValues = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var randomPart = '';
  for (var i = 0; i < 5; i++) {
    var index = Math.floor(Math.random() * randomValues.length);
    randomPart += randomValues[index];
  }
  return prefix + randomPart + suffix;
};

/**
 * Emulates VBA FileSystemObject.GetExtensionName
 * Get a string containing the extension name for the last component in a path.
 * @param {string} localPath Local file path of the file
 * @returns {string} The extension name
 */
FileSystem.getExtensionName = function(localPath) {
  var fileExtensionRegExp = /\.(\w*)$/;
  if (!fileExtensionRegExp.test(localPath)) {
    return '';
  }
  return localPath.match(fileExtensionRegExp)[1];
};

/**
 * Emulates VBA FileSystemObject.GetFileName API
 * Get the last component of a specified path
 * @param {string} localPath Local file path of the file or folder
 * @return {string} Name of the last component of localPath
 */
FileSystem.getFileName = function(localPath) {
  localPath = localPath.split(fileSeparatorRegExp);
  return localPath[localPath.length - 1];
};

/**
 * Emulates VBA FileSystemObject.GetFileName API
 * Get a string containing the name of the parent folder of the last component
 * in a specified path.
 * @param {string} localPath Local file path of the file or folder
 * @return {string} Name of the last component of localPath
 */
FileSystem.getParentFolderName = function(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  var parentPath = getParentFolderPath(localPath);
  return this.getFileName(parentPath);  // Get last component of path
};

/**
 * Emulates VBA FileSystemObject.GetBaseName API
 * Get a string containing the base name of the last component, removing any
 * file extension, in the path.
 */
FileSystem.getBaseName = function(localPath) {
  var fileName = this.getFileName(localPath);  // Get last component
  var baseNameRegExp = /^([^<>\\/:"\|\?\*]*)\.\w*$/;
  if (!baseNameRegExp.test(fileName)) {
    return fileName;  // No extension
  }
  return fileName.match(baseNameRegExp)[1];
};

/**
 * Emulates VBA FileSystemObject.GetAbsolutePathName API
 * @param {string} localPath Local relative or absolute path file path
 * @return {string} Absolute path
 */
FileSystem.getAbsolutePathName = function(localPath) {
  return DirectoryManager.getAbsolutePath(localPath);
};

/**
 * Emulates VBA FileSystemObject.CreateTextFile
 * Create an empty text file. Optionally overwrite an existing file. File is
 * created and opened in write mode.
 * @param {string} localPath Local file path of the text file to be created
 * @param {boolean} overwrite Flag to overwrite if the file already exists
 * @return {VbaTextStream} TextStream object representing the created file
 *     opened in write mode
 */
FileSystem.createTextFile = function(localPath, overWrite) {
  // Set default values
  if (overWrite === undefined) {
    overWrite = true;
  }
  localPath = DirectoryManager.getAbsolutePath(localPath);
  // Check if file exists
  if (FileMapper.hasFile(localPath)) {
    if (overWrite) {
      FileMapper.deleteFile(localPath);  // overwrite
    } else {
      throw new Error(localPath + ' already exists');
    }
  }
  FileMapper.createFile(localPath);
  return new VbaTextStream(localPath, IoMode.FOR_WRITING);
};

/**
 * Emulates VBA FileSystemObject.OpenTextFile
 * Open a text file in read, write or append mode. Optionally create the file if
 * it doesn't exist.
 * @param {string} localPath Local file path of the text file to be opened
 * @param {string} ioMode IoMode mode enumeration - Reading, writing or append
 * @param {boolean} createIfNotExists Flag to create file if it doesn't exist
 * @return {VbaTextStream} TextStream object representing the opened file
 */
FileSystem.openTextFile = function(localPath, ioMode, createIfNotExists) {
  // Set default values
  if (createIfNotExists === undefined) {
    createIfNotExists = false;
  }
  ioMode = ioMode || IoMode.FOR_READING;
  localPath = DirectoryManager.getAbsolutePath(localPath);
  if (!FileMapper.hasFile(localPath)) {
    if (createIfNotExists) {
      FileMapper.createFile(localPath);
    } else {
      throw new Error(localPath + ' does not exist');
    }
  }
  return new VbaTextStream(localPath, ioMode);
};

/**
 * Emulates VBA FileSystemObject.FileExists API
 * Function to check if file exists given relative path or absolute path
 * @param {string} localPath Local file path of the file
 * @return {boolean} True if file exists
 */
FileSystem.fileExists = function(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  return FileMapper.hasFile(localPath);
};

/**
 * Emulates VBA FileSystemObject.FolderExists API
 * Function to check if a folder exists given relative path or absolute path
 * @param {string} localPath Local file path of the folder
 * @return {boolean} True if the folder exists
 */
FileSystem.folderExists = function(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  return FileMapper.hasFolder(localPath);
};

/**
 * Emulates VBA FileSystemObject.DeleteFile API
 * Function to delete a file given file name. Name can contain wildcard
 * characters '*' and '?' to match multiple files.
 * @param {string} filePathPattern File name specification which can
 *     include wildcard characters, for one or more files to be deleted
 */
FileSystem.deleteFiles = function(filePathPattern) {
  deleteEntity(filePathPattern, true);
};

/**
 * Emulates VBA FileSystemObject.DeleteFolder API
 * Function to delete a folder given file folder. Name can contain wildcard
 * characters '*' and '?' to match multiple folders.
 * @param {string} folderPathPattern Folder name specification which can
 *     include wildcard characters, for one or more folders to be deleted
 */
FileSystem.deleteFolders = function(folderPathPattern) {
  deleteEntity(folderPathPattern, false);
};

/**
 * Emulates VBA FileSystemObject.CopyFile API
 * Copies one or more files from one location to another. Source path can
 * contain wild characters '*' and '?' in the last component. Optionally
 * overwrite existing files. If sourcePath is a wildcard pattern, then
 * destinationPath is the destination folder. If sourcePath contains a trailing
 * file separator, then destinationPath is a destination folder. Otherwise,
 * destinationPath is the new file.
 * @param {string} sourcePath File path specification, which can include
 *     wildcard characters, for one or more files to be copied.
 * @param {string} destinationPath File path for the destination file
 * @param {boolean} overwrite Flag indicating to overwrite existing files
 */
FileSystem.copyFile = function(sourcePath, destinationPath, overwrite) {
  if (overwrite === undefined) {
    overwrite = true;
  }
  return cloneEntity(sourcePath, destinationPath, overwrite, false, true);
};

/**
 * Emulates VBA FileSystemObject.MoveFile API
 * Moves one or more files from one location to another. Source path can
 * contain wild characters '*' and '?' in the last component.  If sourcePath is
 * a wildcard pattern, then destinationPath is the destination folder. If
 * sourcePath contains a trailing file separator, then destinationPath is a
 * destination folder. Otherwise, destinationPath is the renamed file.
 * @param {string} sourcePath File path specification, which can include
 *     wildcard characters, for one or more files to be copied.
 * @param {string} destinationPath File path for the destination file
 */
FileSystem.moveFile = function(sourcePath, destinationPath) {
  return cloneEntity(sourcePath, destinationPath, false, true, true);
};

/**
 * Emulates VBA FolderSystemObject.CopyFolder API
 * Copies one or more folders from one location to another. Source path can
 * contain wild characters '*' and '?' in the last component. Optionally
 * overwrite existing folders. If sourcePath is a wildcard pattern, then
 * destinationPath is the destination folder. If sourcePath contains a trailing
 * folder separator, then destinationPath is a destination folder. Otherwise,
 * destinationPath is the new folder.
 * @param {string} sourcePath Folder path specification, which can include
 *     wildcard characters, for one or more folders to be copied.
 * @param {string} destinationPath Folder path for the destination folder
 * @param {boolean} overwrite Flag indicating to overwrite existing folders
 */
FileSystem.copyFolder = function(sourcePath, destinationPath, overwrite) {
  if (overwrite === undefined) {
    overwrite = true;
  }
  return cloneEntity(sourcePath, destinationPath, overwrite, false, false);
};

/**
 * Emulates VBA FolderSystemObject.MoveFolder API
 * Moves one or more folders from one location to another. Source path can
 * contain wild characters '*' and '?' in the last component.  If sourcePath is
 * a wildcard pattern, then destinationPath is the destination folder. If
 * sourcePath contains a trailing folder separator, then destinationPath is a
 * destination folder. Otherwise, destinationPath is the renamed folder.
 * @param {string} sourcePath Folder path specification, which can include
 *     wildcard characters, for one or more folders to be copied.
 * @param {string} destinationPath Folder path for the destination folder
 */
FileSystem.moveFolder = function(sourcePath, destinationPath) {
  return cloneEntity(sourcePath, destinationPath, false, true, false);
};
