import React from "react";
import DragDropQuestion from "./DragDropQuestion";
import FlowchartQuestion from "./FlowchartQuestion";
import CodeArrangementQuestion from "./CodeArrangementQuestion";

export default function QuizRenderer({ question, userAnswer, onAnswerChange }) {
  if (!question) return null;

  if (question.type === "multiple-choice") {
    return (
      <div>
        <p className="font-semibold mb-2">{question.text}</p>
        {question.options.map((opt, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="radio"
              name={question.id}
              value={opt}
              checked={userAnswer === idx}
              onChange={() => onAnswerChange(idx)}
            />
            <label>{opt}</label>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "drag-drop") {
    return (
      <DragDropQuestion
        question={question}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
      />
    );
  }



  if (question.type === "true-false") {
    return (
      <div>
        <p className="font-semibold mb-2">{question.text}</p>
        <div className="flex gap-4">
          <div className="flex gap-2 items-center">
            <input
              type="radio"
              name={question.id}
              value="true"
              checked={userAnswer === true}
              onChange={() => onAnswerChange(true)}
            />
            <label>True</label>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="radio"
              name={question.id}
              value="false"
              checked={userAnswer === false}
              onChange={() => onAnswerChange(false)}
            />
            <label>False</label>
          </div>
        </div>
      </div>
    );
  }

  if (question.type === "code-arrangement") {
    return (
      <CodeArrangementQuestion
        question={question}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
      />
    );
  }

  if (question.type === "flowchart") {
    return (
      <FlowchartQuestion
        question={question}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
      />
    );
  }

  return null;
}
