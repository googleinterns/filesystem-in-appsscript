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
 * Create a new Mapping not found exception object.
 * @constructor
 */
MappingNotFoundException = function(message) {
  this.constructor.prototype.__proto__ = Error.prototype;
  this.name = 'MappingNotFoundException';
  this.message = message;
};

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
FileDoesNotExistException = function(message) {
  this.constructor.prototype.__proto__ = Error.prototype;
  this.name = 'FileDoesNotExistException';
  this.message = message;
};

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
FileAlreadyExistsException = function(message) {
  this.constructor.prototype.__proto__ = Error.prototype;
  this.name = 'FileAlreadyExistsException';
  this.message = message;
};

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
FileHasBeenMovedException = function(message) {
  this.constructor.prototype.__proto__ = Error.prototype;
  this.name = 'FileHasBeenMovedException';
  this.message = message;
};

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
 * Create a new Prompt Exception object.
 * @param {string} message Descriptive Error message
 * @constructor
 */
var PromptException = createError('PromptException', Error);

/**
 * Create a new Active Workbook Not Found Exception object.
 * @param {string} message Descriptive Error message
 * @constructor
 */
var ActiveWorkbookPathNotFoundException =
    createError('ActiveWorkbookPathNotFoundException', PromptException);

/**
 * Create a new Mapping Not Found Exception object.
 * @param {string} message Descriptive Error message
 * @constructor
 */
var MappingNotFoundException =
    createError('MappingNotFoundException', PromptException);
