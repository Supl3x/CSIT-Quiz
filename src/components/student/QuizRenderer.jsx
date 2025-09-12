import React from "react";
import DragDropQuestion from "./DragDropQuestion";
import FlowchartQuestion from "./FlowchartQuestion"; // Create this component
import CodeArrangementQuestion from "./CodeArrangementQuestion";

export default function QuizRenderer({ question, userAnswer, onAnswerChange }) {
  if (!question) return null;

  if (question.type === "mcq") {
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

  if (question.type === "dragdrop") {
    return (
      <DragDropQuestion
        question={question}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
      />
    );
  }

  if (question.type === "codearrangement") {
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
