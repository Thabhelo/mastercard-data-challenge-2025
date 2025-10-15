import React, { useState, useEffect } from 'react';
import TractComparisonDashboard from './components/TractComparisonDashboard';
import './App.css';

function App() {
  const [comparisonData, setComparisonData] = useState(null);
  const [tractData, setTractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const comparisonResponse = await fetch('/data/tract_comparison.json');
        const comparison = await comparisonResponse.json();
        setComparisonData(comparison);
        
        const csvResponse = await fetch('/data/igs_talladega_tracts.csv');
        const csvText = await csvResponse.text();
        setTractData(csvText);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Talladega County analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading data</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="error-container">
        <h2>No data available</h2>
        <p>Please check your data source.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="team-badge">Team Tornadoes</div>
        <h1>Talladega County Inequality Analysis</h1>
        <p className="subtitle">Reducing Income Inequality Through Strategic Interventions</p>
        <p className="focus-area">Focus: Census Tract 105 - Inclusive Growth Strategy</p>
      </header>

      <TractComparisonDashboard data={comparisonData} />
    </div>
  );
}

export default App;
