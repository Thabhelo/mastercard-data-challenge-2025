import React from 'react';

const FilterPanel = ({ 
  tracts, 
  metrics, 
  years, 
  selectedTract, 
  selectedMetric, 
  yearRange, 
  onTractChange, 
  onMetricChange, 
  onYearRangeChange 
}) => {
  return (
    <div className="filter-panel">
      <h3>Filter Controls</h3>
      
      <div className="filter-group">
        <label htmlFor="tract-select">Select Census Tract:</label>
        <select 
          id="tract-select"
          value={selectedTract} 
          onChange={(e) => onTractChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Tracts</option>
          {tracts.map(tract => (
            <option key={tract} value={tract}>
              Tract {tract}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="metric-select">Select Metric:</label>
        <select 
          id="metric-select"
          value={selectedMetric} 
          onChange={(e) => onMetricChange(e.target.value)}
          className="filter-select"
        >
          {metrics.map(metric => (
            <option key={metric.key} value={metric.key}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="year-range">Year Range: {yearRange[0]} - {yearRange[1]}</label>
        <div className="range-inputs">
          <input
            type="range"
            min={years[0]}
            max={years[years.length - 1]}
            value={yearRange[0]}
            onChange={(e) => onYearRangeChange([parseInt(e.target.value), yearRange[1]])}
            className="range-slider"
          />
          <input
            type="range"
            min={years[0]}
            max={years[years.length - 1]}
            value={yearRange[1]}
            onChange={(e) => onYearRangeChange([yearRange[0], parseInt(e.target.value)])}
            className="range-slider"
          />
        </div>
        <div className="range-labels">
          <span>{yearRange[0]}</span>
          <span>{yearRange[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;