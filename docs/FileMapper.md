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
- [Get Pattern Matches API](#get-pattern-matches-api)


## Get File Id API

Intended to provide drive file id corresponding to the absolute local file path.

**Implementation:**  `getFileId(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/Downloads/MyFile.txt" etc.

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


## Get Folder Id API

Intended to provide drive folder id corresponding to the absolute local folder path.

**Implementation:**  `getFolderId(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/Downloads/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
`FolderId` - String
Returns a drive folder id corresponding to the absolute local folder path provided as parameter.

1. If the folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a Folder to be Mapped to the `localPath`
     
1. If the file at the local path provided has been deleted previously :
Throws a `FolderDoesNotExistException` :
    > **FolderDoesNotExistException :** Folder Mapped to the local path provided has been deleted.


## Create File API

Intended to create an empty drive file corresponding to the absolute local file path.

**Implementation:**  `createFile(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/Downloads/MyFile.txt" etc.

**Return Values:**
1. If the new drive file is created : 
`FileId` - String
Returns a drive file id corresponding to the new drive file created mapped to the absolute local file path provided as parameter.

1. If the file destination mapping (mapping to any folder in it's path) is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > "**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a File to be Mapped to the `localPath`"
     
1. If the file at the local path already exists :
Throws a `FileAlreadyExistsException` :
    >" **FileAlreadyExistsException :** File Mapped to the local path provided already exists."


## Create Folder API

Intended to create an empty drive folder corresponding to the absolute local folder path.

**Implementation:**  `createFolder(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/Downloads/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
`FolderId` - String
Returns a drive folder id corresponding to the absolute local folder path provided as parameter.

1. If the folder destination mapping (mapping to any folder in it's path) is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a Folder to be Mapped to the `localPath`
     
1. If the folder at the local path already exists :
Throws a `FolderAlreadyExistsException` :
    >" **FolderAlreadyExistsException :** Folder Mapped to the local path provided already exists."


## File Exists API

Intended to check if the drive file corresponding to the absolute local file path exists or it has been deleted.

**Implementation:**  `hasFile(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/Downloads/MyFile.txt" etc.

**Return Values:**
1. If the file mapping is found in the config : 
`FileExists` - Boolean
Returns a boolean value (true or false) to tell if the drive file corresponding to the absolute local file path provided as parameter exists or not.

1. If the file mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > "**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a File to be Mapped to the `localPath`"
 

## Folder Exists API

Intended to check if the drive folder corresponding to the absolute local folder path exists or it has been deleted.

**Implementation:**  `hasFolder(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/Downloads/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
`FolderExists` - Boolean
Returns a boolean value (true or false) to tell if the drive folder corresponding to the absolute local path provided as parameter exists or not.

1. If the folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a Folder to be Mapped to the `localPath`
  

## Delete File API

Intended to delete the drive file which is mapped to the absolute local file path.

**Implementation:**  `deleteFile(localPath)`

**Parameters:**
`localPath` - String
Absolute local file path in the Windows or Unix file system format. eg, "C:\Desktop\MyFile.txt", "/Downloads/MyFile.txt" etc.

**Return Values:**
1. If the file mapping is found in the config : 
Returns a boolean value - `true` to tell that the drive file corresponding to the absolute local path provided as parameter has been deleted.

1. If the file mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > "**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a File to be Mapped to the `localPath`"
     
1. If the file at the local path provided has been deleted previously :
Throws a `FileDoesNotExistException` :
    >" **FileDoesNotExistException :** File Mapped to the local path provided has already been deleted."


## Delete Folder API

Intended to delete the drive folder which is mapped to the absolute local folder path.

**Implementation:**  `deleteFolder(localPath)`

**Parameters:**
`localPath` - String
Absolute local folder path in the Windows or Unix file system format. eg, "C:\Desktop\MyFolder, "/Downloads/MyFolder" etc.

**Return Values:**
1. If the folder mapping is found in the config : 
Returns a boolean value - `true` to tell that the drive folder corresponding to the absolute local path provided as parameter has been deleted.

1. If the folder mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > **MappingNotFoundException** : Mapping for the local path provided is not found. Provide a Folder to be Mapped to the `localPath`
     
1. If the file at the local path provided has been deleted previously :
Throws a `FolderDoesNotExistException` :
    > **FolderDoesNotExistException :** Folder Mapped to the local path provided has already been deleted.


## Move File API

Intended to move a file from it's source location to a destination location.

**Implementation:**  `moveFile(sourceFilePaths,targetFolderPath)`

**Parameters:**
1. `sourceFilePaths` - String Array
An array of Absolute local file paths in the Windows or Unix file system format of the files which are needed to be moved.
2. `targetFolderPath` -  String
 Absolute local folder path in the Windows or Unix file system format of the folder to which the files are needed to be moved to. 

**Return Values:**
1. If the file mapping is found in the config : 
Moves all the files to the target folder. Doesn't return anything.

1. If the target or source path mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > "**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a File to be Mapped to the local path"
     
1. If the target folder provided has been deleted previously :
Throws a `TargetFolderDoesNotExistException` :
    >" **TargetFolderDoesNotExistException :** Folder Mapped to the target path provided has been deleted."


## Move Folder API

Intended to move a folder from it's source location to a destination location.

**Implementation:**  `moveFolder(sourceFolderPaths,targetFolderPath)`

**Parameters:**
1. `sourceFolderPaths` - String Array
An array of Absolute local folder paths in the Windows or Unix file system format of the files which are needed to be moved.
2. `targetFolderPath` -  String
 Absolute local folder path in the Windows or Unix file system format of the folder to which the folders are needed to be moved to. 

**Return Values:**
1. If the folder mapping is found in the config : 
Moves all the folders to the target folder. Doesn't return anything.

1. If the target or source path mapping is not found in the config : 
Prompts the user by throwing a `MappingNotFoundException`   : 
   > "**MappingNotFoundException** : Mapping for the local path provided is not found. Provide a File to be Mapped to the local path"
     
1. If the target folder provided has been deleted previously :
Throws a `TargetFolderDoesNotExistException` :
    >" **TargetFolderDoesNotExistException :** Folder Mapped to the target path provided has been deleted."


## Get Pattern Matches API

Intended to provide all the file and folder names which matches a specified pattern. It supports the use of multiple character (*) and single character (?) wildcards to specify multiple files and folders.

**Implementation:**  `getPatternMatches(pattern)`

**Parameters:**
`pattern` - String
Absolute local path string expression in the Windows or Unix file system format.  eg, "C:\Desktop\*.txt", "/Downloads/file?.txt" etc.

**Return Values:**
`matches` - String Array
Returns a string array representing the names of  files, directories, or folders that matches the specified pattern.



