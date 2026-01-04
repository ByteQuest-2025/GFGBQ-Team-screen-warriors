import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { grievanceContract } from '../utils/contract';
import Statistics from './Statistics';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = location.state?.account;

  const [authorityData, setAuthorityData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('complaints');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  useEffect(() => {
    if (account) {
      loadDashboardData();
    }
  }, [account]);

  const loadDashboardData = async () => {
    try {
      const authority = await grievanceContract.methods.authorities(account).call();
      setAuthorityData(authority);

      const complaintIds = await grievanceContract.methods
        .getAuthorityComplaints(account)
        .call();

      const complaintsData = await Promise.all(
        complaintIds.map(async (id) => {
          const complaint = await grievanceContract.methods.getComplaint(id).call();
          
          let mediaUrl = '';
          if (complaint.mediaHash && complaint.mediaHash.trim() !== '') {
            mediaUrl = `http://localhost:5000/api/uploads/${complaint.mediaHash}`;
          }
          
          return {
            id: complaint.id,
            citizenAddress: complaint.citizenAddress,
            text: complaint.complaintText,
            category: complaint.category,
            urgency: Number(complaint.urgency),
            status: Number(complaint.status),
            createdAt: complaint.createdAt,
            summary: complaint.aiSummary,
            citizenAcknowledged: complaint.citizenAcknowledged,
            authorityResolved: complaint.authorityResolved,
            mediaUrl: mediaUrl,
            mediaFilename: complaint.mediaHash || ''
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

  const markAsResolved = async (complaintId) => {
    try {
      await grievanceContract.methods
        .markAsResolved(complaintId)
        .send({ from: account });
      alert('Complaint marked as resolved!');
      loadDashboardData();
    } catch (err) {
      alert('Failed to mark as resolved');
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

  const isAudioFile = (filename) => {
    if (!filename) return false;
    const audioExtensions = ['.webm', '.mp3', '.wav', '.ogg', '.m4a'];
    return audioExtensions.some(ext => filename.toLowerCase().endsWith(ext)) || 
           filename.toLowerCase().includes('voice_');
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const statusMatch = filterStatus === 'all' || 
      getStatusText(complaint.status).toLowerCase() === filterStatus.toLowerCase();
    
    const urgencyMatch = filterUrgency === 'all' || 
      getUrgencyText(complaint.urgency).toLowerCase() === filterUrgency.toLowerCase();
    
    return statusMatch && urgencyMatch;
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    return Number(b.urgency) - Number(a.urgency);
  });

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
        <h1>Authority Dashboard</h1>
        <div className="user-info">
          <p>{authorityData?.officialName}</p>
          <span className="role-badge">{authorityData?.role}</span>
          <button onClick={() => navigate('/login')} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'complaints' ? 'active' : ''}
          onClick={() => setActiveTab('complaints')}
        >
          Assigned Complaints
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
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
              <h2>Assigned Complaints</h2>
              <div className="filter-controls">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}>
                  <option value="all">All Urgency</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {sortedComplaints.length === 0 ? (
              <div className="no-complaints">
                <p>No complaints match the selected filters</p>
              </div>
            ) : (
              <div className="complaints-list">
                {sortedComplaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-card authority">
                    <div className="complaint-header">
                      <h3>Complaint #{complaint.id}</h3>
                      <div className="header-badges">
                        <span className={`urgency-badge ${getUrgencyClass(complaint.urgency)}`}>
                          {getUrgencyText(complaint.urgency)} Priority
                        </span>
                        <span className={`status-badge status-${complaint.status}`}>
                          {getStatusText(complaint.status)}
                        </span>
                      </div>
                    </div>

                    <div className="complaint-body">
                      <div className="complaint-meta">
                        <span className="category-badge">{complaint.category}</span>
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

                      {complaint.mediaUrl && (
                        <div className="complaint-media">
                          <h4>📎 Attached Evidence:</h4>
                          <div className="media-container">
                            {isAudioFile(complaint.mediaFilename) ? (
                              <div>
                                <audio 
                                  controls 
                                  src={complaint.mediaUrl} 
                                  style={{ width: '100%', marginTop: '10px' }}
                                >
                                  Your browser does not support the audio element.
                                </audio>
                                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                                  🎤 Voice Recording: {complaint.mediaFilename}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <a href={complaint.mediaUrl} target="_blank" rel="noopener noreferrer">
                                  <img 
                                    src={complaint.mediaUrl} 
                                    alt="Complaint Evidence" 
                                    style={{ 
                                      maxWidth: '100%', 
                                      maxHeight: '400px', 
                                      borderRadius: '8px', 
                                      marginTop: '10px',
                                      border: '2px solid #ddd',
                                      cursor: 'pointer'
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null; 
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <p style={{ display: 'none', color: '#f44336', marginTop: '10px' }}>
                                    ⚠️ Failed to load image
                                  </p>
                                </a>
                                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                                  📷 Image: {complaint.mediaFilename}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="complaint-citizen">
                        <p>
                          <strong>Citizen Address:</strong> {complaint.citizenAddress}
                        </p>
                      </div>

                      {complaint.status !== 2 && complaint.status !== 3 && (
                        <div className="complaint-actions">
                          <h4>Update Status:</h4>
                          <div className="action-buttons">
                            <button
                              onClick={() => markAsResolved(complaint.id)}
                              className="action-btn resolve-btn"
                            >
                              Mark as Resolved
                            </button>
                          </div>
                        </div>
                      )}

                      {complaint.authorityResolved && !complaint.citizenAcknowledged && (
                        <div className="pending-acknowledgement">
                          <p>⏳ Waiting for citizen acknowledgement</p>
                        </div>
                      )}

                      {complaint.citizenAcknowledged && (
                        <div className="resolved-message">
                          <p>✓ Complaint resolved and closed</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Authority Profile</h2>
            <div className="profile-card">
              <div className="profile-row">
                <span className="label">Official Name:</span>
                <span className="value">{authorityData?.officialName}</span>
              </div>
              <div className="profile-row">
                <span className="label">Role:</span>
                <span className="value">{authorityData?.role}</span>
              </div>
              <div className="profile-row">
                <span className="label">Officer ID:</span>
                <span className="value">{authorityData?.officerId}</span>
              </div>
              <div className="profile-row">
                <span className="label">Jurisdiction:</span>
                <span className="value">{authorityData?.jurisdiction}</span>
              </div>
              <div className="profile-row">
                <span className="label">Wallet Address:</span>
                <span className="value wallet-address">{account}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && <Statistics userType="authority" />}
      </div>
    </div>
  );
};

export default AuthorityDashboard;