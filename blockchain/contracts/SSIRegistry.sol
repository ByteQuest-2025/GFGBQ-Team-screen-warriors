// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SSIRegistry {
    struct Identity {
        string did;
        string encryptedData;
        address owner;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(address => Identity) public identities;
    mapping(string => bool) public didExists;
    
    event IdentityCreated(address indexed owner, string did, uint256 timestamp);
    
    function createIdentity(string memory _did, string memory _encryptedData) public {
        require(!identities[msg.sender].exists, "Identity already exists");
        require(!didExists[_did], "DID already registered");
        
        identities[msg.sender] = Identity({
            did: _did,
            encryptedData: _encryptedData,
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
        
        didExists[_did] = true;
        
        emit IdentityCreated(msg.sender, _did, block.timestamp);
    }
    
    function getIdentity(address _owner) public view returns (string memory, string memory, uint256) {
        require(identities[_owner].exists, "Identity does not exist");
        Identity memory identity = identities[_owner];
        return (identity.did, identity.encryptedData, identity.createdAt);
    }
    
    function hasIdentity(address _owner) public view returns (bool) {
        return identities[_owner].exists;
    }
}