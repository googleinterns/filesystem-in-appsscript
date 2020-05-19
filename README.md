# Local filesystem emulation in Apps Script

Excel macros can access any file in the local filesystem. There are numerous APIs 
to interact with the filesystem like reading a text file, opening a workbook etc.
Apps Script can access files on Google Drive but not the user's local filesystem. 
Automatically converting code that uses these APIs is challenging as we cannot 
determine which file in local filesystem is mapped to which one on Drive (if any).

GOALS
An Apps Script library that emulates the local filesystem using Drive APIs.
Configuration where users can add mapping between local filesystem and Google Drive 
file / folder. Prompt user to select folder / file in case there is no mapping 
provided and store the selection for use in future runs

SPECIFICATIONS
Have a configuration (preferably a jSON object) like as shown below
[
{originalPath: "C:\Data\xyz.xlsm", drivePath: "My Drive/abc.xlsm"},
{originalPath: "C:\data_files\", drivePath: "My Drive/excel/data/"},
]

Add a way to verify that the configuration is correct, i.e. the drive paths mentioned 
exist and in case the original path represents an Excel file then ensure drive Path 
is an equivalent Sheets file.

Language needed: Javascript
Special Resources: None



## Source Code Headers

Every file containing source code must include copyright and license
information. This includes any JS/CSS files that you might be serving out to
browsers. (This is to help well-intentioned people avoid accidental copying that
doesn't comply with the license.)

Apache header:

    Copyright 2020 Google LLC

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
