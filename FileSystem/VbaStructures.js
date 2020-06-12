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
