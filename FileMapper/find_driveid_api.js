/**
 * Tester function
 */
function testerFunction() {
  var path = "C:\\Documents\\Muskan\\sheet1.xls";
  Logger.log(findDriveMapping(path));
}

/**
 * Finds the Drive Mapping for the given local 
 * mapping using the config data
 *
 * @param {String} localPath Local Path whose mapping 
 * is to be found
 * @return {String} driveMapping The Drive id of the 
 * mapped file/folder if found, otherwise it contains
 * "Mapping Not Found, Ask the User".
 */
function findDriveMapping(localPath) {
  var path = localPath;

  // replaced back slash with forward slash
  // to handle Mac file path
  path = path.replace(/\//g, "\\");

  var relativePath = "";
  var found = false;
  var driveMapping = "Mapping Not Found, Ask the User";

  while (!found && path.length > 0) {
    if (checkInConfig(path)) {
      if (relativePath.length > 0) {
        var currentDirectoryId = getFromConfig(path);
        var currentDirectory = DriveApp.getFolderById(currentDirectoryId);
        var relativeMapping = findInDrive(currentDirectory, relativePath);

        if (relativeMapping !== null) {
          addNewMappingToConfig(localPath, relativeMapping);
          found = true;
          driveMapping = relativeMapping;
        }
      }
      else {
        found = true;
        driveMapping = getFromConfig(path);
      }
    }

    if (found) {
      break;
    }

    var position = path.lastIndexOf("\\");
    if (position == -1) {
      if (relativePath.length == 0) {
        relativePath = path;
      }
      else {
        relativePath = path + "\\" + relativePath;
      }
      path = "";
    }
    else {
      if (relativePath.length == 0) {
        relativePath = path.slice(position + 1);
      }
      else {
        relativePath = path.slice(position + 1) + "\\" + relativePath;
      }
      path = path.slice(0, position);
    }
  }

  if (!found && relativePath.length > 0) {
    var currentDirectory = DriveApp.getRootFolder();
    var relativeMapping = findInDrive(currentDirectory, relativePath);

    if (relativeMapping !== null) {
      addNewMappingToConfig(localPath, relativeMapping);
      found = true;
      driveMapping = relativeMapping;
    }
  }

  return driveMapping;
}

/**
 * Checks if the mapping for a particular Local path
 * exists or not in the config
 * 
 * @param {String} localPath The local destination path
 * whose mapping is to be checked
 * @return {boolean} True if mapping exists, 
 *                   False otherwise
 */
function checkInConfig(localPath) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var value = documentProperties.getProperty(localPath);
  if (value !== null) {
    return true;
  }
  else {
    return false;
  }
}

/**
 * Get the mapping corresponding to the localPath
 *
 * @param {String} localPath The local destination path
 * whose mapping is to be returned
 * @return {String} value The corresponding drive Id if mapping exists, 
 *                  null otherwise
 */
function getFromConfig(localPath) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var value = documentProperties.getProperty(localPath);
  if (value !== null) {
    return value;
  }
  else {
    return null;
  }
}

/**
 * Adds a mapping to the config 
 * 
 * @param {String} localPath The local destination 
 * path
 * @param {String} id The corresponding drive 
 * destination Id
 */
function addNewMappingToConfig(localPath, id) {
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty(localPath, id);
}

/**
 * Find the destination file/folder in the
 * drive by traversing the given path
 * 
 * @param {FolderObject} currentDirectory The Folder 
 * object for the current directory 
 * @param {String} path The path to be traversed 
 * from the current directory to reach the
 * destination
 * @return {String} driveId The drive id of the
 * local file/folder if found or null if file 
 * is not found
 */
function findInDrive(currentDirectory, path) {
  var folders = path.split("\\");

  if (folders) {
    var destination = folders[folders.length - 1];
    var prev = currentDirectory;
    var curr;
    var found = false;
    var driveId = null;

    for (var i = 0; (i < (folders.length - 1) && !found); i++) {
      curr = folders[i];
      if (curr && prev) {
        var fldrs = prev.getFoldersByName(curr);
        if (fldrs.hasNext()) {
          prev = fldrs.next();
        }
        else {
          prev = null;
        }
      }
      else {
        prev = null;
      }
      if (prev === null) {
        found = true;
      }
    }

    if (!found) {
      found = true;
      driveId = getDestinationId(destination, prev);
    }
  }

  return driveId;
}

/** 
 * Gets the destination drive id of a file/folder
 * having same mimetype as the local file  
 *
 * @param {String} destination The File whose 
 * mapping is to be found
 * @param {FolderObject} folder The Folder in which 
 * the file is to be searched
 * @return {String} driveId The drive id of the
 * local file/folder if found or null if file 
 * is not found
 */
function getDestinationId(destination, folder) {
  var index = destination.lastIndexOf(".");
  var extension = "";
  if (index != -1) {
    extension = destination.substr(index + 1);
  }

  var driveId = null;
  if (extension.length > 0) {
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

