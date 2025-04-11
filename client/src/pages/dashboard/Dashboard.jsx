import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import AssessmentContext from '../../context/assessment/assessmentContext';
import ComplianceStatus from '../../components/dashboard/ComplianceStatus';
import TaskList from '../../components/dashboard/TaskList';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const assessmentContext = useContext(AssessmentContext);
  
  const { user } = authContext;
  const { 
    assessment, 
    tasks, 
    loading, 
    getAssessment, 
    getTasks, 
    updateTaskStatus  // Make sure this is available in your context
  } = assessmentContext;
  
  useEffect(() => {
    getAssessment();
    getTasks();
    // eslint-disable-next-line
  }, []);
  
  // Enhanced toggle task function that actually updates the backend
  const handleToggleTask = async (taskId) => {
    try {
      // Find the current task to get its status
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      
      // Toggle the completed status
      const newStatus = !task.completed;
      
      // Call the context method to update in backend
      await updateTaskStatus(taskId, { completed: newStatus });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
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