import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../utils/web3';
import { grievanceContract } from '../utils/contract';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const account = await connectWallet();

      const isCitizen = await grievanceContract.methods
        .isCitizenRegistered(account)
        .call();

      const isAuthority = await grievanceContract.methods
        .isAuthorityRegistered(account)
        .call();

      if (isCitizen) {
        const citizenDID = await grievanceContract.methods
          .getCitizenDID(account)
          .call();

        if (!citizenDID || citizenDID === '') {
          navigate('/create-ssi', { state: { account } });
        } else {
          navigate('/citizen-dashboard', { state: { account } });
        }
      } else if (isAuthority) {
        navigate('/authority-dashboard', { state: { account } });
      } else {
        setError('Account not registered. Please register first.');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to Grievance System</h2>
        <p className="login-subtitle">Connect your MetaMask wallet to continue</p>

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleLogin} className="wallet-connect-btn" disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <div className="register-links">
            <button onClick={() => navigate('/register-citizen')} className="link-btn">
              Register as Citizen
            </button>
            <button onClick={() => navigate('/register-authority')} className="link-btn">
              Register as Authority
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;