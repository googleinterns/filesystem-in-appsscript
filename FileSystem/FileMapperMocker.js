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
    'c:\\User\\Desktop\\marks.xlsx': "1i3M1cYfubmXnosn5LJQmHCghBzhPBrDjBQszkWvZkxA",
    'c:\\User\\Desktop\\attendance.xlsx': "1bJb_KzRHW9nqYLa0N1GqMNoWZIOwxIb-TxYlIrk1NSs"
  },

  getFileId: function (current_directory, path, type) {
    if (path in this.mappings)
      return this.mappings[path];

    throw Error(path + " not mapped!");
  },

  registerFile: function (current_directory, path, file_id) {
    this.mappings[path] = file_id;
  },

  hasMapping: function (current_directory, path, type) {
    return path in this.mappings;
  }
}

var FileMapper = USE_FILEMAPPER_MOCKER ? VBAFileMapperMocker : VBAFileMapper;

function create_file(current_directory, path, mimeType) {
  var fileId = DriveApp.createFile(path, "", mimeType).getId();
  FileMapper.registerFile(FileSystem.current_directory, path, fileId);
  return fileId;
}
