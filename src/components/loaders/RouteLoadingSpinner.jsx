import React from 'react';
import './route-loading-spinner.css';

const RouteLoadingSpinner = () => {
  return (
    <div className="route-loader-container">
      <div className="route-loader-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default RouteLoadingSpinner;
