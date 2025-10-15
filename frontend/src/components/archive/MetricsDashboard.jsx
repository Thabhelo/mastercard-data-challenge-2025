import React from 'react';

const MetricsDashboard = ({ stats, metric }) => {
  if (!stats) {
    return (
      <div className="metrics-dashboard">
        <h3>Key Metrics</h3>
        <p>No data available</p>
      </div>
    );
  }

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}`;
  };

  const getChangeClass = (change) => {
    return change >= 0 ? 'positive' : 'negative';
  };

  return (
    <div className="metrics-dashboard">
      <h3>Key Metrics</h3>
      
      <div className="metric-cards">
        <div className="metric-card">
          <div className="metric-value">{stats.average.toFixed(1)}</div>
          <div className="metric-label">Average {metric}</div>
        </div>

        <div className="metric-card">
          <div className={`metric-value ${getChangeClass(stats.yoyChange)}`}>
            {formatChange(stats.yoyChange)}
          </div>
          <div className="metric-label">Year-over-Year Change</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{stats.max.toFixed(1)}</div>
          <div className="metric-label">Highest Score</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{stats.min.toFixed(1)}</div>
          <div className="metric-label">Lowest Score</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{stats.totalTracts}</div>
          <div className="metric-label">Total Tracts</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{stats.opportunityZones}</div>
          <div className="metric-label">Opportunity Zones</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;