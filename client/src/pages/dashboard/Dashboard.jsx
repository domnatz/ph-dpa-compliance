import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import AssessmentContext from '../../context/assessment/assessmentContext';
import ComplianceStatus from '../../components/dashboard/ComplianceStatus';
import TaskList from '../../components/dashboard/TaskList';
import './dashboard.css';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const assessmentContext = useContext(AssessmentContext);
  
  const { user } = authContext;
  const { 
    assessment, 
    tasks, 
    complianceScore, // Add this to get the compliance score
    loading, 
    getAssessment, 
    getTasks, 
    toggleTask // Use toggleTask instead of updateTaskStatus
  } = assessmentContext;
  
  useEffect(() => {
    getAssessment();
    getTasks();
    // eslint-disable-next-line
  }, []);
  
  // Updated to use toggleTask which handles the compliance score recalculation
  const handleToggleTask = async (taskId) => {
    try {
      console.log(`Dashboard: Toggling task ${taskId}`);
      await toggleTask(taskId);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };
  
  // Function to determine color based on score
  const getScoreColor = (score) => {
    if (score < 30) return '#dc3545'; // Red for low compliance
    if (score < 70) return '#ffc107'; // Yellow for medium compliance
    return '#28a745'; // Green for high compliance
  };
  
  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.name}
      </h1>
      
      {!assessment ? (
        <div className="text-center py-12 data-protection-box">
          <p className="mb-4">You haven't completed an assessment yet.</p>
          <Link 
            to="/assessment" 
            className="btn-compliance"
          >
            Take Assessment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Compliance Progress Bar Card */}
          <div className="lg:col-span-2 mb-4">
            <div className="compliance-summary-card bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-3">Your Compliance Progress</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">0%</span>
                <span className="text-sm text-gray-600">50%</span>
                <span className="text-sm text-gray-600">100%</span>
              </div>
              <div className="progress-bar bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="progress-fill h-full transition-all duration-500 ease-in-out"
                  style={{ 
                    width: `${complianceScore}%`,
                    backgroundColor: getScoreColor(complianceScore)
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="font-semibold text-lg" style={{ color: getScoreColor(complianceScore) }}>
                  {complianceScore}% Complete
                </p>
                {complianceScore < 100 && (
                  <p className="text-sm text-gray-600">
                    Complete all remaining tasks to achieve full compliance
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <ComplianceStatus score={assessment.score} />
          <TaskList tasks={tasks} onToggleTask={handleToggleTask} />
          
          <div className="lg:col-span-2 mt-4">
            <h2 className="text-xl font-bold mb-4">Next Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="privacy-card-compliance">
                <h3 className="font-semibold mb-2">Download Resources</h3>
                <p className="mb-4">Access templates and guides to help your compliance journey.</p>
                <span className="compliance-badge mb-3">PhilDPA Resources</span>
                <Link 
                  to="/resources" 
                  className="btn-compliance block mt-4 text-center"
                >
                  View Resources
                </Link>
              </div>
              
              <div className="privacy-card-security">
                <h3 className="font-semibold mb-2">Retake Assessment</h3>
                <p className="mb-4">Update your answers as you implement compliance measures.</p>
                <span className="dpa-badge mb-3">Assessment Tool</span>
                <Link 
                  to="/assessment" 
                  className="btn-security block mt-4 text-center"
                >
                  Start Assessment
                </Link>
              </div>
              
              <div className="privacy-card-warning">
                <h3 className="font-semibold mb-2">Get Support</h3>
                <p className="mb-4">Need help with compliance? Contact our support team.</p>
                <span className="warning-badge mb-3">Support Available</span>
                <a 
                  href="mailto:support@phildpa.com" 
                  className="btn-warning block mt-4 text-center"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;