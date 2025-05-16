// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ChatStorage {
    struct Message {
        uint256 id;
        uint256 fid;
        string username;
        string text;
        uint256 timestamp;
        bytes signature;
    }
    
    Message[] public messages;
    mapping(uint256 => uint256) public userMessageCount;
    
    event MessageStored(uint256 indexed id, uint256 indexed fid, uint256 timestamp);
    
    function storeMessage(
        uint256 fid,
        string memory username,
        string memory text,
        uint256 timestamp,
        bytes memory signature
    ) external {
        uint256 messageId = messages.length;
        
        messages.push(Message({
            id: messageId,
            fid: fid,
            username: username,
            text: text,
            timestamp: timestamp,
            signature: signature
        }));
        
        userMessageCount[fid]++;
        
        emit MessageStored(messageId, fid, timestamp);
    }
    
    function getMessages(uint256 limit, uint256 offset) external view returns (Message[] memory) {
        uint256 totalMessages = messages.length;
        
        if (offset >= totalMessages) {
            return new Message[](0);
        }
        
        uint256 resultSize = totalMessages - offset;
        if (resultSize > limit) {
            resultSize = limit;
        }
        
        Message[] memory result = new Message[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = messages[offset + i];
        }
        
        return result;
    }
    
    function getUserMessages(uint256 fid, uint256 limit, uint256 offset) external view returns (Message[] memory) {
        uint256 resultSize = 0;
        uint256 count = 0;
        
        // Count matching messages
        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].fid == fid) {
                count++;
            }
        }
        
        if (offset >= count) {
            return new Message[](0);
        }
        
        resultSize = count - offset;
        if (resultSize > limit) {
            resultSize = limit;
        }
        
        Message[] memory result = new Message[](resultSize);
        uint256 resultIndex = 0;
        uint256 skipped = 0;
        
        // Collect messages
        for (uint256 i = 0; i < messages.length && resultIndex < resultSize; i++) {
            if (messages[i].fid == fid) {
                if (skipped < offset) {
                    skipped++;
                } else {
                    result[resultIndex] = messages[i];
                    resultIndex++;
                }
            }
        }
        
        return result;
    }
    
    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }
    
    function getUserMessageCount(uint256 fid) external view returns (uint256) {
        return userMessageCount[fid];
    }
}