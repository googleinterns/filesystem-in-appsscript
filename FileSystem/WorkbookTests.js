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
 * @fileoverview Workbook Unit Tests
 */
function workbook_run_all_tests() {
  QUnit.module('Workbook');

  QUnit.test(
    'check if filemapper returns correct file and mimeType when file is present',
    function () {
      var fileName = 'c:\\User\\Desktop\\marks.xlsx';
      var fileId = FileMapper.getFileId(
        FileSystem.currentDirectory,
        fileName,
        MimeType.GOOGLE_SHEETS
      );
      equal(
        fileId,
        '1i3M1cYfubmXnosn5LJQmHCghBzhPBrDjBQszkWvZkxA',
        'FileMapper returns correct file id'
      );
      var file = DriveApp.getFileById(fileId);
      equal(
        file.getMimeType(),
        MimeType.GOOGLE_SHEETS,
        'FileMapper returns correct mimeType'
      );
    }
  );

  QUnit.test(
    'single call to workbook.open() when file is present',
    function () {
      expect(0);
      var fileName = 'c:\\User\\Desktop\\marks.xlsx';
      Workbook.openWorkbook(fileName);
    }
  );

  QUnit.test(
    'multiple calls to workbook.open() when files are present',
    function () {
      expect(0);
      var fileName1 = 'c:\\User\\Desktop\\marks.xlsx';
      var fileName2 = 'c:\\User\\Desktop\\attendance.xlsx';
      Workbook.openWorkbook(fileName2);
      Workbook.openWorkbook(fileName1);
    }
  );

  if (!USE_FILEMAPPER_MOCKER) {
    QUnit.test(
      'single call to workbook.open() when file is not present',
      function () {
        expect(0);
        var fileName1 = 'FileNotExist.xlsx';
        Workbook.openWorkbook(fileName1);
      }
    );
  }

  QUnit.test(
    'ActiveWorkbook call when active workbook path is not set',
    function () {
      Workbook.resetActiveWorkbookPath();
      throws(
        function () {
          Workbook.getActiveWorkbookPath();
        },
        'ActiveWorkbookPath not defined',
        'Error thrown correctly'
      );
    }
  );

  QUnit.test(
    'ActiveWorkbook call when active workbook path is set',
    function () {
      expect(2);
      Workbook.resetActiveWorkbookPath();
      var path = 'C:\\User\\Desktop';
      Workbook.setActiveWorkbookPath(path);
      equal(path, Workbook.getActiveWorkbookPath(), 'Path set correctly');
      Workbook.resetActiveWorkbookPath();
      Workbook.setActiveWorkbookPath(path + '\\');
      equal(path, Workbook.getActiveWorkbookPath(), 'Path set correctly');
    }
  );
}
