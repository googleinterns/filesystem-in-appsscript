/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Get Pattern Matches API Unit Tests for Windows File System
 */
function get_pattern_matches_api_windows_tests() {
  QUnit.module("WINDOWS - getPatternMatches API");

  // @ts-ignore
  // Tests for searching file patterns
  QUnit.test("Search for files using wildcard pattern testing", function() {
    var pattern = [
      "C:\\user\\Folder2\\Folder22\\*.xls", 
      "C:\\user\\Folder3\\File3?.docx"
    ];

    var expectedMatches = [ 
      [ "File221.xls", "File222.xls" ], 
      [ "File31.docx", "File33.docx" ] 
    ];

    var fileMatches = [];
    for (var i = 0; i < pattern.length; i++) {
      fileMatches[i] = findFilesByPattern(pattern[i]);
      fileMatches[i].sort();
    }

    expect(pattern.length);

    for (var i = 0; i < pattern.length; i++) {
      deepEqual(fileMatches[i], expectedMatches[i],
                "File Pattern matches correctly");
    }
  });

  // @ts-ignore
  // Tests for searching folder patterns
  QUnit.test("Search for folders using wildcard pattern testing", function() {
    var pattern = [ 
      "C:\\user\\*", 
      "C:\\user\\Folder2\\Folder2?" 
    ];

    var expectedMatches = [
      [ "Folder1", "Folder2", "Folder3", "Folder4" ],
      [ "Folder21", "Folder22", "Folder23" ]
    ];

    var folderMatches = [];
    for (var i = 0; i < pattern.length; i++) {
      folderMatches[i] = findFoldersByPattern(pattern[i]);
      folderMatches[i].sort();
    }

    expect(pattern.length);

    for (var i = 0; i < pattern.length; i++) {
      deepEqual(folderMatches[i], expectedMatches[i],
                "Folder Pattern matches correctly");
    }
  });
}

/**
 * Get Pattern Matches API Unit Tests for Unix File System
 */
function get_pattern_matches_api_unix_tests() {
  QUnit.module("UNIX - getPatternMatches API");

  // @ts-ignore
  // Tests for searching file patterns
  QUnit.test("Search for files using wildcard pattern testing", function() {
    var pattern = [
      "/home/Folder2/Folder22/*.xls", 
      "/home/Folder3/File3?.docx"
    ];

    var expectedMatches = [ 
      [ "File221.xls", "File222.xls" ], 
      [ "File31.docx", "File33.docx" ] 
    ];

    var fileMatches = [];
    for (var i = 0; i < pattern.length; i++) {
      fileMatches[i] = findFilesByPattern(pattern[i]);
      fileMatches[i].sort();
    }

    expect(pattern.length);

    for (var i = 0; i < pattern.length; i++) {
      deepEqual(fileMatches[i], expectedMatches[i],
                "File Pattern matches correctly");
    }
  });

  // @ts-ignore
  // Tests for searching folder patterns
  QUnit.test("Search for folders using wildcard pattern testing", function() {
    var pattern = [ 
      "/home/*", 
      "/home/Folder2/Folder2?" 
    ];

    var expectedMatches = [
      [ "Folder1", "Folder2", "Folder3", "Folder4" ],
      [ "Folder21", "Folder22", "Folder23" ]
    ];

    var folderMatches = [];
    for (var i = 0; i < pattern.length; i++) {
      folderMatches[i] = findFoldersByPattern(pattern[i]);
      folderMatches[i].sort();
    }

    expect(pattern.length);

    for (var i = 0; i < pattern.length; i++) {
      deepEqual(folderMatches[i], expectedMatches[i],
                "Folder Pattern matches correctly");
    }
  });
}
