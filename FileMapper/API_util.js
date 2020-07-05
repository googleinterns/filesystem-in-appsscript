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
 * API Utilities
 */
var ApiUtil =
    {
      addNewMappingToConfig : addNewMappingToConfig,
      checkIfMarkedDeleted : checkIfMarkedDeleted,
      checkIfValidDriveId : checkIfValidDriveId,
      findInDrive : findInDrive,
      getDestinationId : getDestinationId,
      createDeletedDestination : createDeletedDestination,
      createInDrive : createInDrive,
      createDestination : createDestination,
      getRegExFromPattern : getRegExFromPattern,
      moveFileById : moveFileById,
      moveFolderById : moveFolderById,
      copyFileById : copyFileById,
      copyFolderById : copyFolderById,
      copyFolderInDrive : copyFolderInDrive
    }

/**
 * Adds a mapping to the config after computing the drive path
 *
 * @param {String} localPath The local destination path
 * @param {String} id The corresponding drive destination Id
 * @param {boolean} isFile To signify whether its a file or folder
 */
function addNewMappingToConfig(localPath, id, isFile) {
  var drivepath = SharedLibrary.getAbsoluteDrivePath(id, isFile);
  var mappingObject = {id : id, drivepath : drivepath, isfolder : !isFile};
  CONFIG.setMappingInConfigData(localPath, mappingObject);
  CONFIG.flushConfigDataToFile();
}

/**
 * Checks if the mapping for a particular Local path has been deleted or not
 *
 * @param {String} localPath The local destination path whose mapping is to be
 *     checked
 * @return {boolean} True if mapping has been deleted,
 *     False otherwise
 */
function checkIfMarkedDeleted(localPath) {
  var mappingObj = CONFIG.getMappingFromConfigData(localPath);

  var exists = ApiUtil.checkIfValidDriveId(mappingObj.id, !mappingObj.isfolder);
  return !exists;
}

/**
 * Checks if the driveId exists in the drive or not
 *
 * @param {String} driveId The drive Id
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {boolean} True if id is invalid,
 *                   False if id has been deleted or doesnot exist
 */
function checkIfValidDriveId(driveId, isFile) {
  var isValid = true;
  try {
    if (isFile) {
      var file = DriveApp.getFileById(driveId);
      // Check if file is in trash
      isValid = !file.isTrashed();
    } else {
      var folder = DriveApp.getFolderById(driveId);
      // Check if folder is in trash
      isValid = !folder.isTrashed();
    }
  } catch (err) {
    // If the ids were not found in the drive then it throws an error
    // Ids will not be found in the drive after 30 days of being in trash
    isValid = false;
  }
  return isValid;
}

/**
 * Find the destination file/folder in the drive by traversing the given path
 *
 * @param {FolderObject} currentDirectory The Folder object for the current
 *     directory
 * @param {String} path The path to be traversed from the current directory to
 *     reach the destination
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The drive id of the local file/folder if found or
 *     null if file is not found
 */
function findInDrive(currentDirectory, path, isUnix, isFile) {
  var index = PathUtil.getFirstSlash(path, isUnix);

  // If index is -1 means we are at the destination file/folder
  if (index === -1) {
    return ApiUtil.getDestinationId(path, currentDirectory, isFile);
  } else {
    // The folder which is to be searched in current directory
    var folderName = path.slice(0, index);
    // New path is now without the folder which will be searched in this call
    path = path.slice(index + 1);

    var folders = currentDirectory.getFoldersByName(folderName);
    return (folders.hasNext())
               ? ApiUtil.findInDrive(folders.next(), path, isUnix, isFile)
               : null;
  }
}

/**
 * Gets the destination drive id of a file/folder having same mimetype as the
 * local file
 *
 * @param {String} destination The File whose mapping is to be found
 * @param {FolderObject} folder The Folder in which the file is to be searched
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The drive id of the local file/folder if found or
 *     null if file is not found
 */
function getDestinationId(destination, folder, isFile) {
  var driveId = null;
  if (isFile) {
    var extension = getExtension(destination);
    var destinationMimetype = ConfigUtil.getMimeTypeFromExtension(extension);
    var files = folder.getFilesByName(destination);
    while (files.hasNext()) {
      var x = files.next();
      if (x.getMimeType() === destinationMimetype) {
        driveId = x.getId();
      }
    }
  } else {
    var fldrs = folder.getFoldersByName(destination);
    if (fldrs.hasNext()) {
      var x = fldrs.next();
      driveId = x.getId();
    }
  }
  return driveId;
}

/**
 * Create a new file or folder in place of a deleted one
 *
 * @param {String} localPath The local destination path whose mapping was marked
 *     deleted
 * @return {String} driveId The drive id of the newly created file or folder
 */
function createDeletedDestination(localPath) {
  var mappingObj = CONFIG.getMappingFromConfigData(localPath);

  var path = mappingObj.drivepath;

  // Drive path is connected by forward slash (hence isUnix is set true)
  var isUnix = true;
  var isFile = !mappingObj.isfolder;
  var index = PathUtil.getFirstSlash(path, isUnix);
  // Removing the "My Drive" part from the path since it is the root folder and
  // will be used as the current directory
  path = path.slice(index + 1);

  var driveId = createInDrive(DriveApp.getRootFolder(), path, isUnix, isFile);

  mappingObj.id = driveId;
  CONFIG.setMappingInConfigData(localPath, mappingObj);
  CONFIG.flushConfigDataToFile();
  return driveId;
}

