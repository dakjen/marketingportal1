import React from 'react';
import './OperationsBudgetPage.css';

function OperationsBudgetPage() {
  return (
    <div className="operations-budget-page">
      <h2>Operations Budget</h2>
      <div className="budget-columns-container">
        <div className="budget-column">
          <h3>Social Media Budget</h3>
          <p>Details for Social Media Budget...</p>
        </div>
        <div className="budget-column">
          <h3>Physical Marketing Budget</h3>
          <p>Details for Physical Marketing Budget...</p>
        </div>
        <div className="budget-column">
          <h3>Other Budget</h3>
          <p>Details for Other Budget...</p>
        </div>
      </div>
    </div>
  );
}

export default OperationsBudgetPage;