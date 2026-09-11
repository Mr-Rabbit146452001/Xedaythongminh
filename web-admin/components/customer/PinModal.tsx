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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-t sm:border border-[#E0E0E0] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl flex flex-col items-center text-[#1A1A1A]">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#0D47A1]">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <span className="text-xs font-black tracking-wider uppercase">Bảo Mật Giao Dịch FinTech</span>
          </div>
          <button
            onClick={() => {
              handleClear();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-[#0D47A1] hover:bg-gray-100 transition-colors active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-black text-[#0D47A1] text-center mb-1">{title}</h3>
        {amountToken > 0 && (
          <div className="text-center mb-6">
            <span className="text-2xl font-black text-[#0D47A1] font-mono">
              {amountToken.toLocaleString('vi-VN')} Token
            </span>
            <span className="block text-xs text-[#666666] mt-0.5 font-mono font-medium">
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
                    ? 'bg-[#0D47A1] shadow-md scale-110'
                    : 'bg-gray-200 border border-gray-300'
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
              className="h-14 rounded-2xl bg-[#E3F2FD] hover:bg-blue-100 active:scale-95 border border-blue-200 text-xl font-black font-mono text-[#0D47A1] transition-all flex items-center justify-center shadow-sm select-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleClear}
            className="h-14 rounded-2xl bg-gray-100 text-[#666666] hover:text-[#1A1A1A] active:scale-95 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center select-none"
          >
            Xóa hết
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-[#E3F2FD] hover:bg-blue-100 active:scale-95 border border-blue-200 text-xl font-black font-mono text-[#0D47A1] transition-all flex items-center justify-center shadow-sm select-none"
          >
            0
          </button>
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-gray-100 text-[#666666] hover:text-[#D32F2F] active:scale-95 transition-all flex items-center justify-center select-none"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-[#666666] text-center font-medium">
          Mã PIN chủ thử nghiệm thanh toán: <span className="text-[#0D47A1] font-mono font-black bg-[#E3F2FD] px-2 py-0.5 rounded border border-blue-200">652001</span>
        </p>
      </div>
    </div>
  );
}
