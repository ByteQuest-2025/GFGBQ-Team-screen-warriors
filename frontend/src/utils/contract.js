import web3 from './web3';

const GRIEVANCE_CONTRACT_ADDRESS = '0x37C8991B559C4d9020f0ba57cB52D023e9c6b5e1';
const SSI_CONTRACT_ADDRESS = '0x72e2ba4AfA90F2351B9221b66F83f918C0853A7D';

const GrievanceSystemABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_username", "type": "string"},
      {"internalType": "string", "name": "_email", "type": "string"},
      {"internalType": "string", "name": "_phoneNumber", "type": "string"},
      {"internalType": "string", "name": "_city", "type": "string"},
      {"internalType": "string", "name": "_zipCode", "type": "string"},
      {"internalType": "string", "name": "_did", "type": "string"}
    ],
    "name": "registerCitizen",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_role", "type": "string"},
      {"internalType": "string", "name": "_officialName", "type": "string"},
      {"internalType": "string", "name": "_officerId", "type": "string"},
      {"internalType": "string", "name": "_jurisdiction", "type": "string"},
      {"internalType": "string", "name": "_officialContact", "type": "string"},
      {"internalType": "string", "name": "_authorityLevel", "type": "string"}
    ],
    "name": "registerAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_complaintText", "type": "string"},
      {"internalType": "string", "name": "_category", "type": "string"},
      {"internalType": "string", "name": "_mediaHash", "type": "string"},
      {"internalType": "string", "name": "_aiSummary", "type": "string"},
      {"internalType": "uint8", "name": "_urgency", "type": "uint8"},
      {"internalType": "address", "name": "_assignedAuthority", "type": "address"}
    ],
    "name": "raiseComplaint",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_complaintId", "type": "uint256"},
      {"internalType": "uint8", "name": "_status", "type": "uint8"}
    ],
    "name": "updateComplaintStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_complaintId", "type": "uint256"}],
    "name": "markAsResolved",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_complaintId", "type": "uint256"}],
    "name": "acknowledgeSolution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAuthorities",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAuthorityCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_start", "type": "uint256"},
      {"internalType": "uint256", "name": "_limit", "type": "uint256"}
    ],
    "name": "getAuthoritiesPaginated",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_citizen", "type": "address"}],
    "name": "getCitizenComplaints",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_authority", "type": "address"}],
    "name": "getAuthorityComplaints",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_complaintId", "type": "uint256"}],
    "name": "getComplaint",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "citizenAddress", "type": "address"},
      {"internalType": "string", "name": "complaintText", "type": "string"},
      {"internalType": "string", "name": "category", "type": "string"},
      {"internalType": "uint8", "name": "urgency", "type": "uint8"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "address", "name": "assignedAuthority", "type": "address"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "string", "name": "aiSummary", "type": "string"},
      {"internalType": "bool", "name": "citizenAcknowledged", "type": "bool"},
      {"internalType": "bool", "name": "authorityResolved", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_category", "type": "string"}],
    "name": "getCategoryStats",
    "outputs": [
      {"internalType": "uint256", "name": "total", "type": "uint256"},
      {"internalType": "uint256", "name": "resolved", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_citizen", "type": "address"}],
    "name": "isCitizenRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_authority", "type": "address"}],
    "name": "isAuthorityRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_citizen", "type": "address"}],
    "name": "getCitizenDID",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "citizens",
    "outputs": [
      {"internalType": "address", "name": "walletAddress", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "username", "type": "string"},
      {"internalType": "string", "name": "email", "type": "string"},
      {"internalType": "string", "name": "phoneNumber", "type": "string"},
      {"internalType": "string", "name": "city", "type": "string"},
      {"internalType": "string", "name": "zipCode", "type": "string"},
      {"internalType": "string", "name": "did", "type": "string"},
      {"internalType": "bool", "name": "registered", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "authorities",
    "outputs": [
      {"internalType": "address", "name": "walletAddress", "type": "address"},
      {"internalType": "string", "name": "role", "type": "string"},
      {"internalType": "string", "name": "officialName", "type": "string"},
      {"internalType": "string", "name": "officerId", "type": "string"},
      {"internalType": "string", "name": "jurisdiction", "type": "string"},
      {"internalType": "string", "name": "officialContact", "type": "string"},
      {"internalType": "string", "name": "authorityLevel", "type": "string"},
      {"internalType": "bool", "name": "registered", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "allAuthorities",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const SSIRegistryABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_did", "type": "string"},
      {"internalType": "string", "name": "_encryptedData", "type": "string"}
    ],
    "name": "createIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "getIdentity",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "hasIdentity",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const grievanceContract = new web3.eth.Contract(
  GrievanceSystemABI,
  GRIEVANCE_CONTRACT_ADDRESS
);

export const ssiContract = new web3.eth.Contract(
  SSIRegistryABI,
  SSI_CONTRACT_ADDRESS
);

export { GRIEVANCE_CONTRACT_ADDRESS, SSI_CONTRACT_ADDRESS };