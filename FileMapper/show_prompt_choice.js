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
 * JavaScript code for the User Prompt Choice box
 */
function showPromptToGetMappingFromUser(localPathValue, isFile) {
  // Create HTML dialog and set template parameters
  var htmlOutput = HtmlService.createTemplateFromFile('show_user_prompt');
  htmlOutput.localPathValue = localPathValue ? localPathValue : '';
  htmlOutput.isFile = isFile;

  // Display dialog to the user
  var html = htmlOutput.evaluate()
      .setWidth(600)
      .setHeight(240)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  var title = 'Select Mapping File';
  SpreadsheetApp.getUi().showModalDialog(html, title);
}
