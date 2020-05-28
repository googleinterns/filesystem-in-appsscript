
var TestFramework = {
  testList: [],
}
  
TestFramework.prepareTest = function(test, description){
  return function() {
    try {
      test();
      Logger.log(`Pass: ${description}`);
      return true;
    }
    catch (err) {
      Logger.log(`Fail: ${description} with error message: ${err.message}`);
      return false;
    }
  }
}

TestFramework.test = function(description, testFn) {
  this.testList.push({
    description: description,
    test: this.prepareTest(testFn, description)
  });  
}


TestFramework.runTests = function() {
  
  Logger.log(`==== Starting Tests  ====`);
  for(var i = 0; i <  this.testList.length; i++) {
    var test = this.testList[i].test;
    var description = this.testList[i].description;
    Logger.log(`==== Start Test ${i + 1} \/ ${this.testList.length} -  ${description} ====`);
    test();
    Logger.log(`==== Finish Test ${i + 1} \/ ${this.testList.length} -  ${description} ====`);
  }
  Logger.log(`==== Finished ${this.testList.length} Tests  ====`);
}

TestFramework.assert = function(assertion, message) {
  if(assertion) {
    if(message)
       message = "Assertion passed: " + message;
    else 
      message = "Assertion passed"; 
    Logger.log(message);
    return;
  }
  
  if(message)
    message = "Assertion failed: " + message;
  else 
    message = "Assertion failed";
  
  throw Error(message);
}

TestFramework.reset = function() {
   this.tests = [];
}

