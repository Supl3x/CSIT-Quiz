import React, { useState, useEffect } from "react";
import { 
  DndContext, 
  useDraggable, 
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  KeyboardSensor
} from "@dnd-kit/core";
import { motion } from "framer-motion";

// Mobile-friendly tap-to-select component
function TappableOption({ id, label, isSelected, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(id)}
      className={`p-4 min-h-[60px] rounded-lg text-slate-300 transition-all cursor-pointer select-none border-2 ${
        isSelected 
          ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 shadow-lg scale-105' 
          : 'bg-slate-700/50 border-slate-600 hover:border-cyan-500/50 active:scale-95'
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {isSelected && <span className="text-cyan-400">✓ Selected</span>}
      </div>
    </div>
  );
}

// Mobile-friendly drop target with tap interaction
function TappableTarget({ id, dropped, label, onSelect, hasSelectedItem }) {
  return (
    <div 
      onClick={() => hasSelectedItem && onSelect(id)}
      className={`p-4 border-2 rounded-lg min-h-[60px] flex items-center transition-all ${
        dropped 
          ? 'bg-green-500/20 border-green-500 text-green-300' 
          : hasSelectedItem
            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 cursor-pointer hover:bg-cyan-500/20'
            : 'bg-slate-800/30 border-slate-600 border-dashed text-slate-500'
      }`}
    >
      {dropped ? (
        <div className="flex items-center justify-between w-full">
          <span>{dropped}</span>
          <span className="text-sm opacity-70">✓</span>
        </div>
      ) : hasSelectedItem ? (
        <span className="opacity-90">Tap to place selected item here</span>
      ) : (
        <span className="opacity-70">{label}</span>
      )}
    </div>
  );
}

function DraggableOption({ id, label }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = { 
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "",
    zIndex: isDragging ? 1000 : 'auto'
  };

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      style={style}
      className={`p-4 min-h-[60px] bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 cursor-grab active:cursor-grabbing transition-all hover:border-cyan-500/50 touch-manipulation select-none ${
        isDragging ? 'opacity-75 scale-105 shadow-2xl border-cyan-500' : ''
      }`}
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
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Detect if user is on mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Mobile-specific: Handle tap-to-select interaction
  const handleMobileItemSelect = (itemId) => {
    if (selectedItem === itemId) {
      setSelectedItem(null); // Deselect if clicking same item
    } else {
      setSelectedItem(itemId);
    }
  };

  const handleMobileTargetSelect = (targetId) => {
    if (selectedItem) {
      const newAnswers = { ...answers };
      // Remove the item from its previous position if it exists
      Object.keys(newAnswers).forEach(key => {
        if (newAnswers[key] === selectedItem) {
          delete newAnswers[key];
        }
      });
      // Add to new position
      newAnswers[targetId] = selectedItem;
      setAnswers(newAnswers);
      onAnswer(newAnswers);
      setSelectedItem(null); // Clear selection after placement
    }
  };

  // Configure sensors for both mouse (desktop) and touch (mobile) support
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
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
    // Mobile Interface - Tap to select and place
    if (isMobile) {
      return (
        <div className="space-y-6">
          <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
            <p className="font-medium mb-2">Instructions (Mobile):</p>
            <p>1. Tap an item to select it</p>
            <p>2. Tap a target area to place the selected item</p>
          </div>

          {selectedItem && (
            <div className="bg-cyan-500/20 border border-cyan-500/50 p-3 rounded-lg text-cyan-300 text-center">
              Selected: <strong>{selectedItem}</strong> - Now tap a target area to place it
            </div>
          )}

          <div className="space-y-6">
            {/* Tappable Items */}
            <div className="space-y-3">
              <h4 className="text-cyan-400 font-medium mb-3">Items (Tap to select):</h4>
              {question.dragDropData?.items?.filter(item => !Object.values(answers).includes(item)).map((item, index) => (
                <TappableOption 
                  key={index} 
                  id={item} 
                  label={item} 
                  isSelected={selectedItem === item}
                  onSelect={handleMobileItemSelect}
                />
              ))}
            </div>

            {/* Tappable Targets */}
            <div className="space-y-3">
              <h4 className="text-cyan-400 font-medium mb-3">Targets (Tap to place):</h4>
              {question.dragDropData?.targets?.map((target, index) => (
                <div key={index} className="space-y-2">
                  <span className="text-slate-400 text-sm">{target}:</span>
                  <TappableTarget 
                    id={target} 
                    dropped={answers[target]} 
                    label={target}
                    onSelect={handleMobileTargetSelect}
                    hasSelectedItem={!!selectedItem}
                  />
                </div>
              ))}
            </div>
          </div>

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

    // Desktop Interface - Drag and Drop
    return (
      <div className="space-y-6">
        <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
          <p className="font-medium mb-2">Instructions:</p>
          <p>{question.dragDropData?.instruction || 'Drag items to their correct positions'}</p>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
  // Mobile Interface for pairs
  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
          <p className="font-medium mb-2">Instructions (Mobile):</p>
          <p>1. Tap an item to select it</p>
          <p>2. Tap a target area to place the selected item</p>
        </div>

        {selectedItem && (
          <div className="bg-cyan-500/20 border border-cyan-500/50 p-3 rounded-lg text-cyan-300 text-center">
            Selected: <strong>{selectedItem}</strong> - Now tap a target area to place it
          </div>
        )}

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
                <TappableTarget 
                  id={pair.left} 
                  dropped={answers[pair.left]} 
                  label={pair.left}
                  onSelect={handleMobileTargetSelect}
                  hasSelectedItem={!!selectedItem}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
          <h4 className="text-cyan-400 font-medium mb-3">Items (Tap to select):</h4>
          <div className="flex flex-wrap gap-3">
            {question.pairs.filter(pair => !Object.values(answers).includes(pair.right)).map((pair, idx) => (
              <TappableOption 
                key={idx} 
                id={pair.right} 
                label={pair.right} 
                isSelected={selectedItem === pair.right}
                onSelect={handleMobileItemSelect}
              />
            ))}
          </div>
        </div>

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

  // Desktop Interface for pairs
  return (
    <div className="space-y-6">
      <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
        <p className="font-medium mb-2">Instructions:</p>
        <p>Drag the items from the right to match with their correct pairs on the left</p>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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