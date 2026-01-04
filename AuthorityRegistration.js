import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../utils/web3';
import { grievanceContract } from '../utils/contract';

const AuthorityRegistration = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [formData, setFormData] = useState({
    role: 'Municipal',
    officialName: '',
    officerId: '',
    jurisdiction: '',
    officialContact: '',
    authorityLevel: 'Local'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  const checkMetaMaskConnection = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setError('Please connect your MetaMask wallet');
      }
    } catch (err) {
      setError('Failed to connect to MetaMask');
      console.error(err);
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setError('');
        } else {
          setWalletAddress('');
          setError('Please connect your MetaMask wallet');
        }
      });
    }
  };

  const connectMetaMask = async () => {
    try {
      const account = await connectWallet();
      setWalletAddress(account);
      setError('');
    } catch (err) {
      setError('Failed to connect MetaMask. Please try again.');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!walletAddress) {
        throw new Error('Please connect MetaMask wallet first');
      }

      if (!formData.officialContact.includes('@gov.in')) {
        throw new Error('Please use a valid government email (@gov.in)');
      }

      await grievanceContract.methods
        .registerAuthority(
          formData.role,
          formData.officialName,
          formData.officerId,
          formData.jurisdiction,
          formData.officialContact,
          formData.authorityLevel
        )
        .send({ from: walletAddress });

      alert('Registration successful! Please login to continue.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Authority Registration</h2>

        {error && <div className="error-message">{error}</div>}

        {!walletAddress && (
          <div className="connect-wallet-section">
            <p>Please connect your MetaMask wallet to continue</p>
            <button onClick={connectMetaMask} className="wallet-connect-btn">
              Connect MetaMask
            </button>
          </div>
        )}

        {walletAddress && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Municipal">Municipal</option>
                <option value="Police">Police</option>
                <option value="Health">Health</option>
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
                <option value="Education">Education</option>
                <option value="Transport">Transport</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Official Name *</label>
              <input
                type="text"
                name="officialName"
                value={formData.officialName}
                onChange={handleChange}
                placeholder="e.g., Greater Hyderabad Municipal Corporation"
                required
              />
            </div>

            <div className="form-group">
              <label>Officer / Department ID *</label>
              <input
                type="text"
                name="officerId"
                value={formData.officerId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Jurisdiction *</label>
              <input
                type="text"
                name="jurisdiction"
                value={formData.jurisdiction}
                onChange={handleChange}
                placeholder="City / Zone / District"
                required
              />
            </div>

            <div className="form-group">
              <label>Official Contact *</label>
              <input
                type="email"
                name="officialContact"
                value={formData.officialContact}
                onChange={handleChange}
                placeholder="example@gov.in"
                required
              />
            </div>

            <div className="form-group">
              <label>Authority Level *</label>
              <select
                name="authorityLevel"
                value={formData.authorityLevel}
                onChange={handleChange}
                required
              >
                <option value="Local">Local</option>
                <option value="District">District</option>
                <option value="State">State</option>
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        <div className="form-footer">
          <p>Already registered?</p>
          <button onClick={() => navigate('/login')} className="link-btn">
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorityRegistration;