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
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker(localPathValue) {
  // Create HTML dialog and set template parameters
  var htmlOutput = HtmlService.createTemplateFromFile('pickerPrompt');
  htmlOutput.localPathValue = localPathValue ? localPathValue : '';

  // Display dialog to the user
  var html = htmlOutput.evaluate()
      .setWidth(600)
      .setHeight(425)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  var title = 'Select a file';

  SpreadsheetApp.getUi().showModalDialog(html, title);
}

/**
 * Processes the picked file data and add mapping to the config
 *
 * @param {String} id Drive id of the picked file
 * @param {Boolean} isFolder To signify whether its a file or folder
 * @param {String} localPathValue Local path to which picked file will be mapped
 *     to
 */
function processPickedFile(id, isFolder, localPathValue) {
  var drivepath = SharedLibrary.getAbsoluteDrivePath(id, isFolder);
  CONFIG.setMappingInConfigData(localPathValue, {
      id : id, 
      drivepath : drivepath, 
      isfolder : isFolder
  });
  CONFIG.flushConfigDataToFile();
}
