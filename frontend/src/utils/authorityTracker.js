import { grievanceContract } from './contract';

/**
 * Utility to track and fetch all registered authorities from the blockchain
 */

// You can maintain a local list of known authority addresses that have registered
// This should ideally be fetched from blockchain events or stored in a database
export const KNOWN_AUTHORITY_ADDRESSES = [
  // Add addresses here as authorities register
  // These are example addresses - replace with actual registered addresses
];

/**
 * Fetch all registered authorities from the blockchain
 * @returns {Promise<Array>} Array of authority objects
 */
export const getAllRegisteredAuthorities = async () => {
  const authorities = [];
  
  try {
    // Method 1: Check known addresses
    for (const address of KNOWN_AUTHORITY_ADDRESSES) {
      try {
        const isRegistered = await grievanceContract.methods
          .isAuthorityRegistered(address)
          .call();
        
        if (isRegistered) {
          const authorityData = await grievanceContract.methods
            .authorities(address)
            .call();
          
          authorities.push({
            walletAddress: authorityData.walletAddress,
            role: authorityData.role,
            jurisdiction: authorityData.jurisdiction,
            officialName: authorityData.officialName,
            officerId: authorityData.officerId,
            authorityLevel: authorityData.authorityLevel
          });
        }
      } catch (err) {
        console.error(`Error checking address ${address}:`, err);
      }
    }
    
    // Method 2: Get from past events (recommended)
    // This requires your web3 provider to support event queries
    try {
      const events = await grievanceContract.getPastEvents('AuthorityRegistered', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      for (const event of events) {
        const address = event.returnValues.authority;
        
        // Check if already in list
        if (!authorities.find(a => a.walletAddress.toLowerCase() === address.toLowerCase())) {
          const isRegistered = await grievanceContract.methods
            .isAuthorityRegistered(address)
            .call();
          
          if (isRegistered) {
            const authorityData = await grievanceContract.methods
              .authorities(address)
              .call();
            
            authorities.push({
              walletAddress: authorityData.walletAddress,
              role: authorityData.role,
              jurisdiction: authorityData.jurisdiction,
              officialName: authorityData.officialName,
              officerId: authorityData.officerId,
              authorityLevel: authorityData.authorityLevel
            });
          }
        }
      }
    } catch (eventError) {
      console.error('Failed to fetch authority events:', eventError);
    }
    
    return authorities;
  } catch (err) {
    console.error('Error fetching authorities:', err);
    return [];
  }
};

/**
 * Add a newly registered authority to the known list
 * @param {string} address - Authority wallet address
 */
export const addKnownAuthority = (address) => {
  if (!KNOWN_AUTHORITY_ADDRESSES.includes(address)) {
    KNOWN_AUTHORITY_ADDRESSES.push(address);
    // Store in localStorage for persistence
    localStorage.setItem('knownAuthorities', JSON.stringify(KNOWN_AUTHORITY_ADDRESSES));
  }
};

/**
 * Load known authorities from localStorage
 */
export const loadKnownAuthorities = () => {
  try {
    const stored = localStorage.getItem('knownAuthorities');
    if (stored) {
      const addresses = JSON.parse(stored);
      addresses.forEach(addr => {
        if (!KNOWN_AUTHORITY_ADDRESSES.includes(addr)) {
          KNOWN_AUTHORITY_ADDRESSES.push(addr);
        }
      });
    }
  } catch (err) {
    console.error('Failed to load known authorities:', err);
  }
};

/**
 * Find authority by role and region
 * @param {string} role - Authority role/category
 * @param {string} region - Citizen's region
 * @param {Array} authorities - List of authorities
 * @returns {Object|null} Matched authority or null
 */
export const findMatchingAuthority = (role, region, authorities) => {
  const regionLower = region.toLowerCase();
  const roleLower = role.toLowerCase();
  
  // Priority 1: Exact match (role + region)
  const exactMatch = authorities.find(
    auth => 
      auth.role.toLowerCase() === roleLower &&
      auth.jurisdiction.toLowerCase().includes(regionLower)
  );
  
  if (exactMatch) {
    return { authority: exactMatch, matchType: 'exact' };
  }
  
  // Priority 2: Role match only
  const roleMatch = authorities.find(
    auth => auth.role.toLowerCase() === roleLower
  );
  
  if (roleMatch) {
    return { authority: roleMatch, matchType: 'roleOnly' };
  }
  
  // Priority 3: Generic "Other" authority
  const genericMatch = authorities.find(
    auth => auth.role.toLowerCase() === 'other'
  );
  
  if (genericMatch) {
    return { authority: genericMatch, matchType: 'generic' };
  }
  
  // No match found
  return { authority: null, matchType: 'none' };
};

// Initialize on load
loadKnownAuthorities();