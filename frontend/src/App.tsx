import React, { useState, useEffect } from 'react';
import './App.css';

interface ContributionData {
  type: 'percentage' | 'dollar';
  rate: number;
  userData: {
    age: number;
    salary: number;
    paychecksPerYear: number;
    currentYTD: number;
  };
}

interface ProjectionData {
  projectedSavings: number;
  yearsToRetirement: number;
  annualContribution: number;
  perPaycheckContribution: number;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [contributionType, setContributionType] = useState<'percentage' | 'dollar'>('percentage');
  const [contributionRate, setContributionRate] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [userData, setUserData] = useState<ContributionData['userData'] | null>(null);
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load current contribution settings
  useEffect(() => {
    const loadContribution = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/contribution`);
        if (!response.ok) throw new Error('Failed to load contribution data');
        const data: ContributionData = await response.json();
        setContributionType(data.type);
        setContributionRate(data.rate);
        setUserData(data.userData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadContribution();
  }, []);

  // Load projection when contribution changes
  useEffect(() => {
    if (!userData) return;

    const loadProjection = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/projection?type=${contributionType}&rate=${contributionRate}&age=${userData.age}`
        );
        if (!response.ok) throw new Error('Failed to load projection');
        const data: ProjectionData = await response.json();
        setProjection(data);
      } catch (err) {
        console.error('Failed to load projection:', err);
      }
    };

    loadProjection();
  }, [contributionType, contributionRate, userData]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/contribution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contributionType,
          rate: contributionRate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save contribution');
      }

      const data = await response.json();
      if (data.success) {
        alert('Contribution settings saved successfully!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="app">
        <div className="container">
          <div className="error">Failed to load user data</div>
        </div>
      </div>
    );
  }

  const maxRate = contributionType === 'percentage' ? 100 : userData.salary;
  const paycheckAmount = userData.salary / userData.paychecksPerYear;
  const currentPerPaycheck = contributionType === 'percentage'
    ? paycheckAmount * (contributionRate / 100)
    : contributionRate;

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>401(k) Contribution Manager</h1>
          <p className="subtitle">Manage your retirement savings contributions</p>
        </header>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="card">
          <h2>Year-to-Date Contributions</h2>
          <div className="ytd-display">
            <div className="ytd-amount">{formatCurrency(userData.currentYTD)}</div>
            <div className="ytd-label">Contributed this year</div>
          </div>
        </div>

        <div className="card">
          <h2>Contribution Type</h2>
          <div className="type-selector">
            <button
              className={`type-button ${contributionType === 'percentage' ? 'active' : ''}`}
              onClick={() => setContributionType('percentage')}
            >
              Percentage of Paycheck
            </button>
            <button
              className={`type-button ${contributionType === 'dollar' ? 'active' : ''}`}
              onClick={() => setContributionType('dollar')}
            >
              Fixed Dollar Amount
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Contribution Rate</h2>
          <div className="rate-input-container">
            <div className="rate-display">
              {contributionType === 'percentage' ? (
                <>
                  <span className="rate-value">{contributionRate}%</span>
                  <span className="rate-description">
                    = {formatCurrency(currentPerPaycheck)} per paycheck
                  </span>
                </>
              ) : (
                <>
                  <span className="rate-value">{formatCurrency(contributionRate)}</span>
                  <span className="rate-description">per paycheck</span>
                </>
              )}
            </div>
            <input
              type="range"
              min="0"
              max={maxRate}
              step={contributionType === 'percentage' ? 0.1 : 10}
              value={contributionRate}
              onChange={(e) => setContributionRate(parseFloat(e.target.value))}
              className="rate-slider"
            />
            <div className="rate-input-wrapper">
              <input
                type="number"
                min="0"
                max={maxRate}
                step={contributionType === 'percentage' ? 0.1 : 10}
                value={contributionRate}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= maxRate) {
                    setContributionRate(value);
                  }
                }}
                className="rate-input"
              />
              <span className="rate-unit">
                {contributionType === 'percentage' ? '%' : '$'}
              </span>
            </div>
          </div>
        </div>

        {projection && (
          <div className="card impact-card">
            <h2>Retirement Impact</h2>
            <div className="impact-content">
              <div className="impact-stat">
                <div className="impact-label">Projected Savings at Age 65</div>
                <div className="impact-value">{formatCurrency(projection.projectedSavings)}</div>
              </div>
              <div className="impact-details">
                <div className="impact-row">
                  <span>Annual Contribution:</span>
                  <span>{formatCurrency(projection.annualContribution)}</span>
                </div>
                <div className="impact-row">
                  <span>Per Paycheck:</span>
                  <span>{formatCurrency(projection.perPaycheckContribution)}</span>
                </div>
                <div className="impact-row">
                  <span>Years to Retirement:</span>
                  <span>{projection.yearsToRetirement} years</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Contribution Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

