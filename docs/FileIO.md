# Table of Contents

- [Table of Contents](#table-of-contents)
- [FileIO Module Documentation](#fileio-module-documentation)
- [VBA API Brief Overview](#vba-api-brief-overview)
- [Apps Script FileIO Implementation](#apps-script-fileio-implementation)
  - [Open/Close Design and API](#openclose-design-and-api)
    - [Open API](#open-api)
    - [Close API](#close-api)
    - [App Script Implementation Design](#app-script-implementation-design)
  - [Print API](#print-api)
  - [Line Input API](#line-input-api)
  - [Write API](#write-api)
  - [Input API](#input-api)
- [Deferred Work](#deferred-work)

# FileIO Module Documentation

This module primarily deals with VBA file io api. Broadly speaking, VBA supports the following types of files.

1. Delimited Data (CSV Type)
1. Regular text file
1. Record files / Binary Data

AppScript doesn't natively provide any support for the required file handling directly. Therefore this FileIO module is required.

# VBA API Brief Overview

Files are opened in VBA by using the `open` statement and assigning a file number. File are then closed with the `close` statement. The following APIs are then used to read/write to the file.

**Write API:**

1. `print` (text files) - Print variable list
1. `write` (CSV type files) - Print variable list with delimiter
1. `put` (record and binary files) (not implemented)

**Read API:**

1. `line input` (text files) - Read line by line
1. `input` (CSV type files) - Read variable by variable
1. `get` (record and binary files) (not implemented)

**Note:**

- Files written by `print` statement are to be read by `line input` statement.
- Files written by `write` statement are to be read by `input` statement.
- Files writteb by `put` statement are to be read by `get` statement.

Other APIs include:

1. `open` - Open a file
1. `close` - Close a file
1. `freefile` - Gets a free file number
1. `eof` - Returns true if end of file reached
1. `seek` - Sets the file pointer location
1. `loc` - Gets the file pointer location
1. `lof` - Return length of file

# Apps Script FileIO Implementation

Except `Get` and `Put`, all APIs are implemented and tested. Some of the functionality has been dropped or deferred due to lack of AppScript support for the same. However, the primary functionality requirement is met.

## Open/Close Design and API

### Open API

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/open-statement

**VBA API Usage:**

`Open pathname For mode [ Access access ] [ lock ] As [ # ] filenumber [ Len = reclength ]`

**App Script Implementation:** `FileIO.openFile(path, fileNumber, openMode, accessMode, lockMode)`

| VBA Argument | VBA Description                                                                                                                                                                                    | Implemented | Comment                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| pathname     | Required. String expression that specifies a file name; may include directory or folder, and drive.                                                                                                | Yes         |                                                                                                   |
| mode         | Required. Keyword specifying the file mode: Append, Binary, Input, Output, or Random. If unspecified, the file is opened for Random access.                                                        | Partial     | Binary is partially implemented                                                                   |
| access       | Optional. Keyword specifying the operations permitted on the open file: Read, Write, or Read Write.                                                                                                | Yes         | Application level implementation                                                                  |
| lock         | Optional. Keyword specifying the operations restricted on the open file by other processes: Shared, Lock Read, Lock Write, and Lock Read Write.                                                    | No          | Application level implementation is possible by a combination of LockService and PropertyService. |
| filenumber   | Required. A valid file number in the range 1 to 511, inclusive. Use the FreeFile function to obtain the next available file number.                                                                | Yes         |                                                                                                   |
| reclength    | Optional. Number less than or equal to 32,767 (bytes). For files opened for random access, this value is the record length. For sequential files, this value is the number of characters buffered. | No          | Required by Get and Put API                                                                       |

> API implemented completely. More work may be required to handle binary files.

### Close API

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/close-statement

**VBA API Usage:**

`Close [ filenumberlist ]`

**App Script Implementation:** `FileIO.closeFileList(filenumberlist)`

| VBA Argument | VBA Description                                                                                                                                                                  | Implemented | Comment                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------- |
| filenumber   | If you omit filenumberlist, all active files opened by the Open statement are closed. When the Close statement is executed, the association of a file with its file number ends. | Yes         | Binary Close may require some additional work |

> API implemented completely. More work may be required to handle binary files.

### App Script Implementation Design

AppScript DriveApp And Drive do not provide low level file handling API. Therefore the only way to achieve FileIO is in memory. The following structure is the in memory representation of an open file.

```
//In memory file object
  var file = {
    fileId: <string>,
    filePath: <string>,
    accessMode: <AccessMode>,
    openMode: <OpenMode>,
    lockMode: <LockMode>,
    content: <string>,
    pointer: <number>
  };
```

The key things to notice is the content and the pointer attribute. Content attribute is the in memory file content. Pointer is the file index at which the data is next read and written to.

These structures are found in `FileIO.openFiles` where key is the file number and the value is the file object. All the APIs reference the file by file number. The filenumber is roughly equivalent to the file descriptor in Unix systems.

When open is called, the file is read and loaded into the in memory object. When close is called, the file content is flushed to Drive.

## Print API

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/printstatement

**VBA API Usage:**

`Print #filenumber, [ outputlist ]`

**App Script Implementation:** `FileIO.printToFile(fileNumber, outputList)`

| VBA Argument | VBA Description                                       | Implemented |
| ------------ | ----------------------------------------------------- | ----------- |
| filenumber   | Required. Any valid file number.                      | Yes         |
| outputlist   | Optional. Expression or list of expressions to print. | Yes         |

Output list can be of any of the following types. All types are implemented.

| Setting    | Description                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spc(n)     | Used to insert space characters in the output, where n is the number of space characters to insert.                                                                                                                                                                                                                                                                                                     |
| Tab(n)     | Used to position the insertion point to an absolute column number, where n is the column number. Use Tab with no argument to position the insertion point at the beginning of the next print zone.                                                                                                                                                                                                      |
| expression | Numeric expressions or string expressions to print.                                                                                                                                                                                                                                                                                                                                                     |
| charpos    | Specifies the insertion point for the next character. Use a semicolon to position the insertion point immediately after the last character displayed. Use Tab(n) to position the insertion point to an absolute column number. Use Tab with no argument to position the insertion point at the beginning of the next print zone. If charpos is omitted, the next character is printed on the next line. |

> API implemented completely. More work may be required to handle datetime variants.

## Line Input API

Reads file by line by line

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/line-inputstatement

**VBA API Usage:**

`Line Input #filenumber, varname`

**App Script Implementation:** `FileIO.lineInputFile(fileNumber, variable)`

| VBA Argument | VBA Description                                  | Implemented |
| ------------ | ------------------------------------------------ | ----------- |
| filenumber   | Required. Any valid file number.                 | Yes         |
| varname      | Required. Valid Variant or String variable name. | Yes         |

> API Implemented comepletely

## Write API

Similar to print but adds delimiter

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/writestatement

**VBA API Usage:**

`Write #filenumber, [ outputlist ]`

**App Script Implementation:** `FileIO.writeToFile(fileNumber, outputList)`

> API implemented completely. More work may be required to handle datetime variants.

## Input API

Intended to read files written by write API.

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/inputstatement

**VBA API Usage:**

`Input #filenumber, varlist`

**App Script Implementation:** `FileIO.inputFile(fileNumber, inputList)`

| VBA Argument | VBA Description                                                                                                                                                                                                         | Implemented |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| filenumber   | Required. Any valid file number.                                                                                                                                                                                        | Yes         |
| varlist      | Required. Comma-delimited list of variables that are assigned values read from the file—can't be an array or object variable. However, variables that describe an element of an array or user-defined type may be used. | Yes         |

> API implemented completely

# Deferred Work

Major requirement for FileIO has been implemented. The following are the features/api yet to be implemented.

1. Binary file handling in open/close API
1. File Locking in open/close API
1. Handle DateTime variants in Write/Print API
1. Get and Put API - Record/Binary files
