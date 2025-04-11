import React from 'react';

const ProgressBar = ({ percentage }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium" style={{ color: 'var(--privacy-blue)' }}>
          Assessment Progress
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--privacy-blue)' }}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full"
          style={{ 
            width: `${percentage}%`,
            background: 'var(--gradient-compliance)'
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;