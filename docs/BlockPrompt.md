# Block Prompt

The project often needs to prompt user for information such as file system mapping. `HtmlService` and `UI Class` provides a simple way to prompt the user for the same. However, the prompts are not blocking in nature. That is we cannot do the following with `HtmlService` Dialog Prompts.

```
// Simple block prompt possible using UI class
var response = ui.alert('Some Message', ui.ButtonSet.YES_NO);

// HTML block prompt not possible
htmlOutput = HtmlService.createHtmlOutput();
var title = 'Some Prompt';
SpreadsheetApp.getUi().showModalDialog(htmlOutput, title);
```

## Main Issue

The call to `showModalDialog` is non blocking, so we cannot wait for the response from the user to continue execution. 

One way to handle this is to just throw an error and the overall execution should stop immediately. There can be no attempt at recovery. The user can be prompted to repeat the previous action after adding the mapping. While this might work just fine in some cases, it can lead to data corruption or data loss in others. Also this will not lead to a good user experience.

## Better solution

A better way to handle this is to emulate blocking of the prompt. Essentially after prompting the user for the file mapping, the Calling API should block itself using Utilities.sleep() API, for say some small amount of time (say 5-20 seconds). After the blocking is over, the API should check if the required resource (config file / session properties) is updated. If yes, then resume execution. If no, then it could try to go back to sleep and try again. This can happen 3-4 times for a span of 60-90 seconds. If it doesn’t find the mapping even after the time limit, it should just throw an error (Basically fall back to the previous method). 

## Design 
From the design perspective, each API will be wrapped with a wrapper function. Calls will be made to the wrapper function. The first time the wrapper function calls the target API, it will show a prompt asking for the resource. Then after a delay, the wrapper function will make a call to the target API again, however this time no prompt will be shown even if the resource is not found. After trying for a few times if it still doesn't succeed, the wrapper function will alert the user and throw an error. After this no attempt at recovery can be done and execution will stop.

## User Experience
In the positive scenario, where the user enters the required resource before the timeout limit, the experience is seamless. The user may experience an overall delay of 5-20 seconds depending on our delay interval but that is an acceptable trade off. It should be noted that the user will only be prompted once. 

## Implementation Design 

Each API which may need to prompt the user for information should have a flag variable `showPrompt`. If the resource is not found and `showPrompt` is `true`, it should show the prompt and throw an error. If the resource is not found and `showPrompt` is `false`, it should then just throw an error. 

Example:
```
// Show prompt only if showPrompt is true
// Should throw error if resource is not present irrespective of showPrompt
getFileIdHelper(filePath, showPrompt); 
``` 

The function decorator - This decorator can now convert any non blocking function as above to a blocking function

```
/**
 * Decorate function to make it blocking
 * Emulate blocking behavior by manually blocking the execution by using
 * utilities.sleep, If the mapping is not found, the function will try 15 times
 * with 5 seconds interval between attempts. If the mapping is still not found,
 * error will be thrown.
 * @param {function} func Function that needs to be blocking
 * @return {function} Decorated blocking function
 */
function blockFunctionDecorator(func) {
  return function() {
    try {
      var args = Array.prototype.slice.call(arguments);
      args.push(true);  // Show prompt once
      return func.apply(this, args);
    } catch (e) {
      if (e instanceof ShowPromptException) {
        var args = Array.prototype.slice.call(arguments);
        args.push(false);  // Show prompt once
        for (var i = 0; i < 5; i++) {
          try {
            Utilities.sleep(5 * 1000);
            return func.apply(this, args);
          } catch (e) {
            if(!(e instanceof ShowPromptException)) {
                throw e;
            }
          }
        }
      }
      throw e;
    }
  };
}
```

We can create a block function easily using the decorator:

```
// Get blocking decorator function
getFileId = blockFunctionDecorator(getFileIdHelper)
```

An important thing to note is that the decorated function has the expected signature as follows: 

```
getFileId(filePath); 
```

With this any API can be converted into a blocking API. If we want to disable blocking in the future, we can create a dummy decorator function as follows:

```
function dummyDecorator(func) {
  return function() {
      var args = Array.prototype.slice.call(arguments);
      args.push(true);  // Show prompt once
      return func.apply(this, args);
  };
}
```