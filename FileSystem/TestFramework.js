/**
 * Custom Test Framework
 * This is a custom test framework made to run simple test cases.
 * This supports basic assertions and logs a well formatted report.
 * @todo Better Error Reporting
 */
var TestFramework = {
  testList: [],
};

/**
 * Test Function Decorator
 * prepareTest decorates the function with  a try/catch block and
 * adds logging functionality.
 * @param {function} test Test function
 * @param {string} description Test description
 * @return {function} Decorated test function with try/catch block and logging
 */
TestFramework.prepareTest = function (test, description) {
  return function () {
    try {
      test();
      Logger.log('Pass: ' + description);
      return true;
    } catch (err) {
      Logger.log(
        'Fail: ' + description + ' with error message: ' + err.message
      );
      return false;
    }
  };
};

/**
 * Test register
 * Prepares the test function and adds the test to the test list
 * @param {string} description Test description
 * @param {function} testFn Test Function
 */
TestFramework.test = function (description, testFn) {
  this.testList.push({
    description: description,
    test: this.prepareTest(testFn, description),
  });
};

/**
 * Test Runner
 * Runs all the registered tests and logs the results
 */
TestFramework.runTests = function () {
  Logger.log(' ==== Starting Tests ====');
  for (var i = 0; i < this.testList.length; i++) {
    var test = this.testList[i].test;
    var description = this.testList[i].description;
    Logger.log(
      '==== Start Test ' +
        (i + 1) +
        ' / ' +
        this.testList.length +
        ' - ' +
        description +
        '===='
    );
    test();
    Logger.log(
      '==== Finish Test ' +
        (i + 1) +
        ' / ' +
        this.testList.length +
        ' - ' +
        description +
        '===='
    );
  }
  Logger.log('==== Finished ' + this.testList.length + ' Tests  ====');
};

/**
 * Basic Assertion Test
 * @param {boolean} assertion Assertion Test
 * @param {string} message Assertion message
 */
TestFramework.assert = function (assertion, message) {
  if (assertion) {
    if (message) {
      message = 'Assertion passed: ' + message;
    } else {
      message = 'Assertion passed';
    }
    Logger.log(message);
    return;
  }

  if (message) {
    message = 'Assertion failed: ' + message;
  } else {
    message = 'Assertion failed';
  }

  throw new Error(message);
};

/**
 * TestFramework Reset
 * Unregisters all registered tests
 */
TestFramework.reset = function () {
  this.testList = [];
};
