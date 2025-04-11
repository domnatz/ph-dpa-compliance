import React from 'react';

const ComplianceStatus = ({ score }) => {
  let statusColor, statusGradient, statusText, badgeClass;
  
  if (score >= 80) {
    statusColor = 'var(--privacy-green)';
    statusGradient = 'linear-gradient(135deg, var(--privacy-green) 0%, var(--privacy-green-light) 100%)';
    statusText = 'Compliant';
    badgeClass = 'security-badge';
  } else if (score >= 50) {
    statusColor = 'var(--privacy-yellow)';
    statusGradient = 'var(--gradient-warning)';
    statusText = 'Partially Compliant';
    badgeClass = 'warning-badge';
  } else {
    statusColor = 'var(--privacy-red)';
    statusGradient = 'linear-gradient(135deg, var(--privacy-red) 0%, var(--privacy-orange) 100%)';
    statusText = 'High Risk';
    badgeClass = 'alert-badge';
  }
  
  return (
    <div className="privacy-card-security rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--privacy-indigo)' }}>
        Compliance Status
      </h2>
      
      <div className="flex items-center mb-4">
        <span className={`${badgeClass} mr-2`}>{statusText}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="h-4 rounded-full" 
          style={{ 
            width: `${score}%`,
            background: statusGradient
          }}
        ></div>
      </div>
      
      <div className="text-right mt-2 text-sm font-medium" style={{ color: statusColor }}>{score}% Complete</div>
      
      <div className="mt-4 text-sm text-gray-600">
        {score < 50 && (
          <p>Your organization has significant compliance gaps. Complete the recommended tasks to improve compliance.</p>
        )}
        {score >= 50 && score < 80 && (
          <p>You're making good progress! Continue implementing the recommended tasks to achieve full compliance.</p>
        )}
        {score >= 80 && (
          <p>Great job! Your organization is well-positioned for PhilDPA compliance. Maintain these practices.</p>
        )}
      </div>
    </div>
  );
};

export default ComplianceStatus;