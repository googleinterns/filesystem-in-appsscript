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
 * Decorate function to make it blocking
 * Emulate blocking behavior by manually blocking the execution by using
 * utilities.sleep, If the mapping is not found, the function will try 5 times
 * with 10 seconds interval between attempts. If the mapping is still not found,
 * error will be thrown.
 *
 * @param {function} functionToBeBlocked Function that needs to be blocking
 * @return {function} Decorated blocking function
 */
function blockerFunction(functionToBeBlocked) {
  return function() {
    try {
      var args = Array.prototype.slice.call(arguments);
      // Show prompt once
      args.push(true);

      return functionToBeBlocked.apply(this, args);
    } catch (err) {
      if (err instanceof MappingNotFoundException) {
        var args = Array.prototype.slice.call(arguments);
        // Don't show prompt again
        args.push(false);

        // Try 10 times
        for (var i = 0; i < 10; i++) {
          try {
            Utilities.sleep(10 * 1000);

            Logger.log('Trying ' + (i + 1) + ' Time');
            // Reload config data
            CONFIG.loadConfigData();
            // Calling the function again after delay
            return functionToBeBlocked.apply(this, args);
          } catch (err) {
            if (!(err instanceof MappingNotFoundException)) {
              // Some other error occurred
              throw err;
            }
          }
        }
      }

      // If the same error was seen even after 10 times
      if (err instanceof MappingNotFoundException) {
        showErrorAlert();
      }
      throw err;
    }
  };
}

/**
 * Error Alert for the user when the execution is terminated
 */
function showErrorAlert() {
  var ui = SpreadsheetApp.getUi();

  var result =
      ui.alert('Execution Failed',
               'Current macro execution has timed out.\n Please try again.',
               ui.ButtonSet.OK);
}
