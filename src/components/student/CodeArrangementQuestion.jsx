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
import { motion } from "framer-motion";

function SortableItem({ id, label, number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 mb-3 border-2 rounded-xl cursor-grab active:cursor-grabbing transition-all ${
        isDragging 
          ? 'border-cyan-500 bg-cyan-500/20 shadow-lg' 
          : 'border-slate-700/30 bg-slate-800/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 bg-blue-500/20 text-blue-300 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
          {number}
        </span>
        <code className="text-slate-300 text-sm font-mono flex-1">{label}</code>
      </div>
    </motion.div>
  );
}

export default function CodeArrangementQuestion({ question, onAnswer, userAnswer }) {
  const [items, setItems] = useState(userAnswer || []);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (question?.codeSnippets && !userAnswer) {
      // Shuffle only if no existing answer
      const shuffled = [...question.codeSnippets].sort(() => Math.random() - 0.5);
      const ids = shuffled.map((s) => s.id);
      setItems(ids);
      onAnswer(ids);
    }
  }, [question, userAnswer]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onAnswer(newItems);
    }
  };

  const resetOrder = () => {
    if (question?.codeSnippets) {
      const shuffled = [...question.codeSnippets].sort(() => Math.random() - 0.5);
      const ids = shuffled.map((s) => s.id);
      setItems(ids);
      onAnswer(ids);
    }
  };

  if (!question) return <div className="text-slate-400 text-center p-8">⚠️ Invalid question data</div>;

  return (
    <div className="space-y-6">
      <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
        <p className="font-medium mb-2">Instructions:</p>
        <p>Drag to arrange the code snippets in the correct order</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((id, index) => {
              const snippet = question.codeSnippets.find((s) => s.id === id);
              return (
                <SortableItem 
                  key={id} 
                  id={id} 
                  label={snippet?.code || "??"} 
                  number={index + 1}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-center">
        <button
          onClick={resetOrder}
          className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          Shuffle Order
        </button>
      </div>

      <p className="text-slate-400 text-sm text-center">
        💡 Drag and drop to rearrange the code snippets
      </p>
    </div>
  );
}