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
 * Create a new VbaFileSystemEntity Object. This is the base class for both
 * VbaFile and VbaFolder. This class implements the common file/folder APIs
 * @constructor
 * @param {string} driveId Drive Id of the file/folder
 * @param {string} localPath Local file path of the file/folder
 * @param {object} driveEntity Apps Script Drive File or Folder object
 * @return {VbaFileSystemEntity} New VbaFile Object
 */
function VbaFileSystemEntity(driveId, localPath, driveEntity) {
  this.driveId = driveId;
  this.localPath = localPath;
  this.driveEntity = driveEntity;
  return this;
}

/**
 * Emulates VBA File.DateCreated API
 * Get the date of the creation of the file system entity
 * @return {VbaDate} Date of creation
 */
VbaFileSystemEntity.prototype.getDateCreated = function() {
  return new VbaDate(this.driveEntity.getDateCreated());
};

/**
 * Emulates VBA File.DateLastModified API
 * Get the last modified date of the file system entity.
 * @return {VbaDate} Last accessed date
 */
VbaFileSystemEntity.prototype.getDateLastModified = function() {
  return new VbaDate(this.driveEntity.getLastUpdated());
};

/**
 * Emulates VBA File.DateLastAccessed API
 * Get the last accessed date of the file system entity. Google drive doesn't
 * have a last accessed date. Therefore returning the last modified date.
 * @return {VbaDate} Last accessed date
 */
VbaFileSystemEntity.prototype.getDateLastAccessed =
    VbaFileSystemEntity.prototype.getDateLastModified;

/**
 * Emulates VBA File.Drive API
 * Get the drive of file system entity.
 * If the localPath is c:/user/desktop, the drive is C:
 * @return {string} drive of the localPath
 */
VbaFileSystemEntity.prototype.getDrive = function() {
  return this.localPath[0].toUpperCase() + ':';
};

/**
 * Emulates VBA File.ParentFolder API
 * Get parent folder of the file system entity
 * @return {VbaFolder} Parent folder object
 */
VbaFileSystemEntity.prototype.getParentFolder = function() {
  var parentPath = getParentFolderPath(this.localPath);
  if (parentPath == this.localPath) {
    throw new Error(this.localPath + ' is a root directory');
  }
  return new VbaFolder(parentPath);
};

/**
 * Emulates VBA File.Name API
 * Get or set the name of the file system entity
 * @param {string} name New name of the file system entity
 * @returns {string} Name of the file system entity
 */
VbaFileSystemEntity.prototype.name = function(name) {
  if (name) {
    this.driveEntity.setName(name);
    var parentPath = getParentFolderPath(this.localPath);
    this.localPath = getAbsoluteLocalPath(parentPath, name);
    return name;
  }
  return this.driveEntity.getName();
};

/**
 * Emulates VBA File.Path API
 * Get the local file path of the file system entity
 * @returns {string} Local file path of the file system entity
 */
VbaFileSystemEntity.prototype.getPath = function() {
  return this.localPath;
};

/**
 * Emulates VBA File.Size API
 * Get the size of the file system entity in bytes
 * @returns {number} Size of the file system entity in bytes
 */
VbaFileSystemEntity.prototype.getSize = function() {
  return this.driveEntity.getSize();
};

/**
 * Create a new VbaFile Object
 * @constructor
 * @param {string} localPath Local file path of the file
 * @return {VbaFile} New VbaFile Object
 */
function VbaFile(localPath) {
  var driveId = FileMapper.getFileId(localPath);
  var driveFile = DriveApp.getFileById(driveId);
  // Call base class VbaFileSystemEntity constructor
  VbaFileSystemEntity.call(this, driveId, localPath, driveFile);
  return this;
}

// VbaFile derives from VbaFileSystemEntity
VbaFile.prototype = Object.create(VbaFileSystemEntity.prototype);
VbaFile.prototype.constructor = VbaFile;

/**
 * Emulates VBA File.Type API
 * Get the file type. File type is determined by extension.
 * @return {string} File type of the file
 */
VbaFile.prototype.getType = function() {
  var fileExtensionRegExp = /\.(\w*)$/;
  var fileName = this.name();
  // Test for file extension
  if (!fileExtensionRegExp.test(fileName)) {
    return 'File';  // No File Extension, return default
  }
  // Extract file extension
  var fileExtension = fileName.match(fileExtensionRegExp)[1].toLowerCase();
  // List of standard file extensions
  var fileExtensionMappings = {
    'txt': 'Text Document',
    'xls': 'Microsoft Excel 97 - 2003 Worksheet',
    'xlsx': 'Microsoft Excel Worksheet',
    'xlsm': 'Microsoft Excel Macro - Enabled Worksheet',
    'doc': 'Microsoft Word 97 - 2003 Document',
    'docx': ' Microsoft Word Document',
    'ppt': 'Microsoft PowerPoint 97 - 2003 Presentation',
    'pptx': 'Microsoft PowerPoint Presentation',
    'pdf': 'Adobe Acrobat Document',
  };
  if (fileExtension in fileExtensionMappings) {
    return fileExtensionMappings[fileExtension];
  }
  throw new Error('Unknown File Type: ' + fileExtension);
};

/**
 * Create a new VbaFolder Object
 * @constructor
 * @param {string} localPath Local file path of the folder
 * @return {VbaFolder} New VbaFolder Object
 */
function VbaFolder(localPath) {
  var driveId = FileMapper.getFolderId(localPath);
  var driveFolder = DriveApp.getFolderById(driveId);
  // Call base class VbaFileSystemEntity constructor
  VbaFileSystemEntity.call(this, driveId, localPath, driveFolder);
  return this;
}

// VbaFolder derives from VbaFileSystemEntity
VbaFolder.prototype = Object.create(VbaFileSystemEntity.prototype);
VbaFolder.prototype.constructor = VbaFolder;

/**
 * Emulates VBA Folder.Files API
 * Get files in the folder
 * @todo VbaFolder.getFiles - Return VbaCollection of files
 * @return {Array} Array of VbaFile objects
 */
VbaFolder.prototype.getFiles = function() {
  var files = [];
  var fileIterator = this.driveEntity.getFiles();
  while (fileIterator.hasNext()) {
    var fileName = fileIterator.next().getName();
    var filePath = getAbsoluteLocalPath(this.localPath, fileName);
    files.push(new VbaFile(filePath));
  }
  return files;
};

/**
 * Emulates VBA Folder.SubFolders API
 * Get sub folders in the folder
 * @todo VbaFolder.getSubFolders - Return VbaCollection of folders
 * @return {Array} Array of VbaFolder objects
 */
VbaFolder.prototype.getSubFolders = function() {
  var folders = [];
  var folderIterator = this.driveEntity.getFolders();
  while (folderIterator.hasNext()) {
    var folderName = folderIterator.next().getName();
    var folderPath = getAbsoluteLocalPath(this.localPath, folderName);
    folders.push(new VbaFolder(folderPath));
  }
  return folders;
};

/**
 * Emulates VBA Folder.Type API
 * Get the folder type. Google Drive supports only regular file folders.
 * @return {string} File type of the file
 */
VbaFolder.prototype.getType = function() {
  return 'File Folder';
};

/**
 * Emulates VBA Folder.IsRootFolder API
 * Check if the folder is a root folder
 * @return {boolean} true if the folder is a root folder
 */
VbaFolder.prototype.isRootFolder = function() {
  var parentPath = getParentFolderPath(this.localPath);
  return parentPath == this.localPath;
};
