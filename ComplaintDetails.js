import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grievanceContract } from '../utils/contract';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaintDetails();
  }, [id]);

  const loadComplaintDetails = async () => {
    try {
      const complaintData = await grievanceContract.methods.getComplaint(id).call();
      setComplaint({
        id: complaintData.id,
        citizenAddress: complaintData.citizenAddress,
        text: complaintData.complaintText,
        category: complaintData.category,
        urgency: complaintData.urgency,
        status: complaintData.status,
        assignedAuthority: complaintData.assignedAuthority,
        createdAt: complaintData.createdAt,
        summary: complaintData.aiSummary,
        citizenAcknowledged: complaintData.citizenAcknowledged,
        authorityResolved: complaintData.authorityResolved
      });
    } catch (err) {
      console.error('Error loading complaint details:', err);
    } finally {
      setLoading(false);
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
      <div className="details-container">
        <div className="loading">Loading complaint details...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="details-container">
        <div className="error-message">Complaint not found</div>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-card">
        <div className="details-header">
          <h2>Complaint Details #{complaint.id}</h2>
          <button onClick={() => navigate(-1)} className="back-btn">
            Back
          </button>
        </div>

        <div className="details-body">
          <div className="detail-section">
            <h3>Status Information</h3>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge status-${complaint.status}`}>
                {getStatusText(complaint.status)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="category-badge">{complaint.category}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Urgency:</span>
              <span className={`urgency-badge ${getUrgencyClass(complaint.urgency)}`}>
                {getUrgencyText(complaint.urgency)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span>{new Date(parseInt(complaint.createdAt) * 1000).toLocaleString()}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>AI Analysis</h3>
            <div className="summary-box">
              <p>{complaint.summary}</p>
            </div>
          </div>

          <div className="detail-section">
            <h3>Full Description</h3>
            <div className="description-box">
              <p>{complaint.text}</p>
            </div>
          </div>

          <div className="detail-section">
            <h3>Assignment Details</h3>
            <div className="detail-row">
              <span className="detail-label">Citizen Address:</span>
              <span className="address-value">{complaint.citizenAddress}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Assigned Authority:</span>
              <span className="address-value">{complaint.assignedAuthority}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Resolution Status</h3>
            <div className="resolution-status">
              <div className={`status-item ${complaint.authorityResolved ? 'completed' : ''}`}>
                <span className="status-icon">
                  {complaint.authorityResolved ? '✓' : '○'}
                </span>
                <span>Authority Resolved</span>
              </div>
              <div className={`status-item ${complaint.citizenAcknowledged ? 'completed' : ''}`}>
                <span className="status-icon">
                  {complaint.citizenAcknowledged ? '✓' : '○'}
                </span>
                <span>Citizen Acknowledged</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;