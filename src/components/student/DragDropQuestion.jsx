import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function DraggableOption({ id, label }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = { transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "" };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}
      className="p-2 bg-blue-200 rounded cursor-move">
      {label}
    </div>
  );
}

function DroppableArea({ id, dropped }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`p-4 border rounded h-12 ${isOver ? "bg-green-200" : "bg-gray-100"}`}>
      {dropped || "Drop here"}
    </div>
  );
}

export default function DragDropQuestion({ question }) {
  const [answers, setAnswers] = useState({});
  
  const handleDrop = (event) => {
    setAnswers((prev) => ({ ...prev, [event.over.id]: event.active.id }));
  };

  return (
    <div>
      <p className="mb-4 font-semibold">{question.text}</p>
      <DndContext onDragEnd={handleDrop}>
        {question.pairs.map((pair, idx) => (
          <div key={idx} className="flex gap-4 mb-2">
            <span>{pair.left}</span>
            <DroppableArea id={pair.left} dropped={answers[pair.left]} />
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          {question.pairs.map((pair, idx) => (
            <DraggableOption key={idx} id={pair.right} label={pair.right} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
