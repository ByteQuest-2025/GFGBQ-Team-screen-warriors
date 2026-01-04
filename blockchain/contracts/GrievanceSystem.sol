// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GrievanceSystem {
    enum ComplaintStatus { Pending, InProgress, Resolved, Closed }
    enum UrgencyLevel { Low, Medium, High, Critical }
    
    struct Citizen {
        address walletAddress;
        string name;
        string username;
        string email;
        string phoneNumber;
        string city;
        string zipCode;
        string did;
        bool registered;
    }
    
    struct Authority {
        address walletAddress;
        string role;
        string officialName;
        string officerId;
        string jurisdiction;
        string officialContact;
        string authorityLevel;
        bool registered;
    }
    
    struct Complaint {
        uint256 id;
        address citizenAddress;
        string did;
        string complaintText;
        string category;
        string mediaHash;
        UrgencyLevel urgency;
        ComplaintStatus status;
        address assignedAuthority;
        uint256 createdAt;
        uint256 updatedAt;
        bool citizenAcknowledged;
        bool authorityResolved;
        string aiSummary;
    }
    
    mapping(address => Citizen) public citizens;
    mapping(address => Authority) public authorities;
    mapping(uint256 => Complaint) public complaints;
    mapping(string => uint256[]) public categoryComplaints;
    mapping(address => uint256[]) public citizenComplaints;
    mapping(address => uint256[]) public authorityComplaints;
    
    // NEW: Track all registered authority addresses
    address[] public allAuthorities;
    mapping(address => uint256) private authorityIndex; // For efficient removal if needed
    
    uint256 public complaintCounter;
    
    event CitizenRegistered(address indexed citizen, string username, uint256 timestamp);
    event AuthorityRegistered(address indexed authority, string role, uint256 timestamp);
    event ComplaintRaised(uint256 indexed complaintId, address indexed citizen, string category, uint256 timestamp);
    event ComplaintAssigned(uint256 indexed complaintId, address indexed authority, uint256 timestamp);
    event ComplaintStatusUpdated(uint256 indexed complaintId, ComplaintStatus status, uint256 timestamp);
    event ComplaintResolved(uint256 indexed complaintId, uint256 timestamp);
    
    function registerCitizen(
        string memory _name,
        string memory _username,
        string memory _email,
        string memory _phoneNumber,
        string memory _city,
        string memory _zipCode,
        string memory _did
    ) public {
        require(!citizens[msg.sender].registered, "Citizen already registered");
        
        citizens[msg.sender] = Citizen({
            walletAddress: msg.sender,
            name: _name,
            username: _username,
            email: _email,
            phoneNumber: _phoneNumber,
            city: _city,
            zipCode: _zipCode,
            did: _did,
            registered: true
        });
        
        emit CitizenRegistered(msg.sender, _username, block.timestamp);
    }
    
    function registerAuthority(
        string memory _role,
        string memory _officialName,
        string memory _officerId,
        string memory _jurisdiction,
        string memory _officialContact,
        string memory _authorityLevel
    ) public {
        require(!authorities[msg.sender].registered, "Authority already registered");
        
        authorities[msg.sender] = Authority({
            walletAddress: msg.sender,
            role: _role,
            officialName: _officialName,
            officerId: _officerId,
            jurisdiction: _jurisdiction,
            officialContact: _officialContact,
            authorityLevel: _authorityLevel,
            registered: true
        });
        
        // Add to authority list
        authorityIndex[msg.sender] = allAuthorities.length;
        allAuthorities.push(msg.sender);
        
        emit AuthorityRegistered(msg.sender, _role, block.timestamp);
    }
    
    function raiseComplaint(
        string memory _complaintText,
        string memory _category,
        string memory _mediaHash,
        string memory _aiSummary,
        uint8 _urgency,
        address _assignedAuthority
    ) public returns (uint256) {
        require(citizens[msg.sender].registered, "Citizen not registered");
        require(bytes(citizens[msg.sender].did).length > 0, "DID not created");
        require(authorities[_assignedAuthority].registered, "Assigned authority not registered");
        
        complaintCounter++;
        
        complaints[complaintCounter] = Complaint({
            id: complaintCounter,
            citizenAddress: msg.sender,
            did: citizens[msg.sender].did,
            complaintText: _complaintText,
            category: _category,
            mediaHash: _mediaHash,
            urgency: UrgencyLevel(_urgency),
            status: ComplaintStatus.Pending,
            assignedAuthority: _assignedAuthority,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            citizenAcknowledged: false,
            authorityResolved: false,
            aiSummary: _aiSummary
        });
        
        categoryComplaints[_category].push(complaintCounter);
        citizenComplaints[msg.sender].push(complaintCounter);
        authorityComplaints[_assignedAuthority].push(complaintCounter);
        
        emit ComplaintRaised(complaintCounter, msg.sender, _category, block.timestamp);
        emit ComplaintAssigned(complaintCounter, _assignedAuthority, block.timestamp);
        
        return complaintCounter;
    }
    
    function updateComplaintStatus(uint256 _complaintId, uint8 _status) public {
        Complaint storage complaint = complaints[_complaintId];
        require(msg.sender == complaint.assignedAuthority, "Not authorized");
        
        complaint.status = ComplaintStatus(_status);
        complaint.updatedAt = block.timestamp;
        
        emit ComplaintStatusUpdated(_complaintId, ComplaintStatus(_status), block.timestamp);
    }
    
    function markAsResolved(uint256 _complaintId) public {
        Complaint storage complaint = complaints[_complaintId];
        require(msg.sender == complaint.assignedAuthority, "Not authorized");
        
        complaint.authorityResolved = true;
        complaint.status = ComplaintStatus.Resolved;
        complaint.updatedAt = block.timestamp;
        
        emit ComplaintStatusUpdated(_complaintId, ComplaintStatus.Resolved, block.timestamp);
    }
    
    function acknowledgeSolution(uint256 _complaintId) public {
        Complaint storage complaint = complaints[_complaintId];
        require(msg.sender == complaint.citizenAddress, "Not authorized");
        require(complaint.authorityResolved, "Not resolved by authority");
        
        complaint.citizenAcknowledged = true;
        complaint.status = ComplaintStatus.Closed;
        complaint.updatedAt = block.timestamp;
        
        emit ComplaintResolved(_complaintId, block.timestamp);
    }
    
    // NEW: Get all registered authorities
    function getAllAuthorities() public view returns (address[] memory) {
        return allAuthorities;
    }
    
    // NEW: Get authority count
    function getAuthorityCount() public view returns (uint256) {
        return allAuthorities.length;
    }
    
    // NEW: Get paginated authorities
    function getAuthoritiesPaginated(uint256 _start, uint256 _limit) public view returns (address[] memory) {
        require(_start < allAuthorities.length, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > allAuthorities.length) {
            end = allAuthorities.length;
        }
        
        address[] memory result = new address[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = allAuthorities[i];
        }
        
        return result;
    }
    
    function getCitizenComplaints(address _citizen) public view returns (uint256[] memory) {
        return citizenComplaints[_citizen];
    }
    
    function getAuthorityComplaints(address _authority) public view returns (uint256[] memory) {
        return authorityComplaints[_authority];
    }
    
    function getComplaint(uint256 _complaintId) public view returns (
        uint256 id,
        address citizenAddress,
        string memory complaintText,
        string memory category,
        uint8 urgency,
        uint8 status,
        address assignedAuthority,
        uint256 createdAt,
        string memory aiSummary,
        bool citizenAcknowledged,
        bool authorityResolved
    ) {
        Complaint memory complaint = complaints[_complaintId];
        return (
            complaint.id,
            complaint.citizenAddress,
            complaint.complaintText,
            complaint.category,
            uint8(complaint.urgency),
            uint8(complaint.status),
            complaint.assignedAuthority,
            complaint.createdAt,
            complaint.aiSummary,
            complaint.citizenAcknowledged,
            complaint.authorityResolved
        );
    }
    
    function getCategoryStats(string memory _category) public view returns (uint256 total, uint256 resolved) {
        uint256[] memory complaintIds = categoryComplaints[_category];
        total = complaintIds.length;
        resolved = 0;
        
        for (uint256 i = 0; i < complaintIds.length; i++) {
            if (complaints[complaintIds[i]].status == ComplaintStatus.Closed) {
                resolved++;
            }
        }
        
        return (total, resolved);
    }
    
    function isCitizenRegistered(address _citizen) public view returns (bool) {
        return citizens[_citizen].registered;
    }
    
    function isAuthorityRegistered(address _authority) public view returns (bool) {
        return authorities[_authority].registered;
    }
    
    function getCitizenDID(address _citizen) public view returns (string memory) {
        return citizens[_citizen].did;
    }
}