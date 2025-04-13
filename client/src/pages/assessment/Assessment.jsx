import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../../components/assessment/QuestionCard';
import ProgressBar from '../../components/assessment/ProgressBar';
import AuthContext from '../../context/auth/authContext';
import AssessmentContext from '../../context/assessment/assessmentContext';

const questions = [
  {
    id: 1,
    question: "Have you appointed a Data Protection Officer (DPO)?",
    options: ["Yes", "No", "Not Sure"],
    hint: "The DPO oversees data protection strategies and ensures compliance with the DPA.",
    requirement: "Mandatory for all personal information controllers and processors."
  },
  {
    id: 2,
    question: "Do you have a Privacy Notice for your customers/users?",
    options: ["Yes", "No", "Partially"],
    hint: "Privacy notices inform individuals about how their data is collected and used.",
    requirement: "Required before collecting personal information."
  },
  {
    id: 3,
    question: "Have you registered your data processing systems with the NPC?",
    options: ["Yes", "No", "In Progress"],
    hint: "Registration is required for systems processing personal data.",
    requirement: "Mandatory for systems with sensitive personal information."
  },
  {
    id: 4,
    question: "Do you have data breach notification procedures?",
    options: ["Yes", "No", "Partially"],
    hint: "Procedures to notify affected individuals and the NPC in case of a breach.",
    requirement: "Must notify within 72 hours of discovery."
  },
  {
    id: 5,
    question: "Do you have consent mechanisms for data collection?",
    options: ["Yes", "No", "Partially"],
    hint: "Methods to obtain informed consent before collecting personal data.",
    requirement: "Consent must be freely given, specific, and informed."
  }
];

const Assessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const assessmentContext = useContext(AssessmentContext);
  
  const { isAuthenticated } = authContext;
  const { assessment, submitAssessment, generateTasks } = assessmentContext;
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    // Pre-fill answers if assessment exists
    if (assessment) {
      const existingAnswers = {};
      assessment.answers.forEach(a => {
        existingAnswers[a.questionId] = a.answer;
      });
      setAnswers(existingAnswers);
    }
    
    // Check for query parameters (for new assessments)
    const params = new URLSearchParams(window.location.search);
    const isNewAssessment = params.get('new') === 'true';
    
    if (isNewAssessment) {
      // Clear any existing answers if starting a new assessment
      setAnswers({});
      setCurrentQuestion(0);
      setIsComplete(false);
    }
  }, [isAuthenticated, navigate, assessment]);
  
  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNext = () => {
    // Ensure the current question has been answered
    if (!answers[questions[currentQuestion].id]) {
      // Could add validation/notification here
      return;
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };
  
  const handleSubmit = async () => {
    try {
      // Include both questionId and question text when formatting answers
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        return {
          questionId: parseInt(questionId),
          question: question ? question.question : `Question ${questionId}`,
          answer
        };
      });
      
     
      
      await submitAssessment(formattedAnswers);
      await generateTasks();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="compliance-section mb-8 px-8">
        <h1 className="text-3xl font-bold mb-6">PhilDPA Compliance Assessment</h1>
        <p className="text-lg">
          This assessment will help identify your organization's compliance with the Philippine Data Privacy Act.
          Answer all questions to receive a personalized action plan.
        </p>
      </div>
      
      <ProgressBar percentage={calculateProgress()} />
      
      {!isComplete ? (
        <>
          <div className="privacy-card-compliance mt-8">
            <QuestionCard 
              question={questions[currentQuestion]} 
              onAnswer={handleAnswer}
              currentAnswer={answers[questions[currentQuestion].id]}
            />
          </div>
          
          <div className="flex justify-between mt-4">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={currentQuestion === 0 ? 'bg-gray-300 cursor-not-allowed px-4 py-2 rounded' : 'btn-secondary'}
            >
              Previous
            </button>
            
            <button 
              onClick={handleNext}
              className="btn-compliance"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      ) : (
        <div className="security-section text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Assessment Complete!</h2>
          <p className="mb-6">Thank you for completing the assessment. Submit to view your results and get personalized compliance tasks.</p>
          <button 
            onClick={handleSubmit}
            className="btn-security"
          >
            Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default Assessment;