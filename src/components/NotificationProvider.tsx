"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// --- Types ---
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmState {
  isOpen: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

interface NotificationContextType {
  toast: (message: string, type: ToastType) => void;
  confirm: (message: string) => Promise<boolean>;
}

// --- Context ---
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useToast must be used within NotificationProvider");
  return { toast: context.toast };
}

export function useConfirm() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useConfirm must be used within NotificationProvider");
  return { confirm: context.confirm };
}

// --- Provider Component ---
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    resolve: null,
  });

  // --- Toast Logic ---
  const toast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    const duration = type === 'error' ? 6000 : 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Confirm Logic ---
  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        resolve,
      });
    });
  }, []);

  const handleConfirmAction = (result: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState({ isOpen: false, message: '', resolve: null });
  };

  // Close confirm on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmState.isOpen) {
        handleConfirmAction(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmState.isOpen]);

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}

      {/* --- Toast Portal --- */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 border shadow-lg max-w-sm w-full bg-white`}
              style={{
                borderColor: 
                  t.type === 'success' ? '#D4A373' : // copper
                  t.type === 'error' ? '#2A2A2A' : // charcoal
                  '#E3D5CA' // dust
              }}
            >
              <div className="mt-0.5 flex-shrink-0">
                {t.type === 'success' && <CheckCircle2 className="text-copper" size={20} />}
                {t.type === 'error' && <AlertCircle className="text-charcoal" size={20} />}
                {t.type === 'info' && <Info className="text-dust" size={20} />}
              </div>
              <div className="flex-1 text-sm font-light text-charcoal pr-4">
                {t.message}
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="text-dust hover:text-charcoal transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- Confirm Modal Portal --- */}
      <AnimatePresence>
        {confirmState.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirmAction(false)}
              className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
            />
            
            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white border border-dust/30 p-8 w-full max-w-md shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <h3 className="font-serif text-2xl text-charcoal mb-4">Are you sure?</h3>
              <p className="text-charcoal/80 font-light mb-8 text-sm leading-relaxed">
                {confirmState.message}
              </p>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleConfirmAction(false)}
                  className="px-6 py-3 border border-dust/30 text-charcoal text-xs uppercase tracking-widest hover:bg-dust/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmAction(true)}
                  className="px-6 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}
