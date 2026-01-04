import React, { useState, useEffect } from 'react';
import { grievanceContract } from '../utils/contract';

const Statistics = ({ userType }) => {
  const [stats, setStats] = useState({
    municipal: { total: 0, resolved: 0 },
    police: { total: 0, resolved: 0 },
    health: { total: 0, resolved: 0 },
    electricity: { total: 0, resolved: 0 },
    water: { total: 0, resolved: 0 },
    education: { total: 0, resolved: 0 },
    transport: { total: 0, resolved: 0 },
    other: { total: 0, resolved: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const categories = [
        'Municipal',
        'Police',
        'Health',
        'Electricity',
        'Water',
        'Education',
        'Transport',
        'Other'
      ];

      const statsData = {};

      for (const category of categories) {
        const result = await grievanceContract.methods
          .getCategoryStats(category)
          .call();
        statsData[category.toLowerCase()] = {
          total: parseInt(result.total),
          resolved: parseInt(result.resolved)
        };
      }

      setStats(statsData);
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (resolved, total) => {
    if (total === 0) return 0;
    return Math.round((resolved / total) * 100);
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className="statistics-section">
      <h2>Department Performance Statistics</h2>
      <p className="stats-subtitle">
        Track complaint resolution rates across all government departments
      </p>

      <div className="stats-grid">
        {Object.entries(stats).map(([category, data]) => {
          const percentage = calculatePercentage(data.resolved, data.total);
          return (
            <div key={category} className="stat-card">
              <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <div className="stat-numbers">
                <div className="stat-item">
                  <span className="stat-label">Total Complaints</span>
                  <span className="stat-value">{data.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Resolved</span>
                  <span className="stat-value resolved">{data.resolved}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending</span>
                  <span className="stat-value pending">{data.total - data.resolved}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
              </div>
              <p className="percentage-text">{percentage}% Resolution Rate</p>
            </div>
          );
        })}
      </div>

      <div className="overall-stats">
        <h3>Overall Performance</h3>
        <div className="overall-numbers">
          <div className="overall-item">
            <span className="overall-value">
              {Object.values(stats).reduce((sum, cat) => sum + cat.total, 0)}
            </span>
            <span className="overall-label">Total Complaints</span>
          </div>
          <div className="overall-item">
            <span className="overall-value">
              {Object.values(stats).reduce((sum, cat) => sum + cat.resolved, 0)}
            </span>
            <span className="overall-label">Total Resolved</span>
          </div>
          <div className="overall-item">
            <span className="overall-value">
              {calculatePercentage(
                Object.values(stats).reduce((sum, cat) => sum + cat.resolved, 0),
                Object.values(stats).reduce((sum, cat) => sum + cat.total, 0)
              )}
              %
            </span>
            <span className="overall-label">Overall Resolution Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;