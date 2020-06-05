/**
 * Flag variable to toggle using FileMapper mocker
 */
var USE_FILEMAPPER_MOCKER = true;

/**
 * Mocks the FileMapper module. To be replaced with complete implementation.
 * The mocker has a map of hardcoded file path to google drive file id mappings.
 */
var VBAFileMapperMocker = {
  mappings: {
    'c:\\User\\Desktop\\marks.xlsx':
      '1i3M1cYfubmXnosn5LJQmHCghBzhPBrDjBQszkWvZkxA',
    'c:\\User\\Desktop\\attendance.xlsx':
      '1bJb_KzRHW9nqYLa0N1GqMNoWZIOwxIb-TxYlIrk1NSs',
  },
  getFileId: function (currentDirectory, path, type) {
    if (path in this.mappings) {
      return this.mappings[path];
    }
    throw Error(path + ' not mapped!');
  },
  registerFile: function (currentDirectory, path, fileId) {
    this.mappings[path] = fileId;
  },
  hasMapping: function (currentDirectory, path, type) {
    return path in this.mappings;
  },
};

var FileMapper = USE_FILEMAPPER_MOCKER ? VBAFileMapperMocker : VBAFileMapper;

function createFile(currentDirectory, path, mimeType) {
  var fileId = DriveApp.createFile(path, '', mimeType).getId();
  FileMapper.registerFile(FileSystem.currentDirectory, path, fileId);
  return fileId;
}
