'use client';

import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, X } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';

export default function DraggableWidget({ id, children, isFullWidth = false }) {
  const { editMode, removeWidget } = useFinanceStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isFullWidth ? '' : ''} ${
        isDragging ? 'rounded-2xl' : ''
      }`}
    >
      {editMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none"
        >
          <div
            {...attributes}
            {...listeners}
            className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-xl cursor-grab active:cursor-grabbing transition-colors duration-200"
            style={{
              background: 'rgba(99,102,241,0.9)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <GripVertical className="w-4 h-4 text-white" />
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => removeWidget(id)}
            className="pointer-events-auto hidden md:flex items-center justify-center w-8 h-8 rounded-xl transition-colors duration-200 opacity-0 group-hover:opacity-100"
            style={{
              background: 'rgba(244,63,94,0.9)',
              boxShadow: '0 2px 8px rgba(244,63,94,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      )}

      {isOver && editMode && (
        <div
          className="absolute -top-2 left-4 right-4 h-1 rounded-full z-30"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
          }}
        />
      )}

      <div className={editMode ? 'rounded-2xl ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-transparent dark:ring-offset-transparent transition-all duration-200' : ''}>
        {children}
      </div>
    </div>
  );
}
