# File System Module

The filesystem module implements all classes and APIs related to the `FileSystemObject`. The `FileSystemObject` is actually a library to access the windows file system, therefore it is only available on Windows. The `FileSystemObject` is initialized in Windows as follows:

```
Set fs = CreateObject("Scripting.FileSystemObject")
```

The related class objects are `File`, `Folder`, `File Collection`, `Folder Collection`, `TextStream` and `Drive`. Design decision was taken to not support multiple drives, therefore `Drive` class is not implemented. Instances of related objects are obtained from APIs of the `FileSystemObject`.

The APIs provide the following functionality:
1. Traverse file system hierarchy - search, move up, iterate over files or folders
1. Operations like creating, deleting, copying and moving of files and folders.
1. High level File IO (TextStream)

| VBA Class | Apps Script Class | Comment |
|-|-|-|
| FileSystemObject | FileSystem | Base Library for all File System APIs |
| File | VbaFile | Instance object representing a file |
| Folder | VbaFolder | Instance object representing a folder |
| FileCollection | VbaFileCollection | Instance object representing a set of files |
| FolderCollection | VbaFolderCollection | Instance object representing a set of folders |
| TextStream | VbaTextStream | Instance object representing an open file |

## Official Documentation

* **FileSystemObject:** https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/filesystemobject-object
* **File:** https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/file-object
* **File Collection:** https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/files-collection
* **Folder:** https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/folder-object
* **Folder Collection:** https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/folders-collection
* **TextStream:** https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/textstream-object

## Implementation Summary
The main APIs are implemented. A few APIs that are deprecated by Microsoft or APIs which for legacy reasons are not implemented. 

### FileSystem Class

The name of each API is the same in the library. E.g. `FileSystemObject.BuildPath` is `FileSystem.buildPath`. Total of 22 APIs are implemented.

| Method | Description | Implemented | Comment |
|-|-|-|-|
| BuildPath | Appends a name to an existing path. | Yes | Complete Compliance |
| CopyFile | Copies one or more files from one location to another. | Yes | Complete Compliance |
| CopyFolder | Copies one or more folders from one location to another. | Yes | Complete Compliance |
| CreateFolder | Creates a new folder. | Yes | Complete Compliance |
| CreateTextFile | Creates a text file and returns a TextStream object that can be used to read from, or write to the file. | Yes | Partial Compliace, no support for unicode |
| DeleteFile | Deletes one or more specified files. | Yes | Partial Compliace, no support for read only files |
| DeleteFolder | Deletes one or more specified folders. | Yes | Partial Compliace, no support for read only folders |
| DriveExists | Checks if a specified drive exists. | No | No support planned for Drive APIs |
| FileExists | Checks if a specified file exists. | Yes | Complete Compliance |
| FolderExists | Checks if a specified folder exists. | Yes | Complete Compliance |
| GetAbsolutePathName | Returns the complete path from the root of the drive for the specified path. | Yes | Partial Compliance, no support for relative file path type 2 |
| GetBaseName | Returns the base name of a specified file or folder. | Yes | Complete Compliance |
| GetDrive | Returns a Drive object corresponding to the drive in a specified path. | No | No support planned for Drive APIs |
| GetDriveName | Returns the drive name of a specified path. | Yes | Complete Compliance |
| GetExtensionName | Returns the file extension name for the last component in a specified path. | Yes | Complete Compliance |
| GetFile | Returns a File object for a specified path. | Yes | Complete Compliance |
| GetFileName | Returns the file name or folder name for the last component in a specified path. | Yes | Complete Compliance |
| GetFolder | Returns a Folder object for a specified path. | Yes | Complete Compliance |
| GetParentFolderName | Returns the name of the parent folder of the last component in a specified path. | Yes | Complete Compliance |
| GetSpecialFolder | Returns the path to some of Windows' special folders. | No | Windows specific file system, cannot support |
| GetTempName | Returns a randomly generated temporary file or folder. | Yes | Complete Compliance |
| Move | Moves a specified file or folder from one location to another. | Yes | Complete Compliance |
| MoveFile | Moves one or more files from one location to another. | Yes | Complete Compliance |
| MoveFolder | Moves one or more folders from one location to another. | Yes | Complete Compliance |
| OpenAsTextStream | Opens a specified file and returns a TextStream object that can be used to read from, write to, or append to the file. | Yes | Complete Compliance |

### VbaFile Class

