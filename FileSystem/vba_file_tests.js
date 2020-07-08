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
 * @fileoverview VbaFile Unit Tests
 */

function vba_file_run_all_tests() {
  QUnit.module('VbaFile', {
    setup: function() {
      DirectoryManager.setCurrentDirectory('c:\\user\\desktop');
    }
  });

  var filePath = 'attendance.xlsx';
  var fullPath = 'c:\\user\\desktop\\attendance.xlsx';
  var fileId = FileMapper.getFileId(fullPath);
  var driveFile = DriveApp.getFileById(fileId);

  QUnit.test('File create testing', 2, function() {
    var vbaFile = FileSystem.getFile(filePath);
    equal(fileId, vbaFile.driveId, 'File created correctly - Id Check');
    equal(fullPath, vbaFile.localPath, 'File created correctly - Id Check');
  });

  QUnit.test('File date property testing', 3, function() {
    var vbaFile = FileSystem.getFile(filePath);
    var dateCreated = vbaFile.getDateCreated();
    var dateLastAccessed = vbaFile.getDateLastAccessed();
    var dateLastModified = vbaFile.getDateLastModified();
    equal(
        dateCreated.date.getTime(), driveFile.getDateCreated().getTime(),
        'Date Created Test');
    equal(
        dateLastAccessed.date.getTime(), driveFile.getLastUpdated().getTime(),
        'Date Accessed Test');
    equal(
        dateLastModified.date.getTime(), driveFile.getLastUpdated().getTime(),
        'Date Modified Test');
  });

  QUnit.test('File misc property testing', 3, function() {
    var vbaFile = FileSystem.getFile(filePath);
    var fileType = vbaFile.getType();
    var fileSize = vbaFile.getSize();
    var path = vbaFile.getPath();
    deepEqual(fileType, 'Microsoft Excel Worksheet', 'File Type Test');
    deepEqual(fileSize, driveFile.getSize(), 'File Size Test');
    deepEqual(path, fullPath, 'File Path Test');
  });

  QUnit.test('File directory property testing', 2, function() {
    var vbaFile = FileSystem.getFile(filePath);
    var vbaDrive = vbaFile.getDrive();
    var vbaParentFolder = vbaFile.getParentFolder();
    var parentFolderPath = vbaParentFolder.getPath();
    var actualParentFolderPath = getParentFolderPath(fullPath);
    equal(vbaDrive, 'C:', 'Drive Test');
    equal(parentFolderPath, actualParentFolderPath, 'Parent Folder Path Test');
  });
}
