/**
 * Returns the Config data present in the document properties
 * as local path and drive path pairs.
 * 
 * @return {Object} absPath The object containing local path 
 * and drive path pairs.
 */
function getConfigData() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var properties = documentProperties.getProperties();

  var absPath = {};
  for (var property in properties) {
    absPath[property] = getFullFilePath(properties[property]);
  }

  return absPath;
}

/**
 * Adds a mapping to the config if both 
 * paths corresponds to destinations having
 * compatible Mimetypes
 * 
 * @param {String} localPath The local destination path
 * @param {String} driveId The corresponding drive 
 * destination Id
 * @return {boolean} True if mapping was added, 
 *                   False otherwise
 */
function addMapping(localPath, driveId) {
  var documentProperties = PropertiesService.getDocumentProperties();

  if (checkIfMimeTypeMatches(localPath, driveId)) {
    documentProperties.setProperty(localPath, driveId);
    return true;
  }
  else {
    return false;
  }
}

/**
 * Updates a mapping in the config if both 
 * paths corresponds to destinations having
 * compatible Mimetypes
 * 
 * @param {String} localPath The local destination path
 * @param {String} driveId The corresponding drive 
 * destination Id
 * @return {boolean} True if mapping was updated, 
 *                   False otherwise
 */
function updateMapping(localPath, driveId) {
  var documentProperties = PropertiesService.getDocumentProperties();

  if (checkIfMimeTypeMatches(localPath, driveId)) {
    documentProperties.deleteProperty(localPath);
    documentProperties.setProperty(localPath, driveId);
    return true;
  }
  else {
    return false;
  }
}

/**
 * Deletes a mapping from the config
 * 
 * @param {String} localPath The local destination path
 * whose mapping is to be deleted
 */
function deleteMapping(localPath) {
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteProperty(localPath);
}