/**
 * Create the destination file/folder in the drive by traversing the given path
 *
 * @param {FolderObject} currentDirectory The Folder object for the current
 *     directory
 * @param {String} relativePath The path to be traversed from the current
 *     directory to reach the destination
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The drive id of the local file/folder if found or
 *     null if file is not found
 */
function createInDrive(currentDirectory, relativePath, isUnix, isFile) {
  var index = PathUtil.getFirstSlash(relativePath, isUnix);

  // If index is -1 means we are at the destination file/folder
  if (index === -1) {
    return ApiUtil.createDestination(relativePath, currentDirectory, isFile);
  } else {
    // The folder which is to be searched in current directory
    var folderName = relativePath.slice(0, index);
    // New path is now without the folder which will be searched in this call
    relativePath = relativePath.slice(index + 1);
    var folders = currentDirectory.getFoldersByName(folderName);
    var folder = (folders.hasNext())
                     ? folders.next()
                     : currentDirectory.createFolder(folderName);

    return ApiUtil.createInDrive(folder, relativePath, isUnix, isFile);
  }
}

/**
 * Creates the destination file/folder having same mimetype as the local file
 *
 * @param {String} destinationName The name of file/folder which is to be
 *     created
 * @param {FolderObject} folder The Folder in which the file is to be created
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The drive id of the local file/folder created
 */
function createDestination(destinationName, folder, isFile) {
  var destination;
  var driveId;
  if (isFile) {
    var extension = PathUtil.getExtension(destinationName);
    // Making the local file without extension to be text file
    if (extension === "") {
      extension = "txt";
    }

    var mimetype = ConfigUtil.getMimeTypeFromExtension(extension);
    switch (mimetype) {
      case MimeType.GOOGLE_SHEETS: {
        destination = SpreadsheetApp.create(destinationName);
        break;
      }
      case MimeType.GOOGLE_DOCS: {
        destination = DocumentApp.create(destinationName);
        break;
      }
      case MimeType.GOOGLE_SLIDES: {
        destination = SlidesApp.create(destinationName);
        break;
      }
      default: {
        destination = DriveApp.createFile(destinationName, '', mimetype);
      }
    }

    driveId = destination.getId();
    moveFileById(driveId, folder.getId());
  } else {
    destination = folder.createFolder(destinationName);
    driveId = destination.getId();
  }

  return driveId;
}

/**
 * Convert the pattern to corresponding regex
 *
 * @param {String} pattern The Windows or Unix pattern containing wildcards like
 *     '*' and '?'
 * @return {String} regex The regular expression corresponding to the pattern
 */
function getRegExFromPattern(pattern) {
  pattern = pattern.replace(/\./g, "\\.");
  pattern = pattern.replace(/\*/g, ".*");
  pattern = pattern.replace(/\?/g, ".");
  var regex = "^" + pattern + "$";
  return regex;
}

/**
 * Utility function to move a file given by its drive id to a destination folder
 *
 * @param {String} sourceId Drive id of the source file
 * @param {String} targetFolderId Drive id of the target folder
 */
function moveFileById(sourceId, targetFolderId) {
  var file = DriveApp.getFileById(sourceId);
  file.getParents().next().removeFile(file);
  DriveApp.getFolderById(targetFolderId).addFile(file);
}

/**
 * Utility function to move a folder given by its drive id to a destination
 * folder
 *
 * @param {String} sourceId Drive id of the source folder
 * @param {String} targetFolderId Drive id of the target folder
 */
function moveFolderById(sourceId, targetFolderId) {
  var folder = DriveApp.getFolderById(sourceId);
  folder.getParents().next().removeFolder(folder);
  DriveApp.getFolderById(targetFolderId).addFolder(folder);
}

/**
 * Utility function to copy a file given by its drive id to a destination folder
 *
 * @param {String} sourceId Drive id of the source file
 * @param {String} targetFolderId Drive id of the target folder
 */
function copyFileById(sourceId, targetFolderId) {
  var file = DriveApp.getFileById(sourceId);
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  var newCopiedFile = file.makeCopy(file.getName(), targetFolder);
  return newCopiedFile.getId();
}

/**
 * Utility function to copy a folder given by its drive id to a destination
 * folder
 *
 * @param {String} sourceId Drive id of the source folder
 * @param {String} targetFolderId Drive id of the target folder
 */
function copyFolderById(sourceId, targetFolderId) {
  var sourceFolder = DriveApp.getFolderById(sourceId);
  var targetFolder = DriveApp.getFolderById(targetFolderId);

  var targetFolder = targetFolder.createFolder(sourceFolder.getName());
  ApiUtil.copyFolderInDrive(sourceFolder, targetFolder);

  return targetFolder.getId();
}

/**
 * Utility function to copy a folder given by Folder Object to the target folder
 * in the drive
 *
 * @param {FolderObject} source The Drive Folder Object of the source folder
 * @param {FolderObject} target The Drive Folder Object of the target folder
 */
function copyFolderInDrive(source, target) {
  var folders = source.getFolders();
  var files = source.getFiles();

  // Make copy of all the files in the source to the target folder
  while (files.hasNext()) {
    var file = files.next();
    file.makeCopy(file.getName(), target);
  }

  // Recursive call to copyFolder function to make copies of all the folders
  // inside source
  while (folders.hasNext()) {
    var subFolder = folders.next();
    var folderName = subFolder.getName();
    var targetFolder = target.createFolder(folderName);
    copyFolderInDrive(subFolder, targetFolder);
  }
}
