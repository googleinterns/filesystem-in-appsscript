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
 * Spreadsheet Logger object
 * This object can log messages to the active worksheet. Sheet
 * logging is faster than the stack driver logs.
 */
var spreadsheetLogger = {
  logRow: 1,
  logColumn: 1,
  sheet: null,
  /**
   * Log message into spreadsheet
   * @param {number} level Log indentation level
   * @param {string} message Message to log
   */
  log: function(message, indentation) {
    if (this.sheet == null) {
      this.reset();
    }
    indentation = indentation || 0;
    this.sheet.getRange(this.logRow++, this.logColumn + indentation)
        .setValue(message);
    if (this.logRow % 10 == 0) {
      SpreadsheetApp.flush();  // Flush every 10 logs automatically
    }
  },
  /**
   * Reset test report log
   */
  reset: function() {
    this.sheet = SpreadsheetApp.getActiveSheet();
    // Reset test log
    this.sheet.clear();
    SpreadsheetApp.flush();
    this.logRow = 1;
    this.logColumn = 1;
  }
};