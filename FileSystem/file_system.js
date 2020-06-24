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
