import React from 'react';

const ComplianceStatus = ({ score, taskCompletionScore }) => {
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
  
  // Get color for task completion progress
  const getTaskColor = (score) => {
    if (score < 30) return 'var(--privacy-red)';
    if (score < 70) return 'var(--privacy-yellow)';
    return 'var(--privacy-green)';
  };
  
  const taskColor = getTaskColor(taskCompletionScore || 0);
  const taskGradient = taskCompletionScore >= 70
    ? 'linear-gradient(135deg, var(--privacy-green) 0%, var(--privacy-green-light) 100%)'
    : taskCompletionScore >= 30
      ? 'var(--gradient-warning)'
      : 'linear-gradient(135deg, var(--privacy-red) 0%, var(--privacy-orange) 100%)';
  
  return (
    <div className="privacy-card-security rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--privacy-indigo)' }}>
        Compliance Status
      </h2>
      
      <div className="flex items-center mb-4">
        <span className={`${badgeClass} mr-2`}>{statusText}</span>
      </div>
      
      {/* Assessment Score Progress */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Assessment Score</span>
          <span className="text-sm font-medium" style={{ color: statusColor }}>{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="h-4 rounded-full transition-all duration-500" 
            style={{ 
              width: `${score}%`,
              background: statusGradient
            }}
          ></div>
        </div>
      </div>
      
      {/* Task Completion Progress */}
      {taskCompletionScore !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Task Completion</span>
            <span className="text-sm font-medium" style={{ color: taskColor }}>{taskCompletionScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="h-4 rounded-full transition-all duration-500" 
              style={{ 
                width: `${taskCompletionScore}%`,
                background: taskGradient
              }}
            ></div>
          </div>
        </div>
      )}
      
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