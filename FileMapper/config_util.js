/**
 * Computes the Drive path for a 
 * file/folder using their Id
 * 
 * @param {String} id The drive destination Id
 * whose path needs to be computed
 * @return {String} drivePath The corresponding 
 * drive path
 */
function getFullFilePath(id) {
  var current = DriveApp.getFileById(id);

  if (!current) {
    current = DriveApp.getFolderById(id);
  }

  var folders = [],
      parent = current.getParents();

  while (parent.hasNext()) {
    parent = parent.next();
    folders.push(parent.getName());
    parent = parent.getParents();
  }

  var drivePath = folders.reverse().join("/") + "/" + current.getName();
  return drivePath;
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
function checkMappingExists(localPath) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var value = documentProperties.getProperty(localPath);
  
  if (value !== null)
    return true;
  return false;
}

/**
 * Checks if the MimeType for the desination of a 
 * Local Path and a drive Id matches or not
 * 
 * @param {String} localPath The local destination path
 * @param {String} driveId The corresponding drive 
 * destination Id
 * @return {boolean} True if MimeType matches, 
 *                   False otherwise
 */
function checkIfMimeTypeMatches(localPath, driveId) {
  var index = localPath.lastIndexOf(".");
  var extension = "";
  if (index != -1) {
    extension = localPath.substr(index + 1);
  }

  var localMimeType = getMimeTypeFromExtension(extension);
  var driveMimeType = DriveApp.getFileById(driveId).getMimeType();
  if (!driveMimeType) {
    driveMimeType = MimeType.FOLDER;
  }
  
  if (driveMimeType === localMimeType) {
    return true;
  }
  else{
    return false;
  }
}

/**
* Function to return the MimeType based on 
* the file extension
*/
function getMimeTypeFromExtension(extension) {
  if (extension === "xls" || extension === "xlsx" || extension === "csv")
    return MimeType.GOOGLE_SHEETS;

  if (extension === "doc" || extension === "docx" || extension === "pdf" || extension === "txt")
    return MimeType.GOOGLE_DOCS;

  if (extension === "ppt" || extension === "pptx")
    return MimeType.GOOGLE_SLIDES;

  if (extension === "")
    return MimeType.FOLDER;
}
