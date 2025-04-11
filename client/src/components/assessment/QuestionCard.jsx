import React from 'react';

const QuestionCard = ({ question, onAnswer, currentAnswer }) => {
  return (
    <div className="rounded-lg p-6 mb-4 shadow-sm">
      <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--privacy-indigo)' }}>
        {question.question}
      </h3>
      
      <div className="data-protection-box mb-3 text-sm">
        <p className="mb-2">
          <strong>Hint:</strong> {question.hint}
        </p>
        <p>
          <strong>Requirement:</strong> {question.requirement}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {question.options.map(option => (
          <button
            key={option}
            onClick={() => onAnswer(question.id, option)}
            className={
              currentAnswer === option
                ? 'btn-security'
                : 'btn-outline'
            }
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;