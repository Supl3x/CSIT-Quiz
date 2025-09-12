import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// -------- Sortable Item --------
function SortableItem({ id, label }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    marginBottom: "8px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#f9f9f9",
    cursor: "grab"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <code>{label}</code>
    </div>
  );
}

// -------- Main Component --------
export default function CodeArrangementQuestion({ question, onAnswer }) {
  const [items, setItems] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (question?.codeSnippets) {
      const shuffled = [...question.codeSnippets].sort(() => Math.random() - 0.5);
      const ids = shuffled.map((s) => s.id);
      setItems(ids);
      onAnswer?.(ids); // 🔥 Save initial state
    }
  }, [question]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      setIsCorrect(null);
      onAnswer?.(newItems); // 🔥 Update parent
    }
  };

  const checkAnswer = () => {
    if (!question?.correctOrder) return;
    const correctIds = question.correctOrder.map((s) => s.id);
    const isRight = JSON.stringify(items) === JSON.stringify(correctIds);
    setIsCorrect(isRight);
  };

  if (!question) return <p>⚠️ Invalid question data</p>;

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-4">{question.text}</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id) => {
            const snippet = question.codeSnippets.find((s) => s.id === id);
            return <SortableItem key={id} id={id} label={snippet?.code || "??"} />;
          })}
        </SortableContext>
      </DndContext>

      <div className="flex gap-3 mt-4">
        <button onClick={checkAnswer} className="bg-blue-500 text-white py-2 px-4 rounded-lg">
          Check Answer
        </button>
      </div>

      {isCorrect !== null && (
        <p className={`mt-3 font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
          {isCorrect ? "✅ Correct order!" : "❌ Incorrect order"}
        </p>
      )}
    </div>
  );
}

