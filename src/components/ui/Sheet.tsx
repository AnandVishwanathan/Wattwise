import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: SheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-xl z-50 max-h-[90vh] flex flex-col pt-sm pb-xl px-md shadow-raised"
          >
            <div className="flex justify-center mb-md">
              <div className="w-12 h-1 bg-border rounded-full" />
            </div>
            <div className="flex items-center justify-between mb-lg">
              <h2 className="text-h2">{title}</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-primary touch-target rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto w-full no-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
