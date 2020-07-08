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
 * utilities.sleep, If the mapping is not found, the function will try 15 times
 * with 5 seconds interval between attempts. If the mapping is still not found,
 * error will be thrown.
 * @param {function} func Function that needs to be blocking
 * @param {number} sleepTime Amount of time the function should sleep in
 *     milliseconds before retrying
 * @param {number} retryCount Number of times to retry before timing out
 * @param {function} retryCallback Callback function which is called before
 *     retrying
 * @param {function} failureCallback Callback function which is called when the
 *     function times out
 * @return {function} Decorated blocking function
 */
function blockFunctionDecorator(
    func, sleepTime, retryCount, retryCallback, failureCallback) {
  return function() {
    try {
      var args = Array.prototype.slice.call(arguments);
      args.push(true);  // Show prompt once
      return func.apply(this, args);
    } catch (err) {
      if (err instanceof PromptException) {
        var args = Array.prototype.slice.call(arguments);
        args.push(false);  // Don't show prompt again
        // Try 15 times
        for (var i = 0; i < retryCount; i++) {
          try {
            Utilities.sleep(sleepTime);
            // Call retry call back
            if (retryCallback) {
              retryCallback();
            }
            return func.apply(this, args);  // Try again
          } catch (err) {
            if (!(err instanceof PromptException)) {
              throw err;
            }
          }
        }
      }
      if (err instanceof PromptException) {
        if (failureCallback) {
          // Call failure callback
          failureCallback();
        }
      }
      throw err;
    }
  }
}