The name of each API is the same in the library. E.g. `File.Copy` is `VbaFile.copy`. `FileSystem.getFile()` and `VbaFolder.getFiles()` return instances of `VbaFile`. Total of 14 APIs are implemented.

| Method | Description | Implemented | Comment |
|-|-|-|-|
| Copy | Copies a specified file from one location to another. | Yes | Complete Compliance |
| Delete | Deletes a specified file. | Yes | Complete Compliance |
| Move | Moves a specified file from one location to another. | Yes | Complete Compliance |
| OpenAsTextStream | Opens a specified file and returns a TextStream object to access the file. | Yes | Complete Compliance |
| Attributes | Sets or returns the attributes of a specified file. | Yes | Complete Compliance |
| DateCreated | Returns the date and time when a specified file was created. | Yes | Complete Compliance |
| DateLastAccessed | Returns the date and time when a specified file was last accessed. | Yes | Complete Compliance |
| DateLastModified | Returns the date and time when a specified file was last modified. | Yes | Complete Compliance |
| Drive | Returns the drive letter of the drive where a specified file or folder resides. | Yes | Complete Compliance |
| Name | Sets or returns the name of a specified file. | Yes | Complete Compliance |
| ParentFolder | Returns the folder object for the parent of the specified file. | Yes | Complete Compliance |
| Path | Returns the path for a specified file. | Yes | Complete Compliance |
| ShortName | Returns the short name of a specified file (the 8.3 naming convention). | No | Legacy Feature |
| ShortPath | Returns the short path of a specified file (the 8.3 naming convention). | No | Legacy Feature |
| Size | Returns the size, in bytes, of a specified file. | Yes | Complete Compliance |
| Type | Returns the type of a specified file. | Yes | Complete Compliance |


### VbaFolder Class

The name of each API is the same in the library. E.g. `Folder.Copy` is `VbaFolder.copy`. `FileSystem.getFolder()` and `VbaFolder.getSubFolders()` return instances of `VbaFolder`. Total of 18 APIs are implemented.

| Method | Description | Implemented | Comment |
|-|-|-|-|
| AddFolders | Adds a new Folder to a Folders collection. | Yes | Complete Compliance |
| Copy | Copies a specified folder from one location to another. | Yes | Complete Compliance |
| CreateTextFile | Creates a new text file in the specified folder and returns a TextStream object to access the file. | Yes | Complete Compliance |
| Delete | Deletes a specified folder. | Yes | Complete Compliance |
| Move | Moves a specified folder from one location to another. | Yes | Complete Compliance |
| ibutes | Sets or returns the attributes of a specified folder. | Yes | Complete Compliance |
| DateCreated | Returns the date and time when a specified folder was created. | Yes | Complete Compliance |
| DateLastAccessed | Returns the date and time when a specified folder was last accessed. | Yes | Complete Compliance |
| DateLastModified | Returns the date and time when a specified folder was last modified. | Yes | Complete Compliance |
| Drive | Returns the drive letter of the drive where the specified folder resides. | Yes | Complete Compliance |
| Files | Returns a Files collection consisting of all File objects contained in the specified folder, including those with hidden and system file attributes set. | Yes | Complete Compliance |
| IsRootFolder | Returns True if a folder is the root folder and False if not. | Yes | Complete Compliance |
| Name | Sets or returns the name of a specified folder. | Yes | Complete Compliance |
| ParentFolder | Returns the parent folder of a specified folder. | Yes | Complete Compliance |
| Path | Returns the path for a specified folder. | Yes | Complete Compliance |
| ShortName | Returns the short name of a specified folder (the 8.3 naming convention). | No | Legacy Feature |
| ShortPath | Returns the short path of a specified folder (the 8.3 naming convention). | No | Legacy Feature |
| Size | Returns the size of a specified folder. | Yes | Complete Compliance |
| SubFolders | Returns a Folders collection consisting of all folders contained in a specified folder, including those with Hidden and System file attributes set. | Yes | Complete Compliance |
| Type | Returns the type of a specified folder. | Yes | Complete Compliance |


### VbaTextStream Class

`FileSystem.openTextStream()`, `FileSystem.createTextFile()` and `VbaFile.openAsTextStream()` return instances of `VbaTextStream`. Total of 13 APIs are implemented.

