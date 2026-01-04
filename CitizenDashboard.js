import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { grievanceContract, ssiContract } from '../utils/contract';
import Statistics from './Statistics';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = location.state?.account;

  const [citizenData, setCitizenData] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('complaints');
  const [hasSSI, setHasSSI] = useState(false);

  useEffect(() => {
    if (account) {
      loadDashboardData();
    }
  }, [account]);

  const loadDashboardData = async () => {
    try {
      const citizen = await grievanceContract.methods.citizens(account).call();
      setCitizenData(citizen);

      try {
        const identityData = await ssiContract.methods.getIdentity(account).call();
        setIdentity(identityData);
        setHasSSI(true);
      } catch (err) {
        console.log('No SSI identity found');
        setHasSSI(false);
      }

      const complaintIds = await grievanceContract.methods
        .getCitizenComplaints(account)
        .call();

      const complaintsData = await Promise.all(
  complaintIds.map(async (id) => {
    const complaint = await grievanceContract.methods.getComplaint(id).call();
    return {
      id: complaint.id,
      text: complaint.complaintText,
      category: complaint.category,
      urgency: Number(complaint.urgency),
      status: Number(complaint.status),
      createdAt: complaint.createdAt,
      summary: complaint.aiSummary,
      citizenAcknowledged: complaint.citizenAcknowledged,
      authorityResolved: complaint.authorityResolved
    };
  })
);
      setComplaints(complaintsData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseComplaint = () => {
    if (!hasSSI) {
      const proceed = window.confirm(
        'You need to create your Self-Sovereign Identity (SSI) before raising a complaint. Would you like to create it now?'
      );
      if (proceed) {
        navigate('/create-ssi', { state: { account } });
      }
    } else {
      navigate('/raise-complaint', { state: { account } });
    }
  };

  const acknowledgeComplaint = async (complaintId) => {
    try {
      await grievanceContract.methods
        .acknowledgeSolution(complaintId)
        .send({ from: account });
      alert('Solution acknowledged successfully!');
      loadDashboardData();
    } catch (err) {
      alert('Failed to acknowledge solution');
    }
  };

  const getStatusText = (status) => {
    const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
    return statuses[status] || 'Unknown';
  };

  const getUrgencyText = (urgency) => {
    const levels = ['Low', 'Medium', 'High', 'Critical'];
    return levels[urgency] || 'Unknown';
  };

  const getUrgencyClass = (urgency) => {
    const classes = ['urgency-low', 'urgency-medium', 'urgency-high', 'urgency-critical'];
    return classes[urgency] || '';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Citizen Dashboard</h1>
        <div className="user-info">
          <p>Welcome, {citizenData?.username}</p>
          <button onClick={() => navigate('/login')} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {!hasSSI && (
        <div className="ssi-warning-banner">
          <p>⚠️ You haven't created your Self-Sovereign Identity (SSI) yet. You need to create it before raising complaints.</p>
          <button onClick={() => navigate('/create-ssi', { state: { account } })} className="create-ssi-btn">
            Create SSI Identity Now
          </button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'complaints' ? 'active' : ''}
          onClick={() => setActiveTab('complaints')}
        >
          My Complaints
        </button>
        <button
          className={activeTab === 'identity' ? 'active' : ''}
          onClick={() => setActiveTab('identity')}
        >
          Identity
        </button>
        <button
          className={activeTab === 'statistics' ? 'active' : ''}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'complaints' && (
          <div className="complaints-section">
            <div className="section-header">
              <h2>My Complaints</h2>
              <button
                onClick={handleRaiseComplaint}
                className="raise-complaint-btn"
              >
                + Raise New Complaint
              </button>
            </div>

            {complaints.length === 0 ? (
              <div className="no-complaints">
                <p>No complaints raised yet</p>
                <button
                  onClick={handleRaiseComplaint}
                  className="primary-btn"
                >
                  Raise Your First Complaint
                </button>
              </div>
            ) : (
              <div className="complaints-list">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-card">
                    <div className="complaint-header">
                      <h3>Complaint #{complaint.id}</h3>
                      <span className={`status-badge status-${complaint.status}`}>
                        {getStatusText(complaint.status)}
                      </span>
                    </div>

                    <div className="complaint-body">
                      <div className="complaint-meta">
                        <span className="category-badge">{complaint.category}</span>
                        <span className={`urgency-badge ${getUrgencyClass(complaint.urgency)}`}>
                          {getUrgencyText(complaint.urgency)}
                        </span>
                        <span className="date-badge">
                          {new Date(parseInt(complaint.createdAt) * 1000).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="complaint-summary">
                        <h4>AI Summary:</h4>
                        <p>{complaint.summary}</p>
                      </div>

                      <div className="complaint-text">
                        <h4>Full Description:</h4>
                        <p>{complaint.text}</p>
                      </div>

                      {complaint.authorityResolved && !complaint.citizenAcknowledged && (
                        <div className="action-required">
                          <p>Authority has marked this as resolved. Please acknowledge if satisfied.</p>
                          <button
                            onClick={() => acknowledgeComplaint(complaint.id)}
                            className="acknowledge-btn"
                          >
                            Acknowledge Solution
                          </button>
                        </div>
                      )}

                      {complaint.citizenAcknowledged && (
                        <div className="resolved-message">
                          <p>✓ Complaint resolved and acknowledged</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="identity-section">
            <h2>My Identity</h2>
            {identity ? (
              <div className="identity-card">
                <div className="identity-row">
                  <span className="label">DID:</span>
                  <span className="value">{identity[0]}</span>
                </div>
                <div className="identity-row">
                  <span className="label">Created At:</span>
                  <span className="value">
                    {new Date(parseInt(identity[2]) * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="identity-row">
                  <span className="label">Status:</span>
                  <span className="value verified">Verified</span>
                </div>
                <div className="identity-info">
                  <p>
                    Your Self-Sovereign Identity (SSI) is securely stored on the blockchain.
                    All your complaints are linked to this identity for transparency and
                    accountability.
                  </p>
                </div>
              </div>
            ) : (
              <div className="no-identity">
                <p>No SSI identity found</p>
                <button
                  onClick={() => navigate('/create-ssi', { state: { account } })}
                  className="primary-btn"
                >
                  Create SSI Identity
                </button>
              </div>
            )}

            <div className="profile-info">
              <h3>Profile Information</h3>
              <div className="profile-row">
                <span className="label">Name:</span>
                <span className="value">{citizenData?.name}</span>
              </div>
              <div className="profile-row">
                <span className="label">Username:</span>
                <span className="value">{citizenData?.username}</span>
              </div>
              <div className="profile-row">
                <span className="label">Phone:</span>
                <span className="value">{citizenData?.phoneNumber}</span>
              </div>
              <div className="profile-row">
                <span className="label">City:</span>
                <span className="value">{citizenData?.city}</span>
              </div>
              <div className="profile-row">
                <span className="label">Wallet:</span>
                <span className="value wallet-address">{account}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && <Statistics userType="citizen" />}
      </div>
    </div>
  );
};

export default CitizenDashboard;