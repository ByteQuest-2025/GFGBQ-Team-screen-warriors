import { Web3 } from 'web3';

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7550');
  web3 = new Web3(provider);
}

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getCurrentAccount = async () => {
  try {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      return accounts[0] || null;
    }
    const accounts = await web3.eth.getAccounts();
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
};

export default web3;