
Table of Contents
=================

   * [Table of Contents](#table-of-contents)
   * [Directory Manager Documentation](#directory-manager-documentation)
      * [VBA Directory API Brief Overview](#vba-directory-api-brief-overview)
      * [File Path Convention](#file-path-convention)
         * [Windows](#windows)
         * [macOS](#macos)
         * [Apps Script Implementation](#apps-script-implementation)
      * [API - CurDir()](#api---curdir)
         * [VBA CurDir Behavior and Usage](#vba-curdir-behavior-and-usage)
         * [AppScript CurDir Design](#appscript-curdir-design)
      * [API - ChDir()](#api---chdir)
         * [VBA ChDir Behavior and Usage](#vba-chdir-behavior-and-usage)
         * [AppScript ChDir Design](#appscript-chdir-design)
      * [API - ChDrive()](#api---chdrive)
         * [VBA ChDrive Behavior and Usage](#vba-chdrive-behavior-and-usage)
         * [AppScript ChDrive Design](#appscript-chdrive-design)
      * [API - Dir()](#api---dir)
         * [VBA Dir Behavior and Usage](#vba-dir-behavior-and-usage)
         * [AppScript Dir Design](#appscript-dir-design)
      * [API - Kill()](#api---kill)
         * [VBA Kill Behavior and Usage](#vba-kill-behavior-and-usage)
         * [AppScript Kill Implementation Design](#appscript-kill-implementation-design)
      * [API - FileLen()](#api---filelen)
         * [VBA FileLen Behavior and Usage](#vba-filelen-behavior-and-usage)
         * [AppScript FileLen Implementation Design](#appscript-filelen-implementation-design)
      * [API - FileDateTime()](#api---filedatetime)
         * [VBA FileDateTime Behavior and Usage](#vba-filedatetime-behavior-and-usage)
         * [AppScript FileDateTime Implementation Design](#appscript-filedatetime-implementation-design)
      * [API - MkDir()](#api---mkdir)
         * [VBA MkDir Behavior and Usage](#vba-mkdir-behavior-and-usage)
         * [AppScript MkDir Implementation Design](#appscript-mkdir-implementation-design)
      * [API - RmDir()](#api---rmdir)
         * [VBA RmDir Behavior and Usage](#vba-rmdir-behavior-and-usage)
         * [AppScript RmDir Implementation Design](#appscript-rmdir-implementation-design)


# Directory Manager Documentation

This module is responsible for managing the file-system state and also provides some low-level APIs for managing files. VBA has quite a few differences on macOS and Windows systems. VBA is not fully supported on macOS. Therefore, a lot of thought has gone into the design of this module. The design aims to provide maximum support for Windows VBA API usage. Some legacy features and deprecated API are not being implemented.

## VBA Directory API Brief Overview

1. `CurDir()` - Return current directory
1. `ChDir()` - Change working directory
1. `ChDrive()` - Change working drive
1. `Dir()` - File/Folder pattern matching
1. `Kill()` - Delete a file
1. `FileLen()` - Length of a file
1. `FileDateTime()` - Last modified time of a file
1. `name()` - File/Folder rename and move API
1. `MkDir()` - Create directory
1. `RmDir()` - Delete directory

## File Path Convention
The Apps Script implementation has to support both Unix and Windows file paths. We are giving priority to support Windows file formats.

### Windows 
File paths on Windows start with a drive letter followed by a colon. The file separator is a backward slash.

Naming rules for Windows - https://docs.microsoft.com/en-us/Windows/win32/fileio/naming-a-file

`C:\Users\Satvik\Desktop\Google`

### macOS 

File paths on macOS don't have a drive letter. The file separator is a forward slash.

Naming rules for Unix - https://www.cyberciti.biz/faq/linuxUnix-rules-for-naming-file-and-directory-names/ 

`/Users/Satvik/Desktop/Google`

VBA also supports legacy Macintosh file paths. Apple has deprecated this type of file paths.

`Macintosh HD:Users:Satvik:Desktop:Google`

**Important things to node:**

1. macOS allows any character in its file name.
1. Both mac and Windows file paths are case insensitive.
1. VBA considers but \ and / as valid file separators on Windows.

### Apps Script Implementation

> For the most part, the main differences between mac and Windows file paths are the drive letter and the file separators.

**Design:**
1. No legacy support for Macintosh file paths.
1. Full support for Windows file paths.
1. Support special characters which are valid on Windows file paths.
1. Partial support for macOS file paths. 
1. No support for special characters which are allowed on macOS but not Windows.
1. File paths are to be case insensitive. This is to be taken care of by the FileMapper.
1. Sanitize the file paths before sending to FileMapper
   * Remove trailing file separator (e.g. /users/ -> /users)
   * Replace file separators with the one expected by the FileSystem. For example, if user enters "folder1/something.txt" and the file system is Windows, it is to be converted to "folder\something.txt"


## API - `CurDir()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/curdir-function

### VBA CurDir Behavior and Usage

**VBA API Usage:** `CurDir [ (drive) ]`

Intuitively  the current directory `CurDir()` API should return the path of the Active Workbook. However, it appears that on Windows, the `CurDir()` needn't be the path of the active workbook. This [thread](https://stackoverflow.com/questions/41273872/excel-curdir-function-returns-a-wrong-directory) explains some details on this. The behavior of `CurDir()` is different on macOS. Moreover, the state of `CurDir()` persists across macro calls and seems to persist even across programs.

Most VBA programs seem to not use `CurDir()` directly. They either do one of the following things -

**Get absolute path using `ActiveWorkbook.Path`:**

`FileName = ActiveWorkbook.Path & "\myfile.xlsx`

> `ActiveWorkbook.path` is the parent directory of the current active workbook

**Or set the current working directory to `ActiveWorkbook.Path`:**

`ChDir (ActiveWorkbook.path)`

> Note: This usage indicates that developers are not using the functionality of `CurDir()` directly. And they are not using the persistence ability of the `CurDir()` API.

> `CurDir("D")` returns the current working directory on `D Drive`. The current working drive itself can be changed by `ChDrive("D")`.

### AppScript CurDir Design

**API:** `DirectoryManager.curDir(drive)`

**Returns:** Local file path of the current working directory (string)

1. CurrentDirectory is set to `ActiveWorkbook.path` in the beginning of each macro call. This behavior differs from Windows, but this has been decided as this is the most expected usage. 
1. Changes to CurrentDirectory do not persist across calls
1. If a Drive passed to `CurDir` is the same as the current working directory, then just return it. If the drive passed is different, then just return root directory. For example `CurDir("E")`, return `E:\`. A check should be made with the file mapper if the current directory is available. This will be ignored in the macOS file system.
1. Design decision has been taken to not support different drives as Google Drive doesn't have the concept of drives. So we only have a single working directory. 


## API - `ChDir()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/chdir-statement

### VBA ChDir Behavior and Usage

**VBA API Usage:** `ChDir path`

The api is used to change the current working directory. The path could either be absolute path or relative path to the current working directory. 

```
ChDir ("C:\Users\Satvik\Desktop\Google") ' Absolute Path
ChDir ("..\Documents") ' Relative Path
```

Each of the following are valid relative path - 

1. `childFolder`
1. `.\childFolder`
1. `..\siblingFolder`
1. `../siblingFolder`
1. `..\..\`
1. `../../`

VBA is flexible on the file separator. Each of the following paths are valid. 
1. `C:\Users`
1. `C:/Users`
1. `C:/Users\Desktop`

### AppScript ChDir Design

**API:** `DirectoryManager.changeDirectory(relativePath)`

1. Changes to CurrentDirectory will not persist across calls
1. Will not support legacy Macintosh path type: `ChDir "MacDrive:Tmp"`
1. Will support Windows style call type for both mac and Windows file paths
1. `changeDirectory("..")` will move up one directory on both mac and Windows.
1. File paths need to be sanitized according to the file system type. i.e. `C:/Users\Desktop` should be sanitized to `C:\Users\Desktop`. 
1. A check should be made with the file mapper if the new current directory exists.

## API - `ChDrive()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/chdrive-statement

### VBA ChDrive Behavior and Usage

**VBA API Usage:** `ChDrive drive`

This API is used to change the current working directory in the Drive System

### AppScript ChDrive Design

**API:** `DirectoryManager.changeDrive(drive)`

1. This function will be ignored in macOS filesystem
1. `changeDrive()` changes will not persist across calls because `CurDir()` do not persist across calls.
1. If the drive passed to `changeDrive` is the same as the current working directory, then don't do anything. If the drive passed is different, then just set current working directory to root directory. For example, `changeDrive("E")`, set current working directory to `E:\`
1. A check should be done with the file mapper that the new drive exists.

## API - `Dir()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/dir-function

### VBA Dir Behavior and Usage

**VBA API Usage:** `Dir [ (pathname, [ attributes ] ) ]`

The most common usage of `Dir` is to check if a file/folder exists. Another use case of `Dir` is to search for files based on a pattern using wildcards. For example `*.txt` or `Document-v?.docx`.

1. VBA doesn't allow wildcards in between the file path. i.e. `C:\Users\document?\something.txt` is not allowed.
1. Path can be absolute or relative - `C:\Users\*.txt` or `..\*.txt`
1. If no match is found, an empty string is returned.
1. Return value is just the file names that match the pattern. i.e. if search pattern is `C:\Users\*.txt` and `C:\Users\A.txt` is present. Return `A.txt`.
1. Dir() without a parameter works like a generator, returns the next available match. i.e. if search pattern is `C:\Users\*.txt` and `C:\Users\A.txt` and  `C:\Users\B.txt` are present. If `Dir("C:\Users\*.txt")` returns `A.txt`, then `Dir()` will return `B.txt`. After that, `Dir()` will return an empty string.

### AppScript Dir Design

**API:** `DirectoryManager.searchFiles(filePathPattern)`

**Return:** File name of the first file that is matched, Empty string if no file is matched.

1. A call is made to the FileMapper to find pattern matches.
1. The result array will be stored in the DirectoryManager object. 
1. Subsequent calls to `search()` API will behave like an iterator/generator
1. File names will be returned alphabetically

## API - `Kill()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/kill-statement

### VBA Kill Behavior and Usage

**VBA API Usage:** `Kill pathname`

This API deletes all files which match the pattern. Throws an error if the file that we are attempting to delete is open.

### AppScript Kill Implementation Design

App Script Implementation: `DirectoryManager.deleteFiles(filePathPattern)`

## API - `FileLen()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/filelen-function

### VBA FileLen Behavior and Usage

**VBA API Usage:** `FileLen pathname`

This API returns length of file in bytes.

### AppScript FileLen Implementation Design

App Script Implementation: `DirectoryManager.getFileLength(localPath)`

## API - `FileDateTime()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/filelen-function

### VBA FileDateTime Behavior and Usage

**VBA API Usage:** `FileDateTime pathname`

Returns file last modified time in the format "2/12/93 4:35:47 PM"

### AppScript FileDateTime Implementation Design

App Script Implementation: `DirectoryManager.getFileDateTime(localPath)`

## API - `MkDir()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/mkdir-statement

### VBA MkDir Behavior and Usage

**VBA API Usage:** `MkDir pathname`

Creates an empty directory at pathname

### AppScript MkDir Implementation Design

App Script Implementation: `DirectoryManager.createDirectory(localPath)`

## API - `RmDir()`

Official Documentation - https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/rmdir-statement

### VBA RmDir Behavior and Usage

**VBA API Usage:** `RmDir pathname`

Deletes an empty directory at pathname. If directory is not empty an error is thrown

### AppScript RmDir Implementation Design

App Script Implementation: `DirectoryManager.deleteDirectory(localPath)`

## @todo Document NAME API