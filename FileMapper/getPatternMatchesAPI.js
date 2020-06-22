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
 * API to find all the file names which matches a specified pattern. It supports
 * the use of multiple character (*) and single character (?) wildcards to
 * specify multiple files.
 *
 * @param {String} pattern The Windows or Unix pattern containing wildcards like
 *     '*' and '?'
 * @return {StringArray} matches The names of files that matches the specified
 *     pattern.
 */
function findFilesByPattern(pattern) {
  return getPatternMatchesUtil(pattern, true);
}

/**
 * API to find all the folder names which matches a specified pattern. It
 * supports the use of multiple character (*) and single character (?) wildcards
 * to specify multiple files and folders.
 *
 * @param {String} pattern The Windows or Unix pattern containing wildcards like
 *     '*' and '?'
 * @return {StringArray} matches The names of directories or folders that
 *     matches the specified pattern.
 */
function findFoldersByPattern(pattern) {
  return getPatternMatchesUtil(pattern, false);
}

/**
 * Utility function to get all the files/folder names which matches a specified
 * pattern. It supports the use of multiple character (*) and single character
 * (?) wildcards to specify multiple files and folders.
 *
 * @param {String} pattern The Windows or Unix pattern containing wildcards like
 *     '*' and '?'
 * @param {boolean} isFile To signify whether we need to find files or folders
 * @return {StringArray} matches The names of files or folders that matches the
 *     specified pattern.
 */
function getPatternMatchesUtil(pattern, isFile) {
  var isUnix = PathUtil.checkIfUnixPath(pattern);

  // To store all the pattern matches found
  var matches = [];
  // To check if a match is already done then it is not repeated
  var done = {};

  var position = PathUtil.getLastSlash(pattern, isUnix);
  // Path to the directory in which pattern is to be searched
  var directoryPath = pattern.slice(0, position);
  // Convert destination name value containing Pattern to regular expression
  var regex = ApiUtil.getRegExFromPattern(pattern.slice(position + 1));

  // First find if some path in the config matches the pattern directly
  var documentProperties = PropertiesService.getDocumentProperties();
  var properties = documentProperties.getProperties();
  for (var property in properties) {
    if (properties[property].isfolder === !isFile) {
      var isThisUnix = PathUtil.checkIfUnixPath(property);
      var tempPosition = PathUtil.getLastSlash(property, isThisUnix);

      // First checking the directory path
      var tempDir = property.slice(0, tempPosition);
      if (tempDir !== directoryPath) {
        continue;
      }

      // Now check for destination pattern match
      var tempDestination = property.slice(tempPosition + 1);
      var tempArray = tempDestination.match(regex);
      if (tempArray.length > 0 && tempArray[0] === tempDestination) {
        if (!(tempDestination in done)) {
          done[tempDestination] = true;
          matches.push(tempDestination);
        }
      }
    }
  }

  /**
   * Finding the mapping for the folder in which the pattern matching
   * files/folders are to be found by making a call to the getFolderId()
   * function if it return a drive id then find all the files/folders matching
   * the given pattern within this folder using regular expressions and return
   * the array of all file/folder names
   */
  if (hasFolder(directoryPath)) {
    var directoryId = getFolderId(directoryPath);
    var directory = DriveApp.getFolderById(directoryId);

    if (isFile) {
      var files = directory.getFiles();
      while (files.hasNext()) {
        var file = files.next();
        var tempArray = file.getName().match(regex);
        if (tempArray != null && tempArray[0] === file.getName()) {
          if (!(tempArray[0] in done)) {
            done[tempArray[0]] = true;
            matches.push(tempArray[0]);
          }
        }
      }
    } else {
      var folders = directory.getFolders();
      while (folders.hasNext()) {
        var folder = folders.next();
        var tempArray = folder.getName().match(regex);
        if (tempArray.length > 0 && tempArray[0] === folder.getName()) {
          if (!(tempArray[0] in done)) {
            done[tempArray[0]] = true;
            matches.push(tempArray[0]);
          }
        }
      }
    }
  }

  return matches;
}
