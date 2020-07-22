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
 * Helper function to copy or move files and to copy or move folders. Optionally
 * overwrite existing files or folders if existing. File entities can be
 * optionally specified by a wild card pattern in the last component of the
 * sourcePath. If destinationPath has a trailing file separator, then
 * destinationPath is the destination folder. If sourcePath contains wild
 * card characters, then destinationPath is the destination folder. Otherwise,
 * destinationPath is the final entity name. Function throws an error if entity
 * already exists and overwrite is false. Function throws an error if an entity
 * exists and the entity type is different. Function throws an error if
 * sourcePath does not match any entities.
 * @param {string} sourcePath File or folder pattern of the entity to be moved
 *     or copied
 * @param {boolean} overwrite Flag indicating to overwrite existing entity if
 *     exists
 * @param {boolean} deleteSource Flag indicating to delete original entity. True
 *     emulates move behavior, false emulates copy behavior.
 * @param {boolean} isFile Flag indicating whether entity is a file
 */
function cloneEntity(
    sourcePath, destinationPath, overwrite, deleteSource, isFile) {
  // Get corresponding entity File Mapper API
  var fileMapperApi = ApiUtil.getFileMapper(isFile);
  // Get corresponding entity Drive API
  var driveApi = ApiUtil.getDriveApi(isFile);
  // Get last character to check if destinationPath has a trailing file
  // separator
  var lastChar = destinationPath[destinationPath.length - 1];
  // Check conditions for destinationPath to be destination folder
  var containsTrailingSeparator = fileSeparatorRegExp.test(lastChar);
  var containsWildCard = wildCardRegExp.test(sourcePath);
  // Get absolute paths
  if (!isAbsolutePath(sourcePath)) {
    sourcePath = DirectoryManager.getAbsolutePath(sourcePath);
  }
  destinationPath = DirectoryManager.getAbsolutePath(destinationPath);
  // Find file system entities
  var fileSystemEntities = fileMapperApi.findByPattern(sourcePath);
  // Move up one directory
  sourcePath = getParentFolderPath(sourcePath);
  // Pattern doesn't match any entities
  if (fileSystemEntities.length == 0) {
    throw new Error(sourcePath + ' does not match any files or folders');
  }
  /**
   * Check if destinationPath is a folder name -
   * If the sourcePath contains a wild card, then destination is
   * considered a folder. If there is a file separator after the path,
   * destination is considered a folder. Else destination is considered as the
   * target file.
   */
  if (containsWildCard || containsTrailingSeparator) {
    // destinationPath is a folder
    for (var i = 0; i < fileSystemEntities.length; i++) {
      var name = fileSystemEntities[i];
      // Build full source path
      var fullSourcePath = FileSystem.buildPath(sourcePath, name);
      // Build full destination path
      var fullDestinationPath = FileSystem.buildPath(destinationPath, name);
      // Check if entity of sane type exists, delete if overwrite is true
      if (fileMapperApi.hasEntity(fullDestinationPath)) {
        if (overwrite) {
          fileMapperApi.deleteEntity(fullDestinationPath);
        } else {
          throw new Error(fullDestinationPath + ' already exists');
        }
      }
      // Check if entity of different type already exists
      if (isFile) {
        if (FileMapper.hasFolder(fullDestinationPath)) {
          throw new Error(fullDestinationPath + ' is a folder');
        }
      } else {
        if (FileMapper.hasFile(fullDestinationPath)) {
          throw new Error(fullDestinationPath + ' is a file');
        }
      }
      // Copy or move the entity
      if (deleteSource) {
        fileMapperApi.moveEntity(fullSourcePath, destinationPath);
      } else {
        fileMapperApi.copyEntity(fullSourcePath, destinationPath);
      }
    }
  } else {
    // destinationPath is a file/folder name
    // Check if entity of sane type exists, delete if overwrite is true
    if (fileMapperApi.hasEntity(destinationPath)) {
      if (overwrite) {
        fileMapperApi.deleteEntity(destinationPath);
      } else {
        throw new Error(destinationPath + ' already exists');
      }
    }
    // Check if entity of different type already exists
    if (isFile) {
      if (FileMapper.hasFolder(destinationPath)) {
        throw new Error(destinationPath + ' is a folder');
      }
    } else {
      if (FileMapper.hasFile(destinationPath)) {
        throw new Error(destinationPath + ' is a file');
      }
    }
    // Get Destination file name
    var fileName = FileSystem.getFileName(destinationPath);
    // Get destination folder
    var destinationFolderPath = getParentFolderPath(destinationPath);
    var destinationFolderId = FileMapper.getFolderId(destinationFolderPath);
    var destinationFolder = DriveApp.getFolderById(destinationFolderId);
    var entityName = fileSystemEntities[0];
    var fullSourcePath = FileSystem.buildPath(sourcePath, entityName);
    var entityId = fileMapperApi.getEntityId(fullSourcePath);
    var entity = driveApi.getEntityById(entityId);
    // Make copy to destination folder
    FileMapper.deleteMapping(destinationPath);
    if (deleteSource) {
      driveApi.makeMove(entity, fileName, destinationFolder);
    } else {
      driveApi.makeCopy(entity, fileName, destinationFolder);
    }
    if (isFile) {
      FileMapper.addFileMapping(destinationPath, entityId);
    } else {
      FileMapper.addFolderMapping(destinationPath, entityId);
    }
  }
};

/**
 * Helper function to delete files or folders
 * @param {string} pattern File or folder pattern of the entity to be deleted
 * @param {boolean} isFile Flag indicating whether entity is a file
 */
function deleteEntity(pattern, isFile) {
  var fileSystemType = DirectoryManager.getFileSystemType();
  var fileSeparator = fileSystemType == FileSystemType.UNIX ? '/' : '\\';
  var fileMapperApi = ApiUtil.getFileMapper(isFile);
  // Get absolute path
  if (!isAbsolutePath(pattern)) {
    pattern = DirectoryManager.getAbsolutePath(pattern);
  }
  // Find entity matches
  var entities = fileMapperApi.findByPattern(pattern);
  if (entities.length == 0) {
    var entityType = isFile ? 'file' : 'folder';
    var errorMessage = pattern + ' Did not match any ' + entityType;
    throw new Error(errorMessage);
  }
  // Move up one level
  var parentPath = getParentFolderPath(pattern);
  // Delete entities
  for (var i = 0; i < entities.length; i++) {
    var entityPath = parentPath + fileSeparator + entities[i];
    fileMapperApi.deleteEntity(entityPath);
  }
}