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

//  ----------------------- Structures taken from library.gs --------------------------
VBAError = function (name, message) {
  this.constructor.prototype.__proto__ = Error.prototype;
  this.name = 'Converted VBA Error (' + name + ')';
  this.message = message + getErrorLocationString();
};
VBAError.prototype.getName = function () {
  return this.name;
};
VBAError.prototype.getMessage = function () {
  return this.message;
};
VBAError.prototype.toString = function () {
  return this.name + ': ' + this.message;
};

/**
 * Gets the line number of the caller's caller.
 * @return {string} Line number of the caller's caller
 */
function getErrorLocationString() {
  try {
    throw new Error();
  } catch (err) {
    // stack[1] -> getCallerLineNumber
    // stack[2] -> caller of function getCallerLineNumber, let's say a()
    // stack [3] -> caller of function a()
    var loc = err.stack.replace(/\t/g, ' ').split(' at ')[4];
    loc = loc ? loc.trim() : '';
    return ' [Error location: ' + loc + ']';
  }
}

/**
 * Object to create wrapper members for arguments passed by reference to
 * functions in VBA.
 * @param{!var} value Value to be assigned to the wrapper member.
 */
function VbaBox(value) {
  this.value = value;

  // A property to access the value of the object irrespective of whether it is
  // being set or accessed.
  Object.defineProperty(this, 'ReferenceValue', {
    value: value,
    writable: true,
  });
}

/**
 * Creates delegation of all methods / properties from a given Apps Script
 *     object.
 * @param {!Object} obj object to which properties / methods need to be added.
 * @param {!Object} baseObject Apps Script object to which method needs to be
 *     delegated to.
 * @param {!Array<string>} methodNames names of methods for which delegation need
 *     to be created.
 */
function addBaseMethodsFromAppsScriptObject(obj, baseObject, methodNames) {
  // For some reason adding the code same code that is present in the helper method
  // inside the loop doesn't work.
  for (var method = 0; method < methodNames.length; method++) {
    addBaseMethodFromAppsScriptObject(obj, baseObject, methodNames[method]);
  }
}

/**
 * Creates delegation of a single method / property from a given Apps Script
 *     object.
 * @param {!Object} obj object to which property / method need to be added.
 * @param {!Object} baseObject Apps Script object to which method needs to be
 *     delegated to.
 * @param {string} methodName names of method for which delegation need to be
 *     created.
 */
function addBaseMethodFromAppsScriptObject(obj, baseObject, methodName) {
  // Apps Script obects do not support enumerating over the methods / properties
  // using Object.getOwnProertyNames. It also does not allow calling methods
  // through another object so need to create encapsulating methods.
  obj[methodName] = function () {
    return baseObject[methodName].apply(baseObject, arguments);
  };
} // Time in milliseconds from 31/12/1899 to 1/1/1970, since VBA date object // starts from 1899 where javascript from 1970.

/**
 */ var vbaDateTimeDiff = new Date(1899, 11, 30).getTime();
/**
 * Create a VbaDate object.
 * @constructor
 * @param {!Date} dateValue date object for which wrapper needs to be created.
 * @return {!VbaDate}
 */
function VbaDate(dateValue) {
  this.date = dateValue;
  var dateMethods = [
    'getFullYear',
    'getMonth',
    'getDate',
    'getHours',
    'getMinutes',
    'getSeconds',
    'getMilliseconds',
    'getDay',
    'getYear',
    'setDate',
    'setFullYear',
    'setHours',
    'setMinutes',
    'setMilliseconds',
    'setMonth',
    'setSeconds',
    'setTime',
    'setYear',
  ];
  addBaseMethodsFromAppsScriptObject(this, this.date, dateMethods);
  /**
   * @return {!long} Time in milliseconds since 31/12/1899 like excel.
   */
  this.getTime = function () {
    return this.date.getTime() - vbaDateTimeDiff;
  };
  /**
   * @return {!long} The total number of days from 31/12/1899.
   */
  this.getTotalDays = function () {
    return this.getTime() / (24 * 60 * 60 * 1000);
  };
  /**
   * @return {string} formatted date value in current locale and timeZone.
   **/
  this.toString = function () {
    var totalDays = this.getTotalDays();
    if (1 < totalDays && totalDays < 2) {
      // This is time of Google sheet start date 31/12/1899, so return time
      // string alone
      return this.date.toLocaleTimeString();
    }
    return this.date.toLocaleDateString();
  };
  return this;
}

