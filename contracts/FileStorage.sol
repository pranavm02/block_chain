// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct FileData {
        string fileHash;
        uint256 timestamp;
    }

    mapping(address => FileData[]) public userFiles;

    // Store a new file hash with timestamp
    function storeFile(string memory fileHash) public {
        userFiles[msg.sender].push(FileData(fileHash, block.timestamp));
    }

    // Get the count of stored files for a user
    function getFileCount(address user) public view returns (uint256) {
        return userFiles[user].length; // Return the length of the user's file array
    }

    // Get a specific file's data for a user
    function getFile(address user, uint256 index) public view returns (string memory, uint256) {
        FileData memory file = userFiles[user][index];
        return (file.fileHash, file.timestamp); // Return the file hash and timestamp
    }
}
