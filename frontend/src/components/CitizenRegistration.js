import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../utils/web3';
import { grievanceContract } from '../utils/contract';

const CitizenRegistration = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    city: '',
    zipCode: ''
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

      const did = `did:eth:${walletAddress}:${Date.now()}`;

      await grievanceContract.methods
        .registerCitizen(
          formData.name,
          formData.username,
          formData.email,
          formData.phoneNumber,
          formData.city,
          formData.zipCode,
          did
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
        <h2>Citizen Registration</h2>

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
              <label>Role</label>
              <input type="text" value="Citizen" disabled className="input-disabled" />
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Username (Display Name) *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>City / District / Municipality *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Zip Code *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
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

export default CitizenRegistration;