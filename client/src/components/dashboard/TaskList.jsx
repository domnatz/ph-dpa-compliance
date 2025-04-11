import React from 'react';

const TaskList = ({ tasks, onToggleTask }) => {
  return (
    <div className="privacy-card-compliance rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--privacy-teal)' }}>
        Compliance Tasks
      </h2>
      
      {tasks.length === 0 ? (
        <div className="data-protection-box text-center py-4">
          <p className="text-gray-600">No tasks available. Complete the assessment to generate tasks.</p>
          <button className="btn-compliance mt-3">Take Assessment</button>
        </div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task._id} className="flex items-start p-3 rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1 mr-3">
                <div
                  onClick={() => onToggleTask(task._id)}
                  className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center ${
                    task.completed 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {task.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.text}
                </p>
                <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
                {!task.completed && (
                  <span className="compliance-badge text-xs mt-2">Required for Compliance</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;