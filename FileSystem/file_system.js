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

var FileSystem = {};

/**
 * Emulates VBA FileSystemObject.GetFile API
 * Get Vba File object given relative or absolute file path
 * @param {string} localPath Local file path of the file
 * @return {VbaFile} Vba File object representing the file
 */
FileSystem.getFile = function(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  return new VbaFile(localPath);
};

/**
 * Emulates VBA FileSystemObject.GetFolder API
 * Get Vba Folder object given relative or absolute folder path
 * @param {string} localPath Local file path of the folder
 * @return {VbaFile} Vba Folder object representing the folder
 */
FileSystem.getFolder = function(localPath) {
  localPath = DirectoryManager.getAbsolutePath(localPath);
  return new VbaFolder(localPath);
};
