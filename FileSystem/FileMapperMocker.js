var USE_FILEMAPPER_MOCKER = true;

/**
 * Mocks the FileMapper module. To be replaced with complete implementation.
 * The mocker has a list of hardcoded file path to google drive file id mappings.
 *
 * @return {Array.<string>} The selected text.
 */
var VBAFileMapperMocker = {
    mappings: {
      'c:\\User\\Desktop\\marks.xlsx' : "1i3M1cYfubmXnosn5LJQmHCghBzhPBrDjBQszkWvZkxA",
      'c:\\User\\Desktop\\attendance.xlsx' : "1bJb_KzRHW9nqYLa0N1GqMNoWZIOwxIb-TxYlIrk1NSs"
    },

    getFileId: function(current_directory, path, type) {
      if(path in this.mappings)
        return this.mappings[path];
      
      throw Error(`${path} not mapped!`);
    }
}

var FileMapper = USE_FILEMAPPER_MOCKER ? VBAFileMapperMocker : VBAFileMapper;