import React from 'react';
import './StrategyPillarsView.css';

function StrategyPillarsView({ pillars }) {
  const pillarConfig = {
    digital_infrastructure: {
      title: 'Digital Infrastructure',
      icon: 'DI',
      color: '#3b82f6'
    },
    workforce_development: {
      title: 'Workforce Development',
      icon: 'WD',
      color: '#8b5cf6'
    },
    entrepreneurship: {
      title: 'Entrepreneurship',
      icon: 'EN',
      color: '#ec4899'
    },
    housing_transportation: {
      title: 'Housing & Transportation',
      icon: 'HT',
      color: '#f59e0b'
    },
    health_wellbeing: {
      title: 'Health & Wellbeing',
      icon: 'HW',
      color: '#10b981'
    },
    policy_income: {
      title: 'Policy & Income',
      icon: 'PI',
      color: '#6366f1'
    }
  };

  const calculatePriorityLevel = (metrics) => {
    const gaps = Object.values(metrics).filter(v => v !== null);
    if (gaps.length === 0) return 'low';
    
    const avgGap = Math.abs(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    if (avgGap >= 30) return 'high';
    if (avgGap >= 15) return 'medium';
    return 'low';
  };

  return (
    <div className="strategy-pillars-grid">
      {Object.entries(pillars).map(([key, pillar]) => {
        const config = pillarConfig[key];
        const priority = calculatePriorityLevel(pillar.metrics);
        const hasData = Object.values(pillar.metrics).some(v => v !== null);
        
        return (
          <div 
            key={key} 
            className={`pillar-card priority-${priority}`}
            style={{ borderLeftColor: config.color }}
          >
            <div className="pillar-header">
              <span className="pillar-icon">{config.icon}</span>
              <h3>{config.title}</h3>
              <span className={`priority-badge priority-${priority}`}>
                {priority.toUpperCase()} PRIORITY
              </span>
            </div>
            
            <p className="pillar-description">{pillar.description}</p>
            
            <div className="metrics-list">
              {Object.entries(pillar.metrics).map(([metricName, gap]) => {
                if (gap === null) return null;
                
                const gapDirection = gap > 0 ? 'positive' : 'negative';
                const gapAbs = Math.abs(gap);
                
                return (
                  <div key={metricName} className="metric-row">
                    <span className="metric-name">{metricName}</span>
                    <div className="gap-bar-container">
                      <div 
                        className={`gap-bar ${gapDirection}`}
                        style={{ 
                          width: `${Math.min(gapAbs, 100)}%`,
                          backgroundColor: config.color 
                        }}
                      />
                      <span className={`gap-value ${gapDirection}`}>
                        {gap > 0 ? '+' : ''}{gap.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {!hasData && (
                <p className="no-data-message">No comparison data available yet</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StrategyPillarsView;

