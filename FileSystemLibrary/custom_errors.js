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
