'use client';

import React, { useState } from 'react';
import { Lock, Delete, X, ShieldCheck } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
  amountToken?: number;
  amountVnd?: number;
  isLoading?: boolean;
}

export default function PinModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác thực mã PIN thanh toán',
  amountToken = 0,
  amountVnd = 0,
  isLoading = false
}: PinModalProps) {
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 6) {
        onConfirm(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">Bảo Mật Giao Dịch</span>
          </div>
          <button
            onClick={() => {
              handleClear();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-100 text-center mb-1">{title}</h3>
        {amountToken > 0 && (
          <div className="text-center mb-6">
            <span className="text-2xl font-black text-emerald-400">
              {amountToken.toLocaleString('vi-VN')} Token
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              ≈ {amountVnd.toLocaleString('vi-VN')} VNĐ (Tỷ giá 1:10)
            </span>
          </div>
        )}

        {/* 6 Pin Dots */}
        <div className="flex items-center justify-center gap-3.5 mb-8">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50 scale-110'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isLoading}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 border border-slate-700/50 text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-md"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 text-slate-400 hover:text-slate-200 active:scale-95 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center"
          >
            Xóa hết
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 border border-slate-700/50 text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-md"
          >
            0
          </button>
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 text-slate-400 hover:text-rose-400 active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Mã PIN thử nghiệm mặc định: <span className="text-emerald-400 font-mono font-semibold">123456</span>
        </p>
      </div>
    </div>
  );
}
