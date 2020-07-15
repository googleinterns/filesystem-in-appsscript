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
 * Config Utilities
 */
var ConfigUtil =
    {
      checkIfDrivePathChanged : checkIfDrivePathChanged,
      checkMappingExists : checkMappingExists,
      checkIfMimeTypeMatches : checkIfMimeTypeMatches,
      getMimeTypeFromExtension : getMimeTypeFromExtension
    }

/**
 * Checks if the Drive Path for a particular mapping has been changed due to
 * the file being moved
 *
 * @param {Object} mapping The mapping object containg the drive id and previous
 *     drive path
 * @return {boolean} True if drive path is changed,
 *     False otherwise
 */
function checkIfDrivePathChanged(mapping) {
  var newDrivePath =
      SharedLibrary.getAbsoluteDrivePath(mapping.id, !mapping.isfolder);
  return !(newDrivePath === mapping.drivepath);
}

/**
 * Checks if the mapping for a particular pair of Local path and drive id exists
 * or not in the config
 *
 * @param {String} localPath The local destination path whose mapping is to be
 *     checked
 * @param {String} driveId The drive Id which needs to be mapped to the provided
 *     local path
 * @return {boolean} True if mapping pair exists,
 *     False otherwise
 */
function checkMappingExists(localPath, driveId) {
  var localPathInConfig = CONFIG.getLocalPathCaseMapping(localPath);

  if (localPathInConfig) {
    var mappedData = CONFIG.getMappingFromConfigData(localPathInConfig);
    return (mappedData) ? (mappedData.id === driveId) : false;
  } else {
    return false;
  }
}

/**
 * Checks if the MimeType for the desination of a Local Path and a drive Id
 * matches or not
 *
 * @param {String} localPath The local destination path
 * @param {String} driveId The corresponding drive destination Id
 * @return {boolean} True if MimeType matches,
 *                   False otherwise
 */
function checkIfMimeTypeMatches(localPath, driveId) {
  var extension = PathUtil.getExtension(localPath);

  var localMimeType = ConfigUtil.getMimeTypeFromExtension(extension);
  var driveMimeType = DriveApp.getFileById(driveId).getMimeType();
  if (!driveMimeType) {
    driveMimeType = MimeType.FOLDER;
  }

  return (driveMimeType === localMimeType);
}

/**
 * Function to return the MimeType based on the file extension
 */
function getMimeTypeFromExtension(extension) {
  if (extension === "")
    return MimeType.FOLDER;

  var sheets_extensions = [ "xls", "xlsx", "xlsm" ];
  if (sheets_extensions.indexOf(extension) !== -1)
    return MimeType.GOOGLE_SHEETS;

  var docs_extensions = [ "doc", "docx", "docm" ];
  if (docs_extensions.indexOf(extension) !== -1)
    return MimeType.GOOGLE_DOCS;

  var slides_extensions = [ "ppt", "pptx", "pptm" ];
  if (slides_extensions.indexOf(extension) !== -1)
    return MimeType.GOOGLE_SLIDES;

  var csv_extensions = [ "csv", "tsv" ];
  if (csv_extensions.indexOf(extension) !== -1)
    return MimeType.CSV;

  var pdf_extensions = [ "pdf" ];
  if (pdf_extensions.indexOf(extension) !== -1)
    return MimeType.PDF;

  var rtf_extensions = [ "rtf" ];
  if (rtf_extensions.indexOf(extension) !== -1)
    return MimeType.RTF;

  var css_extensions = [ "css" ];
  if (css_extensions.indexOf(extension) !== -1)
    return MimeType.CSS;

  var html_extensions = [ "html" ];
  if (html_extensions.indexOf(extension) !== -1)
    return MimeType.HTML;

  var javascript_extensions = [ "js" ];
  if (javascript_extensions.indexOf(extension) !== -1)
    return MimeType.JAVASCRIPT;

  /**
   * IMAGE EXTENSION MIMETYPES
   */
  var bmp_extensions = [ "bmp" ];
  if (bmp_extensions.indexOf(extension) !== -1)
    return MimeType.BMP;

  var gif_extensions = [ "gif" ];
  if (gif_extensions.indexOf(extension) !== -1)
    return MimeType.GIF;

  var jpeg_extensions = [ "jpg", "jpeg" ];
  if (jpeg_extensions.indexOf(extension) !== -1)
    return MimeType.JPEG;

  var png_extensions = [ "png" ];
  if (png_extensions.indexOf(extension) !== -1)
    return MimeType.PNG;

  var svg_extensions = [ "svg" ];
  if (svg_extensions.indexOf(extension) !== -1)
    return MimeType.SVG;

  // Default MimeType
  return MimeType.PLAIN_TEXT;
}
