import React, { useState } from 'react';
import './TimeSeriesComparison.css';

function TimeSeriesComparison({ data }) {
  const { years, tract_105_igs, tract_1100_igs } = data;
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const maxIGS = Math.max(...tract_105_igs, ...tract_1100_igs, 50);
  const minIGS = Math.min(...tract_105_igs, ...tract_1100_igs, 0);
  const range = maxIGS - minIGS;
  
  const getYPosition = (value) => {
    return 100 - ((value - minIGS) / range * 100);
  };

  const points105 = years.map((year, i) => ({
    x: (i / (years.length - 1)) * 100,
    y: getYPosition(tract_105_igs[i]),
    year,
    value: tract_105_igs[i],
    tract: '105'
  }));

  const points1100 = years.map((year, i) => ({
    x: (i / (years.length - 1)) * 100,
    y: getYPosition(tract_1100_igs[i]),
    year,
    value: tract_1100_igs[i],
    tract: '1100'
  }));

  const pathData105 = points105.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const pathData1100 = points1100.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const thresholdY = getYPosition(45);

  const handlePointClick = (point) => {
    setSelectedPoint(point);
  };

  const handlePointHover = (point) => {
    setHoveredPoint(point);
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="time-series-comparison">
      <div className="chart-container">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-svg">
          <line 
            x1="0" 
            y1={thresholdY} 
            x2="100" 
            y2={thresholdY} 
            className="threshold-line"
          />
          
          <path 
            d={pathData105} 
            className="line-tract-105"
            fill="none"
            strokeWidth="0.5"
          />
          
          <path 
            d={pathData1100} 
            className="line-tract-1100"
            fill="none"
            strokeWidth="0.5"
          />
        </svg>
        
        <div className="chart-overlay">
          {points105.map((point, i) => (
            <div 
              key={`105-${i}`}
              className={`data-point tract-105-point ${selectedPoint === point ? 'selected' : ''} ${hoveredPoint === point ? 'hovered' : ''}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => handlePointClick(point)}
              onMouseEnter={() => handlePointHover(point)}
              onMouseLeave={handlePointLeave}
            />
          ))}
          
          {points1100.map((point, i) => (
            <div 
              key={`1100-${i}`}
              className={`data-point tract-1100-point ${selectedPoint === point ? 'selected' : ''} ${hoveredPoint === point ? 'hovered' : ''}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => handlePointClick(point)}
              onMouseEnter={() => handlePointHover(point)}
              onMouseLeave={handlePointLeave}
            />
          ))}
        </div>
      </div>
      
      {selectedPoint && (
        <div className="tooltip">
          <div className="tooltip-content">
            <strong>Census Tract {selectedPoint.tract}</strong>
            <div>Year: {selectedPoint.year}</div>
            <div>IGS Score: {selectedPoint.value.toFixed(1)}</div>
            <button 
              className="close-tooltip"
              onClick={() => setSelectedPoint(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-marker tract-105"></span>
          <span>Tract 105 (Target)</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker tract-1100"></span>
          <span>Tract 1100 (Comparison)</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker threshold"></span>
          <span>45 Threshold</span>
        </div>
      </div>
      
      <div className="x-axis">
        {years.map((year, i) => (
          <span key={year} className="x-label" style={{ left: `${(i / (years.length - 1)) * 100}%` }}>
            {year}
          </span>
        ))}
      </div>
      
      <div className="y-axis-label">IGS Score</div>
      <div className="y-axis-ticks">
        <div className="y-tick">{maxIGS.toFixed(0)}</div>
        <div className="y-tick">{((maxIGS + minIGS) / 2).toFixed(0)}</div>
        <div className="y-tick">{minIGS.toFixed(0)}</div>
      </div>
    </div>
  );
}

export default TimeSeriesComparison;

