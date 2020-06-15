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
var ApiUtil = {
  checkInConfig: checkInConfig,
  getFromConfig: getFromConfig,
  addNewMappingToConfig: addNewMappingToConfig,
  checkIfMarkedDeleted: checkIfMarkedDeleted,
  findInDrive: findInDrive,
  getDestinationId: getDestinationId,
  createDeletedDestination: createDeletedDestination,
  createInDrive: createInDrive,
  getRegExFromPattern: getRegExFromPattern
}

/**
 * Checks if the mapping for a particular Local path exists or not in the config
 * 
 * @param {String} localPath The local destination path whose mapping is to be checked
 * @return {boolean} True if mapping exists, 
 *                   False otherwise
 */
function checkInConfig(localPath) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var value = documentProperties.getProperty(localPath);
  return (value !== null);
}

/**
 * Get the mapping corresponding to the localPath
 *
 * @param {String} localPath The local destination path whose mapping is to be returned
 * @return {String} value The corresponding drive Id if mapping exists, 
 *                  null otherwise
 */
function getFromConfig(localPath) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var value = documentProperties.getProperty(localPath);
  if (value !== null) {
    var mappingObj = JSON.parse(value);
    return mappingObj.id;
  }
  else {
    return null;
  }
}

/**
 * Adds a mapping to the config 
 * 
 * @param {String} localPath The local destination path
 * @param {String} id The corresponding drive destination Id
 * @param {boolean} isFile To signify whether its a file or folder
 */
function addNewMappingToConfig(localPath, id, isFile) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var drivepath = getFullDrivePath(id, isFile);
  var mappingObject = {
    id: id,
    drivepath: drivepath,
    isfolder: !isFile
  };
  documentProperties.setProperty(localPath, JSON.stringify(mappingObject));
}

/**
 * Checks if the mapping for a particular Local path has been deleted or not 
 * 
 * @param {String} localPath The local destination path whose mapping is to be checked
 * @return {boolean} True if mapping has been deleted, 
 *                   False otherwise
 */
function checkIfMarkedDeleted(localPath){
  var documentProperties = PropertiesService.getDocumentProperties();
  var value = documentProperties.getProperty(localPath);

  var mappingObj = JSON.parse(value);
  var deleted = false; 
  try {
    if(mappingObj.isfolder){
      var folder = DriveApp.getFolderById(mappingObj.id);
      // Check if folder is in trash
      deleted = folder.isTrashed();
    }
    else {
      var file = DriveApp.getFileById(mappingObj.id);
      // Check if file is in trash
      deleted = file.isTrashed();
    }
  } 
  catch(err) {
    // If the ids were not found in the drive then it throws an error
    // Ids will not be found in the drive after 30 days of being in trash
    deleted = true;
  }
  return deleted;
}

/**
 * Find the destination file/folder in the drive by traversing the given path
 * 
 * @param {FolderObject} currentDirectory The Folder object for the current directory 
 * @param {String} path The path to be traversed from the current directory to reach the
 *                 destination
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The drive id of the local file/folder if found or null if file 
 *                          is not found
 */
function findInDrive(currentDirectory, path, isUnix, isFile) {
  var folders = splitPath(path, isUnix);
  var driveId = null;

  if (folders.length > 0) {
    var destination = folders[folders.length - 1];
    var prev = currentDirectory;
    var curr;
    var found = false;

    for (var i = 0; (i < (folders.length - 1) && !found); i++) {
      curr = folders[i];

      if (curr && prev) {
        var fldrs = prev.getFoldersByName(curr);
        prev = (fldrs.hasNext()) ? fldrs.next(): null;
      }

      // Since previous folder is null that means the path is not found
      // in drive hence it will return null
      if (prev === null) {
        found = true;
      }
    }

    // If previous folder wasn't found null 
    if (!found) {
      found = true;
      driveId = getDestinationId(destination, prev, isFile);
    }
  }

  return driveId;
}

