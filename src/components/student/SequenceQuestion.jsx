import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 mb-2 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-slate-500
                 ${isDragging ? 'shadow-lg border-cyan-500/50' : 'hover:border-slate-500'}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-slate-400" />
      </div>
      <div className="flex-1 text-slate-200">{children}</div>
    </div>
  );
}

export default function SequenceQuestion({ question, userAnswer, onAnswerChange }) {
  const initialItems = question.sequenceData?.items || [];
  
  // Initialize items with question items if no user answer, or maintain user's order
  const [items, setItems] = useState(() => {
    if (userAnswer && Array.isArray(userAnswer)) {
      return userAnswer;
    }
    // Create a shuffled copy of the items for initial display
    return [...initialItems].sort(() => Math.random() - 0.5);
  });

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item === active.id);
      const newIndex = items.findIndex(item => item === over.id);

      const newItems = [...items];
      newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, active.id);
      setItems(newItems);
      onAnswerChange(newItems);
      newItems.splice(newIndex, 0, active.id);

      setItems(newItems);
      onAnswerChange({ sequence: newItems });
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">{question.text}</h3>
        <p className="text-slate-400">Arrange the items in the correct order:</p>
      </div>

      <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/30">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem key={item} id={item}>
                  {item}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const shuffled = [...items].sort(() => Math.random() - 0.5);
            setItems(shuffled);
            onAnswerChange(shuffled);
          }}
          className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          Shuffle Order
        </button>
      </div>
    </div>
  );
}