| Close | Closes an open TextStream file. | Yes | Complete Compliance |
|-|-|-|-|
| Read | Reads a specified number of characters from a TextStream file and returns the result. | Yes | Complete Compliance |
| ReadAll | Reads an entire TextStream file and returns the result. | Yes | Complete Compliance |
| ReadLine | Reads one line from a TextStream file and returns the result. | Yes | Complete Compliance |
| Skip | Skips a specified number of characters when reading a TextStream file. | Yes | Complete Compliance |
| SkipLine | Skips the next line when reading a TextStream file. | Yes | Complete Compliance |
| Write | Writes a specified text to a TextStream file. | Yes | Complete Compliance |
| WriteBlankLines | Writes a specified number of new-line characters to a TextStream file. | Yes | Complete Compliance |
| WriteLine | Writes a specified text and a new-line character to a TextStream file. | Yes | Complete Compliance |
| AtEndOfLine | Returns true if the file pointer is positioned immediately before the end-of-line marker in a TextStream file, and false if not. | Yes | Complete Compliance |
| AtEndOfStream | Returns true if the file pointer is at the end of a TextStream file, and false if not. | Yes | Complete Compliance |
| Column | Returns the column number of the current character position in an input stream. | Yes | Complete Compliance |
| Line | Returns the current line number in a TextStream file. | Yes | Complete Compliance |

## Implementation Design
While each API has different behavior, many of them have similar functionality with slightly different behavior. The `FileSystem` module has APIs which share functionality with `DirectoryManager` and `FileIO` modules. Efforts have been taken to reuse code as much as possible across the different modules while ensuring specification compliance. 

### Helper functions and ApiUtil Class
Across the file system module, APIs for copy, move, delete were available in every class for both files and folders. The implementation logic and design for copy and move was similar. Similarly the implementation difference between files and folders was mostly the different API calls. In order to make design, implementation and testing easier, generic helper functions was created.

One such API is the `cloneEntity` API which can emulate copy and move for both files and folders. 

```
/**
 * Helper function to copy or move files and to copy or move folders. Optionally
 * overwrite existing files or folders if existing. File entities can be
 * optionally specified by a wild card pattern in the last component of the
 * sourcePath. If destinationPath has a trailing file separator, then
 * destinationPath is the destination folder. If sourcePath contains wild
 * card characters, then destinationPath is the destination folder. Otherwise,
 * destinationPath is the final entity name. Function throws an error if entity
 * already exists and overwrite is false. Function throws an error if an entity
 * exists and the entity type is different. Function throws an error if
 * sourcePath does not match any entities.
 * @param {string} sourcePath File or folder pattern of the entity to be moved or copied
 * @param {boolean} overwrite Flag indicating to overwrite existing entity if exists
 * @param {boolean} deleteSource Flag indicating to delete original entity. True
 *     emulates move behavior, false emulates copy behavior.
 * @param {boolean} isFile Flag indicating whether entity is a file
 */
function cloneEntity(sourcePath, destinationPath, overwrite, deleteSource, isFile)
```

This was possible because of `ApiUtil` class which generates an object according to the type. This design is based on abstract factory pattern.

```

/**
 * Drive App and FileMapper expose different APIs for file and folder
 * operations. However, the APIs have similar interfaces and functionality. In
 * order to achieve reuse in code, ApiUtil is a helper class which returns File
 * or Folder library object for both DriveApp and FileMapper classes. Abstract
 * Factory Pattern has been used here.
 */
ApiUtil = {
    /**
    * Helper function to get File or Folder FileMapper library object
    * @param {boolean} isFile Flag indicating if the required library is for file entity
    * @return {object} Library object for FileMapper
    */
    getFileMapper(isFile)
    /**
    * Helper function to get File or Folder DriveApp library object
    * @param {boolean} isFile Flag indicating if the required library is for file entity
    * @return {object} Library object for DriveApp
    */
    getDriveApi(isFile)
};
```

The factory can be used as follows to generate the required object.

```
var fileMapperApi = ApiUtil.getFileMapper(true); // If we are working with files
var driveApi = ApiUtil.getDriveApi(false); // If we are working with folders
```

The API interface of `FileMapper` and `DriveApi` are as follows:

```
FileMapperApi = {
    hasEntity(localPath)
    getEntityId(localPath)
    deleteEntity(localPath)
    copyEntity(localPath, target)
    moveEntity(localPath, target)
    findByPattern(pattern)
};

DriveAppFileApi = {
    getEntityById(id)
    makeCopy(source, name, target)
    makeMove(source, name, target)
};
```
