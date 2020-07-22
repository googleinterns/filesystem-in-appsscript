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
 * Helper function to get error stack
 * @return {string} Line number of the caller's caller
 */
function getErrorStack() {
  try {
    throw new Error();
  } catch (err) {
    return err.stack.split(/\t/g).slice(3).join('\t');
  }
}

/**
 * Helper function to create a new custom error
 * @param {string} name Name of the newly created error
 * @param {function} BaseError Constructor of the base error
 * @returns {Err} The new Error
 */
function createError(name, BaseError) {
  // Define the constructor
  function Err(message) {
    this.message = message;
    this.stack = getErrorStack()
    return this;
  }

  // Defaults to default Error as base error
  BaseError = BaseError || Error;
  Err.prototype = new BaseError();

  // set the name property
  Err.prototype.name = name;

  // set the constructor
  Err.prototype.constructor = Err;

  return Err;
}


/**
 * Create a new Prompt Exception object for blocker function Utility.
 * @constructor
 */
PromptException = createError('PromptException', Error);


/**
 * Create a new Mapping not found exception object.
 * @constructor
 */
MappingNotFoundException =
    createError('MappingNotFoundException', PromptException);    

/**
 * Get the exception's name.
 * @return {string}
 */
MappingNotFoundException.prototype.getName = function() {
  return this.name;
};

/**
 * Get the exception message.
 * @return {string}
 */
MappingNotFoundException.prototype.getMessage = function() {
  return this.message;
};

/**
 * Get the printable message
 * @return {string}
 */
MappingNotFoundException.prototype.toString = function() {
  return this.name + ': ' + this.message;
};


/**
 * Create a new file/folder doesnot exist exception object.
 * @constructor
 */
FileDoesNotExistException = 
    createError('FileDoesNotExistException', Error);

/**
 * Get the exception's name.
 * @return {string}
 */
FileDoesNotExistException.prototype.getName = function() {
  return this.name;
};

/**
 * Get the exception message.
 * @return {string}
 */
FileDoesNotExistException.prototype.getMessage = function() {
  return this.message;
};

/**
 * Get the printable message
 * @return {string}
 */
FileDoesNotExistException.prototype.toString = function() {
  return this.name + ': ' + this.message;
};


/**
 * Create a new file/folder already exists exception object.
 * @constructor
 */
FileAlreadyExistsException = 
    createError('FileAlreadyExistsException', Error);

/**
 * Get the exception's name.
 * @return {string}
 */
FileAlreadyExistsException.prototype.getName = function() {
  return this.name;
};

/**
 * Get the exception message.
 * @return {string}
 */
FileAlreadyExistsException.prototype.getMessage = function() {
  return this.message;
};

/**
 * Get the printable message
 * @return {string}
 */
FileAlreadyExistsException.prototype.toString = function() {
  return this.name + ': ' + this.message;
};


/**
 * Create a new file/folder has been moved exception object.
 * @constructor
 */
FileHasBeenMovedException = 
    createError('FileHasBeenMovedException', Error);

/**
 * Get the exception's name.
 * @return {string}
 */
FileHasBeenMovedException.prototype.getName = function() {
  return this.name;
};

/**
 * Get the exception message.
 * @return {string}
 */
FileHasBeenMovedException.prototype.getMessage = function() {
  return this.message;
};

/**
 * Get the printable message
 * @return {string}
 */
FileHasBeenMovedException.prototype.toString = function() {
  return this.name + ': ' + this.message;
};


/**
 * Create a new Active Workbook Not Found Exception object.
 * @constructor
 */
ActiveWorkbookPathNotFoundException =
    createError('ActiveWorkbookPathNotFoundException', PromptException);

/**
 * Get the exception's name.
 * @return {string}
 */
ActiveWorkbookPathNotFoundException.prototype.getName = function() {
  return this.name;
};

/**
 * Get the exception message.
 * @return {string}
 */
ActiveWorkbookPathNotFoundException.prototype.getMessage = function() {
  return this.message;
};

/**
 * Get the printable message
 * @return {string}
 */
ActiveWorkbookPathNotFoundException.prototype.toString = function() {
  return this.name + ': ' + this.message;
};
