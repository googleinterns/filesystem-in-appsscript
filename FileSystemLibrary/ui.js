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
 * Utility function to open URL in a new tab
 * @param {string} url The url to be opened
 * @param {string} message The message to be displayed in a dialog box
 */
function openURL(url, message) {
  message = message || 'Open Url in new tab';

  // Lock is required to prevent parallel
  // processes from opening multiple dialogs
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(10000);
    var htmlOutput =
        HtmlService
            .createHtmlOutput(
                '<script>window.open("' + url + '", "_blank");</script>')
            .setWidth(350)
            .setHeight(25);
    SpreadsheetApp.getUi().showModelessDialog(htmlOutput, message);

    // Open in new tab takes some time.
    // Therefore we need to hold the lock for some time.
    Utilities.sleep(3000);
    lock.releaseLock();
  } catch (e) {
    Logger.log('Could not obtain lock after 10 seconds.');
    throw new Error('Could not obtain lock after 10 seconds.');
  }
}
