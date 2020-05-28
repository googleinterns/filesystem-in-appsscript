/**
 * For Testing only. Open spreadsheet in a new tab. 
 *
 * @param {string} path The local file path in the Excel file
 * 
 * @return {Spreadsheet} The spreadsheet object of the path
 */
function api_workbook_open(path) {
  FileSystem.api_workbook_open(path);
}

/**
 * Unit Tests
 *
 */
function workbook_run_all_tests() {
  
  TestFramework.reset();
  
  TestFramework.test(
    "check if filemapper returns correct file and mimeType when file is present", 
    function () {
      var fileName = 'c:\\User\\Desktop\\marks.xlsx';
      var fileId = FileMapper.getFileId(FileSystem.current_directory, 
                                        fileName, 
                                        MimeType.GOOGLE_SHEETS);
      TestFramework.assert(fileId == "1i3M1cYfubmXnosn5LJQmHCghBzhPBrDjBQszkWvZkxA", "FileMapper returns correct file id");
      var file = DriveApp.getFileById(fileId);
      TestFramework.assert(file.getMimeType() == MimeType.GOOGLE_SHEETS, "FileMapper returns correct mimeType");
    });
  
  
  TestFramework.test(
    "single call to workbook.open() when file is present", 
    function () {
      var fileName = 'c:\\User\\Desktop\\marks.xlsx';
      var file = FileSystem.api_workbook_open(fileName);
    });
  
  TestFramework.test(
    "multiple calls to workbook.open() when files are present", 
    function () {
      var fileName1 = 'c:\\User\\Desktop\\marks.xlsx';
      var fileName2 = 'c:\\User\\Desktop\\attendance.xlsx';
      var file2 = FileSystem.api_workbook_open(fileName2);
      var file1 = FileSystem.api_workbook_open(fileName1);
    });
  
  TestFramework.test(
    "single call to workbook.open() when file is not present", 
    function () {
      var fileName1 = 'FileNotExist.xlsx';
      var file1 = FileSystem.api_workbook_open(fileName1);
    });
  
  TestFramework.runTests();
}
