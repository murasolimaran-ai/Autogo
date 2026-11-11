/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#171717] text-white p-4 rounded-xl border border-neutral-800 shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === 'success' && (
            <div className="w-6 h-6 rounded-full bg-[#FFD43B] text-[#171717] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <CheckCircle2 size={16} />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-6 h-6 rounded-full bg-white text-[#171717] flex items-center justify-center shrink-0 mt-0.5">
              <Info size={16} />
            </div>
          )}
          {toast.type === 'warning' && (
            <div className="w-6 h-6 rounded-full bg-amber-400 text-[#171717] flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={16} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white tracking-tight leading-tight">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors shrink-0"
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
