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
 * Opens a form in the document containing the add-on's user interface.
 */
function displayFileUploadForm(localPathValue, destinationFolder) {
  // Create HTML dialog and set template parameters
  var htmlOutput = HtmlService.createTemplateFromFile('fileUploadForm');
  htmlOutput.localPathValue = localPathValue ? localPathValue : '';
  htmlOutput.destinationFolder =
      destinationFolder ? destinationFolder : "My Drive";

  // Display dialog to the user
  var html = htmlOutput.evaluate()
      .setWidth(600)
      .setHeight(425)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  var title = 'Upload a file to Google Drive';
  SpreadsheetApp.getUi().showModalDialog(html, title);
}

/**
 * Gets the blob data, mimetype and filename and decodes the data back
 * from base64, then create a blob from all of these and then create a
 * file in the drive. Also, add the mapping of the uploaded file to
 * the config
 *
 * @param {string} data The base64 encoded file data.
 * @param {string} mimetype The required mimetype of the file.
 * @param {string} filename The required filename for the file.
 * @param {string} localPathValue Local path to which uploaded file will be
 *     mapped to
 * @param {string} destinationFolderId Drive id of the destination folder where
 *     the file is to be uploaded
 * @return {string} string containing the drive url of the file created.
 */
function processForm(data, mimetype, filename, localPathValue,
                     destinationFolderId) {
  var filedata = Utilities.base64Decode(data);
  var blob = Utilities.newBlob(filedata);

  var driveFile = {
      title : filename, 
      mimeType : mimetype
    };

  var index = filename.lastIndexOf(".");
  var extension = "";
  if (index != -1) {
    extension = filename.substr(index + 1);
  }

  if (extension === "xls" || extension === "xlsx") {
    driveFile = Drive.Files.insert(driveFile, blob, {convert : true});
  } else {
    driveFile = Drive.Files.insert(driveFile, blob);
  }

  var file;
  file = DriveApp.getFileById(driveFile.id);
  // File name is changing to one without extension
  // Hence setting it again
  file.setName(filename);

  var drivePath = "My Drive/" + filename;
  if (destinationFolderId !== "") {
    // Move the newly uploaded file to the desired folder
    ApiUtil.moveFileById(file.getId(), destinationFolderId);

    var destinationFolder =
        SharedLibrary.getAbsoluteDrivePath(destinationFolderId, true);
    drivePath = destinationFolder + '/' + filename;
  }

  CONFIG.setMappingInConfigData(localPathValue, {
      id : driveFile.id, 
      drivepath : drivePath, 
      isfolder : false
  });
  CONFIG.flushConfigDataToFile();

  return file.getUrl();
}
