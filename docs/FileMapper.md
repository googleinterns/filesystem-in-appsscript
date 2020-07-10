# Table of Contents

- [Get File Id API](#get-file-id-api)
- [Get Folder Id API](#get-folder-id-api)
- [Create File API](#create-file-api)
- [Create Folder API](#create-folder-api)
- [File Exists API](#file-exists-api)
- [Folder Exists API](#folder-exists-api)
- [Delete File API](#delete-file-api)
- [Delete Folder API](#delete-folder-api)
- [Move File API](#move-file-api)
- [Move Folder API](#move-folder-api)
- [Copy File API](#copy-file-api)
- [Copy Folder API](#copy-folder-api)
- [Find Files By Pattern API](#find-files-by-pattern-api)
- [Find Folders By Pattern API](#find-folders-by-pattern-api)
- [Add File Mapping API](#add-file-mapping-api)
- [Add Folder Mapping API](#add-folder-mapping-api)


## Get File Id API

Intended to provide drive file id corresponding to the absolute local file path.

**Implementation:**  `getFileId(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/home/MyFile.txt" etc.

**Return Values:**
1. If the file mapping is found in the config : 
`FileId` - String
Returns a drive file id corresponding to the absolute local file path provided as parameter.

1. If the file mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > "**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a File to be Mapped to the `localPath`"
     
1. If the file at the local path provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    >" **FileDoesNotExistException :** File Mapped to the local path provided has been deleted."

1. If the file at the local path provided has been moved previously :
Throws a `FileHasBeenMovedException` :
    >" **FileHasBeenMovedException :** File Mapped to the local path provided has been moved to another location within the drive."


## Get Folder Id API

Intended to provide drive folder id corresponding to the absolute local folder path.

**Implementation:**  `getFolderId(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/home/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
`FolderId` - String
Returns a drive folder id corresponding to the absolute local folder path provided as parameter.

1. If the folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a Folder to be Mapped to the `localPath`
     
1. If the file at the local path provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    > **FileDoesNotExistException :** Folder Mapped to the local path provided has been deleted.

1. If the folder at the local path provided has been moved previously :
Throws a `FileHasBeenMovedException` :
    > **FileHasBeenMovedException :** Folder Mapped to the local path provided has been moved to another location within the drive.



## Create File API

Intended to create an empty drive file corresponding to the absolute local file path.

**Implementation:**  `createFile(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/home/MyFile.txt" etc.

**Return Values:**
1. If the new drive file is created : 
`FileId` - String
Returns a drive file id corresponding to the new drive file created mapped to the absolute local file path provided as parameter.

1. If the file destination mapping (mapping to any folder in it's path) is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a File to be Mapped to the `localPath`
     
1. If the file at the local path already exists :
Throws a `FileAlreadyExistsException` :
    > **FileAlreadyExistsException :** File Mapped to the local path provided already exists.


## Create Folder API

Intended to create an empty drive folder corresponding to the absolute local folder path.

**Implementation:**  `createFolder(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/home/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
`FolderId` - String
Returns a drive folder id corresponding to the absolute local folder path provided as parameter.

1. If the folder destination mapping (mapping to any folder in it's path) is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a Folder to be Mapped to the `localPath`
     
1. If the folder at the local path already exists :
Throws a `FileAlreadyExistsException` :
    > **FileAlreadyExistsException :** Folder Mapped to the local path provided already exists.


## File Exists API

Intended to check if the drive file corresponding to the absolute local file path exists or it has been deleted.

**Implementation:**  `hasFile(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/home/MyFile.txt" etc.

**Return Values:**
1. If the file mapping is found in the config : 
`FileExists` - Boolean
Returns a boolean value (true or false) to tell if the drive file corresponding to the absolute local file path provided as parameter exists or not.

1. If the file mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
 

## Folder Exists API

Intended to check if the drive folder corresponding to the absolute local folder path exists or it has been deleted.

**Implementation:**  `hasFolder(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/home/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
`FolderExists` - Boolean
Returns a boolean value (true or false) to tell if the drive folder corresponding to the absolute local path provided as parameter exists or not.

1. If the folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
  

## Delete File API

Intended to delete the drive file which is mapped to the absolute local file path.

**Implementation:**  `deleteFile(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/home/MyFile.txt" etc.

**Return Values:**
1. If the file mapping is found in the config : 
Returns a boolean value - `true` to tell that the drive file corresponding to the absolute local path provided as parameter has been deleted.

1. If the file mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
     
1. If the file at the local path provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    > **FileDoesNotExistException :** File Mapped to the local path provided has already been deleted.


## Delete Folder API

Intended to delete the drive folder which is mapped to the absolute local folder path.

**Implementation:**  `deleteFolder(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/home/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
Returns a boolean value - `true` to tell that the drive folder corresponding to the absolute local path provided as parameter has been deleted.

1. If the folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   >**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
     
1. If the file at the local path provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    > **FileDoesNotExistException :** Folder Mapped to the local path provided has already been deleted.


## Move File API

Intended to move a file from it's source location to a destination location.

**Implementation:**  `moveFile(sourceFilePath,targetFolderPath)`

**Parameters:**
1. `sourceFilePath` - String 
Absolute local file path in the Windows or Unix file system format of the file which is needed to be moved.
2. `targetFolderPath` -  String
 Absolute local folder path in the Windows or Unix file system format of the folder to which the files are needed to be moved to. 

**Return Values:**
1. If the file mapping is found in the config : 
Move the file to the target folder. Doesn't return anything.

1. If the target or source path mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
     
1. If the target folder or the source file provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    >" **FileDoesNotExistException :** Folder/File Mapped to the target path/ source path provided has been deleted.

## Move Folder API

Intended to move a folder from it's source location to a destination location.

**Implementation:**  `moveFolder(sourceFolderPath,targetFolderPath)`

**Parameters:**
1. `sourceFolderPath` - String 
Absolute local folder path in the Windows or Unix file system format of the folder which is needed to be moved.
2. `targetFolderPath` -  String
 Absolute local folder path in the Windows or Unix file system format of the folder to which the folders are needed to be moved to. 

**Return Values:**
1. If the folder mapping is found in the config : 
Move the folder to the target folder. Doesn't return anything.

1. If the target or source path mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
     
1. If the target folder or source folder provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    > **FileDoesNotExistException :** Folder Mapped to the target path or the source provided has been deleted.


## Copy File API

Intended to copy a file from it's source location to a destination location.

**Implementation:**  `copyFile(sourceFilePath,targetFolderPath)`

**Parameters:**
1. `sourceFilePath` - String 
Absolute local file path in the Windows or Unix file system format of the file which is needed to be copied.
2. `targetFolderPath` -  String
 Absolute local folder path in the Windows or Unix file system format of the folder to which the files are needed to be copied to. 

**Return Values:**
1. If the file mapping is found in the config : 
Copies the file to the target folder. Doesn't return anything.

1. If the target or source path mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
     
1. If the target folder or the source file provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    > **FileDoesNotExistException :** Folder/File Mapped to the target path/ source path provided has been deleted.


## Copy Folder API

Intended to copy a folder from it's source location to a destination location.

**Implementation:**  `copyFolder(sourceFolderPath,targetFolderPath)`

**Parameters:**
1. `sourceFolderPath` - String 
Absolute local folder path in the Windows or Unix file system format of the folder which is needed to be copied.
2. `targetFolderPath` -  String
 Absolute local folder path in the Windows or Unix file system format of the folder to which the folders are needed to be copied to. 

**Return Values:**
1. If the folder mapping is found in the config : 
Copies the folder to the target folder. Doesn't return anything.

1. If the target or source path mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`
     
1. If the target folder or the source folder provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    > **FileDoesNotExistException :** Folder Mapped to the target path or the source provided has been deleted.


## Find Files By Pattern API

Intended to provide all the file names which matches a specified pattern. It supports the use of multiple character (*) and single character (?) wildcards to specify multiple files.

**Implementation:**  `findFilesByPattern(pattern)`

**Parameters:**
`pattern` - String
Absolute local file path string expression in the Windows or Unix file system format.  eg, "C:\Desktop\*.txt", "/home/file?.txt" etc.

**Return Values:**
1. `matches` - String Array
Returns a string array representing the names of  files that matches the specified pattern.

1. If the base folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   >**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`

## Find Folders By Pattern API

Intended to provide all the folder names which matches a specified pattern. It supports the use of multiple character (*) and single character (?) wildcards to specify multiple folders.

**Implementation:**  `findFoldersByPattern(pattern)`

**Parameters:**
`pattern` - String
Absolute local folder path string expression in the Windows or Unix file system format.  eg, "C:\Desktop\*", "/home/Folder?" etc.

**Return Values:**
1. `matches` - String Array
Returns a string array representing the names of folders that matches the specified pattern.

1. If the base folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   >**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a mapping for the `localPath`

## Add File Mapping API
Intended to add a new file mapping to the config.

**Implementation:**  `addFileMapping(localPath, driveId)`

**Parameters:**
1. `localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/home/MyFile.txt" etc.
2. `driveId` - String
Drive file id to which the above local file path is to be mapped.

**Return Values:**
1.  If the file mapping is added successfully : 
Returns a number - `SUCCESS = 0`  to tell that the mapping has been added to the config successfully.
1. If the file mapping is not added successfully : 
Returns a number - `FAILURE`  to tell that the mapping has not been added to the config successfully due to any of the following reasons - 
  * `INVALID_ABSOLUTE_PATH = 1` the local path provided may not be absolute, 
  * `INVALID_DRIVE_ID = 2` the drive id provided may be invalid or 
  * `DUPLICATE_MAPPING = 3` the local path provided has a mapping already present in the config. 
  *  `INCOMPATIBLE_MIMETYPES = 4` the mimetype of of the local path and drive id provided do not match  

## Add Folder Mapping API
Intended to add a new folder mapping to the config.

**Implementation:**  `addFolderMapping(localPath, driveId)`

**Parameters:**
1. `localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/home/MyFolder" etc.
2. `driveId` - String
Drive folder id to which the above local folder path is to be mapped.

**Return Values:**
1.  If the folder mapping is added successfully : 
Returns a number - `SUCCESS = 0`  to tell that the mapping has been added to the config successfully.
1. If the folder mapping is not added successfully : 
Returns a number - `FAILURE`  to tell that the mapping has not been added to the config successfully due to any of the following reasons - 
  * `INVALID_ABSOLUTE_PATH = 1` the local path provided may not be absolute, 
  * `INVALID_DRIVE_ID = 2` the drive id provided may be invalid or 
  * `DUPLICATE_MAPPING = 3` the local path provided has a mapping already present in the config. 
  * `INCOMPATIBLE_MIMETYPES = 4` the mimetype of of the local path and drive id provided do not match  

