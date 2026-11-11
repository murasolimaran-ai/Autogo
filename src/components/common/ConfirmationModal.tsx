/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-white border border-[#171717] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {isDestructive ? (
              <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-[#171717] shrink-0">
                <AlertTriangle size={20} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#FFD43B] flex items-center justify-center text-[#171717] shrink-0 font-bold">
                !
              </div>
            )}
            <h3 className="text-lg font-bold text-[#171717] tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-neutral-500 hover:text-[#171717] p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-[#171717] text-white hover:bg-neutral-800'
                : 'bg-[#FFD43B] text-[#171717] hover:bg-[#ebd436]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