/** 
 * Gets the destination drive id of a file/folder having same mimetype as the local file  
 *
 * @param {String} destination The File whose mapping is to be found
 * @param {FolderObject} folder The Folder in which the file is to be searched
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The drive id of the local file/folder if found or null if file 
 *                  is not found
 */
function getDestinationId(destination, folder, isFile) {
  var driveId = null;
  if (isFile) {
    var extension = getExtension(destination);
    var mime = getMimeTypeFromExtension(extension);
    var files = folder.getFilesByName(destination);
    while (files.hasNext()) {
      var x = files.next();
      if (x.getMimeType() === mime) {
        driveId = x.getId();
      }
    }
  }
  else {
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
 * @param {String} localPath The local destination path whose mapping was marked deleted
 * @return {String} driveId The drive id of the newly created file or folder
 */
// Might need to modify this one 
function createDeletedDestination(localPath) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var value = documentProperties.getProperty(localPath);
  var mapping = JSON.parse(value);

  var path = mapping.drivepath;
  // Split the drive path which is connected by forward slash (hence isUnix is set true)
  var folders = splitPath(path, true);
  var driveId = mapping.id;
  if (folders.length > 0) {
    var destinationName = folders[folders.length - 1];
    var prev = DriveApp.getRootFolder();
    var curr;
    
    for (var i = 1; i < (folders.length - 1); i++) {
      curr = folders[i];
      if (curr && prev) {
        var fldrs = prev.getFoldersByName(curr);
        prev = (fldrs.hasNext()) ? fldrs.next(): prev.createFolder(curr);
      }
    }

    var destination;
    if(!mapping.isfolder){
      var extension = getExtension(localPath);
      if (extension === ""){
        extension = "txt";
      }
      var mimetype = getMimeTypeFromExtension(extension);
      destination = prev.createFile(destinationName, "", mimetype);
    }
    else{
      destination = prev.createFolder(destinationName);
    }
    driveId = destination.getId();
  }

  mapping.id = driveId;
  documentProperties.setProperty(localPath, JSON.stringify(mapping));
  return driveId;
}

/**
 * Create the destination file/folder in the drive by traversing the given path
 * 
 * @param {FolderObject} currentDirectory The Folder object for the current directory 
 * @param {String} relativePath The path to be traversed from the current directory to reach the 
 *                              destination
 * @param {boolean} isUnix To signify whether its a windows path or unix path
 * @param {boolean} isFile To signify whether its a file or folder
 * @return {String} driveId The drive id of the local file/folder if found or null if file 
 *                          is not found
 */
function createInDrive(currentDirectory, relativePath, isUnix, isFile) {
  var folders = splitPath(relativePath, isUnix);
  var driveId = null;
  if (folders.length > 0) {
    var destinationName = folders[folders.length - 1];
    var prev = currentDirectory;
    var curr;

    for (var i = 0; i < (folders.length - 1); i++) {
      curr = folders[i];
      if (curr && prev) {
        var fldrs = prev.getFoldersByName(curr);
        prev = (fldrs.hasNext()) ? fldrs.next() : prev.createFolder(curr);
      }
    }

    var destination;
    if (isFile) {
      var extension = getExtension(destinationName);
      // Making the local file without extension to be text file
      if (extension === "") {
        extension = "txt";
      }
      var mimetype = getMimeTypeFromExtension(extension);
      destination = prev.createFile(destinationName, "", mimetype);
    }
    else {
      destination = prev.createFolder(destinationName);
    }
    driveId = destination.getId();
  }
  return driveId;
}

/**
 * Convert the pattern to corresponding regex
 *  
 * @param {String} pattern The Windows or Unix pattern containing wildcards like '*' and '?'
 * @return {String} regex The regular expression corresponding to the pattern
 */ 
function getRegExFromPattern(pattern) {
  pattern = pattern.replace(/\./g, "\\.");
  pattern = pattern.replace(/\*/g, ".*");
  pattern = pattern.replace(/\?/g, ".");
  var regex = "^" + pattern + "$";
  return regex;
}







