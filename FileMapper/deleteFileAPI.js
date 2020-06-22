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
 * API to delete the drive file which is mapped to the absolute local file path.
 *
 * @param {String} localPath The local file path whose mapped file is to be
 *     deleted
 * @return {boolean} True If the file was deleted succesfully
 */
function deleteFile(localPath) {
  // Check if the file exists or not
  var exists = hasFile(localPath);

  if (exists) {
    var id = getFileId(localPath);
    var file = DriveApp.getFileById(id);
    file.setTrashed(true);
  } else {
    // If the file to be deleted doesn't exist
    var errorMessage = "File mapped to the local path " + localPath +
                       " has already been deleted.";
    throw new FileDoesNotExistException(errorMessage);
  }
  return exists;
}

/**
 * API to delete the drive folder which is mapped to the absolute local folder
 * path.
 *
 * @param {String} localPath The local folder path whose mapped folder is to be
 *     deleted
 * @return {boolean} True If the folder was deleted succesfully
 */
function deleteFolder(localPath) {
  var exists = hasFolder(localPath);

  if (exists) {
    var id = getFolderId(localPath);
    var folder = DriveApp.getFolderById(id);
    folder.setTrashed(true);

    // To delete all the mappings in the config which has this localPath as a
    // part of their path
    var documentProperties = PropertiesService.getDocumentProperties();
    var properties = documentProperties.getProperties();

    for (var property in properties) {
      var prefix = property.slice(0, localPath.length);

      if (prefix === localPath) {
        var mappingObj = JSON.parse(properties[property]);
        
        if (mappingObj.isfolder) {
          var folder = DriveApp.getFolderById(mappingObj.id);
          folder.setTrashed(true);
        } else {
          var file = DriveApp.getFileById(mappingObj.id);
          file.setTrashed(true);
        }
      }
    }
  } else {
    // If the folder to be deleted doesn't exist
    var errorMessage = "Folder mapped to the local path " + localPath +
                       " has already been deleted.";
    throw new FileDoesNotExistException(errorMessage);
  }
  return exists;
}
