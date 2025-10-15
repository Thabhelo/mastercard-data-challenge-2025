import React, { useState } from 'react';
import TimeSeriesComparison from './TimeSeriesComparison';
import StrategyPillarsView from './StrategyPillarsView';
import InterventionRecommendations from './InterventionRecommendations';
import './TractComparisonDashboard.css';

function TractComparisonDashboard({ data }) {
  const [selectedYear, setSelectedYear] = useState(2024);
  
  const { tract_105, tract_1100, strategic_pillars, time_series } = data;
  
  const igsGap = tract_1100.igs.latest - tract_105.igs.latest;
  const belowThreshold = tract_105.igs.latest < 45;

  return (
    <div className="tract-comparison-dashboard">
      <section className="overview-section">
        <div className="tract-cards">
          <div className="tract-card tract-105">
            <div className="tract-header">
              <h2>Census Tract 105</h2>
              <span className="fips-code">{tract_105.fips}</span>
            </div>
            <div className="igs-score">
              <span className="score-value">{tract_105.igs.latest}</span>
              <span className="score-label">IGS Score</span>
            </div>
            <div className="tract-stats">
              <div className="stat">
                <span className="stat-label">Growth</span>
                <span className="stat-value">{tract_105.growth.latest}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Inclusion</span>
                <span className="stat-value">{tract_105.inclusion.latest}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Gini Coefficient</span>
                <span className="stat-value">{tract_105.gini_coefficient.latest || 'N/A'}</span>
              </div>
            </div>
            {belowThreshold && (
              <div className="alert-banner">
                Below 45 threshold - Intervention needed
              </div>
            )}
          </div>

          <div className="comparison-arrow">
            <div className="gap-indicator">
              <span className="gap-label">IGS Gap</span>
              <span className="gap-value">{igsGap.toFixed(1)} points</span>
              <div className="gap-explanation">
                Tract 1100 outperforms Tract 105 by {igsGap.toFixed(1)} points on the Inclusive Growth Score
              </div>
            </div>
            <div className="project-explanation">
              <h4>Project Overview</h4>
              <p>We analyze income inequality in Talladega County by comparing Census Tract 105 (IGS: 23) with Tract 1100 (IGS: 50) to identify evidence-based interventions that can raise inclusive growth scores above the 45 threshold.</p>
            </div>
          </div>

          <div className="tract-card tract-1100">
            <div className="tract-header">
              <h2>Census Tract 1100</h2>
              <span className="fips-code">{tract_1100.fips}</span>
            </div>
            <div className="igs-score above-threshold">
              <span className="score-value">{tract_1100.igs.latest}</span>
              <span className="score-label">IGS Score</span>
            </div>
            <div className="tract-stats">
              <div className="stat">
                <span className="stat-label">Growth</span>
                <span className="stat-value">{tract_1100.growth.latest}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Inclusion</span>
                <span className="stat-value">{tract_1100.inclusion.latest}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Gini Coefficient</span>
                <span className="stat-value">{tract_1100.gini_coefficient.latest || 'N/A'}</span>
              </div>
            </div>
            <div className="success-banner">
              Above 45 threshold
            </div>
          </div>
        </div>
      </section>

      <section className="time-series-section">
        <h2>IGS Trends (2017-2024)</h2>
        <TimeSeriesComparison data={time_series} />
      </section>

      <section className="pillars-section">
        <h2>Strategic Intervention Pillars</h2>
        <StrategyPillarsView pillars={strategic_pillars} />
      </section>

      <section className="recommendations-section">
        <h2>Recommended Interventions</h2>
        <InterventionRecommendations 
          pillars={strategic_pillars} 
          tract105={tract_105}
          tract1100={tract_1100}
        />
      </section>
    </div>
  );
}

export default TractComparisonDashboard;