/**
 * Adds the new entry to collection.
 *
 * @param {!Collection} collection customized array in which the item to be
 *     added.
 * @param {?object} item value to be inserted into collection.
 * @param {string= } key optional key value.
 * @param {string | number=} before - item to be added is placed before this
 *     index.
 * @param {string | number=} after - item to be added is placed after this
 *     index.
 */
function addToCollection(collection, item, key, before, after) {
  if (collection == null) {
    collection = new Collection();
  }
  if (item == null) {
    ThrowGenericException('Collection.Add item should not be null.');
  }
  if (key && typeof key != 'string') {
    ThrowGenericException('Collection.Add Key must be string.');
  }
  if (before && after) {
    ThrowGenericException(
        'Collection.Add cannot define both before and after.');
  }
  if (key && collection.hasKey(key)) {
    ThrowGenericException(
        'Collection.Add Key is already associated with another element.');
  }
  var index = collection.length;
  if (before || after) {
    index = getCollectionIndex(collection, before || after);
    if (after) {
      index++;
    }
  }
  collection.addEntry(index, item, key);
}

/**
 * Helper function to create Iterator of the required type.
 * @param {!Object} object object for which iterator needs to be returned.
 * @return {!Object} iterator specific to the object or the object itself
 */
function ValueIterator(object) {
  if (isArray(object)) {
    return new ArrayValueIterator(object);
  }
  if (object instanceof IterableRangeList) {
    return new RangeListValueIterator(object);
  }
  if (object instanceof _vba_new_range_array) {
    return new VbaArrayValueIterator(object);
  }
  if (!object) {
    return new EmptyIterator();
  }
  return object;
}

/**
 * Iterator to iterate over value of an array.
 * @param {!Array} arr array to iterate over.
 */
function ArrayValueIterator(arr) {
  this.currentIndex = 0;
  this.getNext = function() {
    if (this.currentIndex < arr.length) {
      return arr[this.currentIndex++];
    } else {
      return new ValueIteratorEnd();
    }
  };
}

/**
 * Type to denote the end of iterator.
 */
var ValueIteratorEnd = function() {};

/**
 * Identifies whether the specified input is an array or array of cells (Range).
 *
 * @param {!Variant} input to be validated.
 * @return {boolean} true if the given input is an array.
 */
function isArray(input) {
  return Array.isArray(input) || input instanceof Array;
}

/**
 * Helper method to verify whether an object represents end of iterator or not.
 * @param {!Object} obj object to verify.
 * @return {boolean} whether the object represents end of iterator or not.
 */
function isValueIteratorEnd(obj) {
  return typeof obj == 'object' && obj instanceof ValueIteratorEnd;
}
//  ----------------------- New Structures to be added to library.gs ------------------

/**
 * Create a Tab Object
 * @constructor
 * @param {number} column Column Index
 */
function Tab(column) {
  this.column = column;
  if (!this.column) {
    this.column = 'NEXT_ZONE';
  }
  return this;
}

/**
 * Create a Space object
 * @constructor
 * @param {number} spaceCount Number of spaces to be printed
 */
function Space(count) {
  this.count = count;
  return this;
}

/**
 * Excel equivalent Folder Collection reference.
 * https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/folders-collection
 *
 * @return {Array} Excel Folder Collection equivalent customized array.
 */
VbaFolderCollection = function(parentFolder) {
  this.parentFolder = parentFolder;
  /**
   * Adds an entry into collection.
   *
   * @param {number} index collection index.
   * @param {object} item to be added.
   * @param {string=} key if the item is [k,v].
   */
  this.addEntry = function(index, item, key) {
    this.splice(index, 0, item);
  };
  return this;
};
VbaFolderCollection.prototype = new Array();

/**
 * Excel equivalent Folder Collection reference.
 * https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/files-collection
 *
 * @return {Array} Excel File Collection equivalent customized array.
 */
VbaFileCollection = function(parentFolder) {
  this.parentFolder = parentFolder;
  /**
   * Adds an entry into collection.
   *
   * @param {number} index collection index.
   * @param {object} item to be added.
   * @param {string=} key if the item is [k,v].
   */
  this.addEntry = function(index, item, key) {
    this.splice(index, 0, item);
  };
  return this;
};
VbaFileCollection.prototype = new Array();
