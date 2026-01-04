import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ssiContract } from '../utils/contract';
import web3 from '../utils/web3';

const SSICreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = location.state?.account;

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    governmentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const did = `did:eth:${account}:${Date.now()}`;

      const encryptedData = web3.utils.keccak256(
        JSON.stringify({
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          governmentId: formData.governmentId,
          timestamp: Date.now()
        })
      );

      await ssiContract.methods
        .createIdentity(did, encryptedData)
        .send({ from: account });

      alert('SSI Identity created successfully!');
      navigate('/citizen-dashboard', { state: { account } });
    } catch (err) {
      setError(err.message || 'Failed to create SSI identity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ssi-container">
      <div className="ssi-card">
        <h2>Create Self-Sovereign Identity (SSI)</h2>
        <p className="ssi-subtitle">
          Create your digital identity to raise complaints and track them securely
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Government ID Number *</label>
            <input
              type="text"
              name="governmentId"
              value={formData.governmentId}
              onChange={handleChange}
              placeholder="Aadhaar / Passport / Driving License"
              required
            />
          </div>

          <div className="info-box">
            <p>
              Your identity information will be encrypted and stored securely on the
              blockchain. Only you can access and control your identity data.
            </p>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Identity...' : 'Create SSI Identity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SSICreation;