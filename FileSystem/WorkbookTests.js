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
      FileSystem.openWorkbook(fileName);
    }
  );

  QUnit.test(
    'multiple calls to workbook.open() when files are present',
    function () {
      expect(0);
      var fileName1 = 'c:\\User\\Desktop\\marks.xlsx';
      var fileName2 = 'c:\\User\\Desktop\\attendance.xlsx';
      FileSystem.openWorkbook(fileName2);
      FileSystem.openWorkbook(fileName1);
    }
  );
  
  if(!USE_FILEMAPPER_MOCKER) {
    QUnit.test(
    'single call to workbook.open() when file is not present',
    function () {
      expect(0);
      var fileName1 = 'FileNotExist.xlsx';
      FileSystem.openWorkbook(fileName1);
    }
  );
  }
}
