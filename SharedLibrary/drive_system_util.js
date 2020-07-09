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
 * Computes the Drive path for a file/folder using their Id
 *
 * @param {string} id The drive destination Id whose path needs to be computed
 * @return {string} The corresponding drive path
 */
function getAbsoluteDrivePath(id, isFile) {
  var current;

  if (isFile) {
    current = DriveApp.getFileById(id);
  } else {
    current = DriveApp.getFolderById(id);
  }

  var folders = [];
  var parentIterator = current.getParents();

  while (parentIterator.hasNext()) {
    var parent = parentIterator.next();
    folders.push(parent.getName());
    parentIterator = parent.getParents();
  }

  var drivePath = folders.reverse().join('/') + '/' + current.getName();
  return drivePath;
}
