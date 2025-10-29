import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";

function DraggableOption({ id, label }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = { transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "" };

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      style={style}
      className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 cursor-grab active:cursor-grabbing transition-all hover:border-cyan-500/50"
    >
      {label}
    </div>
  );
}

function DroppableArea({ id, dropped, label }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`p-4 border-2 rounded-lg min-h-[60px] flex items-center transition-all ${
        dropped 
          ? 'bg-green-500/20 border-green-500 text-green-300' 
          : isOver 
            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
            : 'bg-slate-800/30 border-slate-600 border-dashed text-slate-500'
      }`}
    >
      {dropped ? (
        <div className="flex items-center justify-between w-full">
          <span>{dropped}</span>
          <span className="text-sm opacity-70">✓</span>
        </div>
      ) : (
        <span className="opacity-70">{label}</span>
      )}
    </div>
  );
}

export default function DragDropQuestion({ question, onAnswer, userAnswer }) {
  const [answers, setAnswers] = useState(userAnswer || {});
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over) {
      const newAnswers = { ...answers };
      // Remove the item from its previous position if it exists
      Object.keys(newAnswers).forEach(key => {
        if (newAnswers[key] === active.id) {
          delete newAnswers[key];
        }
      });
      // Add to new position
      newAnswers[over.id] = active.id;
      setAnswers(newAnswers);
      onAnswer(newAnswers);
    }
  };

  const items = question.dragDropData?.items || [];
  const targets = question.dragDropData?.targets || [];

  const resetAnswers = () => {
    setAnswers({});
    onAnswer({});
  };

  // If question uses the new dragDropData structure
  if (question.dragDropData) {
  return (
    <div className="space-y-6">
      <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
        <p className="font-medium mb-2">Instructions:</p>
        <p>{question.dragDropData?.instruction || 'Drag items to their correct positions'}</p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Draggable Items */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-medium mb-3">Items:</h4>
            {question.dragDropData?.items?.map((item, index) => (
              <DraggableOption key={index} id={item} label={item} />
            ))}
          </div>

          {/* Drop Targets */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-medium mb-3">Targets:</h4>
            {question.dragDropData?.targets?.map((target, index) => (
              <div key={index} className="space-y-2">
                <span className="text-slate-400 text-sm">{target}:</span>
                <DroppableArea id={target} dropped={answers[target]} label={target} />
              </div>
            ))}
          </div>
        </div>
      </DndContext>

      <div className="flex justify-center">
        <button
          onClick={resetAnswers}
          className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          Reset Answers
        </button>
      </div>
    </div>
  );
}


  // If question uses the old pairs structure
  return (
    <div className="space-y-6">
      <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
        <p className="font-medium mb-2">Instructions:</p>
        <p>Drag the items from the right to match with their correct pairs on the left</p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {question.pairs.map((pair, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
            >
              <span className="text-slate-300 font-medium min-w-[120px]">{pair.left}</span>
              <span className="text-slate-500">→</span>
              <div className="flex-1">
                <DroppableArea 
                  id={pair.left} 
                  dropped={answers[pair.left]} 
                  label={pair.left}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
          <h4 className="text-cyan-400 font-medium mb-3">Drag from here:</h4>
          <div className="flex flex-wrap gap-3">
            {question.pairs.map((pair, idx) => (
              <DraggableOption 
                key={idx} 
                id={pair.right} 
                label={pair.right} 
              />
            ))}
          </div>
        </div>
      </DndContext>

      <div className="flex justify-center">
        <button
          onClick={resetAnswers}
          className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          Reset Answers
        </button>
      </div>
    </div>
  );
}