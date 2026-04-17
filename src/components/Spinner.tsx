import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { CATEGORIES } from '../data/scenarios';
import { Category } from '../types';
import { Sparkles } from 'lucide-react';

interface SpinnerProps {
  onSpinEnd: (category: Category) => void;
}

export default function Spinner({ onSpinEnd }: SpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  const SLEEK_COLORS = ['#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6'];

  const spin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const spinDuration = 4000;
    const extraSpins = 5 + Math.random() * 5;
    const finalAngle = extraSpins * 360 + Math.random() * 360;

    await controls.start({
      rotate: finalAngle,
      transition: { duration: spinDuration / 1000, ease: [0.45, 0.05, 0.55, 0.95] },
    });

    const normalizedAngle = finalAngle % 360;
    const sectionAngle = 360 / CATEGORIES.length;
    const winningIndex = Math.floor(((360 - (normalizedAngle % 360)) % 360) / sectionAngle);
    
    setIsSpinning(false);
    onSpinEnd(CATEGORIES[winningIndex].name);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 p-4">
      <div className="relative w-72 h-72 md:w-[420px] md:h-[420px] p-2 rounded-full border-8 border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.2)] bg-[#1E293B]">
        {/* Pointer */}
        <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] shadow-xl" />
        </div>

        {/* Wheel */}
        <motion.div
          animate={controls}
          ref={wheelRef}
          className="w-full h-full rounded-full relative overflow-hidden opacity-90"
          style={{
            background: `conic-gradient(${SLEEK_COLORS.map((color, i) => `${color} ${i * (360/5)}deg ${(i+1) * (360/5)}deg`).join(', ')})`,
            maskImage: 'radial-gradient(circle, transparent 15%, black 16%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 15%, black 16%)'
          }}
        >
          {CATEGORIES.map((cat, i) => {
            const angle = 360 / CATEGORIES.length;
            const rotate = i * angle;
            return (
              <div
                key={cat.name}
                className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-end pr-8 md:pr-14"
                style={{
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                <div className="transform -rotate-90 flex flex-col items-center select-none">
                  <span className="text-3xl md:text-5xl mb-2 filter drop-shadow-md">{cat.emoji}</span>
                  <span className="text-white font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] hidden md:block opacity-60">
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Center Button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full font-black text-sm md:text-lg uppercase tracking-tighter transition-all z-10 flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.4)] ${
            isSpinning
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-white text-slate-900 hover:scale-110 active:scale-90'
          }`}
        >
          {isSpinning ? '...' : (
            <span className="flex flex-col items-center leading-none">
              <Sparkles className="w-4 h-4 mb-1 text-sleek-indigo" />
              SPIN
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
