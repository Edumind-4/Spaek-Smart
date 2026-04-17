import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scenario } from '../types';
import { Target, User, Bot, Play, X } from 'lucide-react';

interface ScenarioBriefingProps {
  scenario: Scenario;
  onClose: () => void;
  onStart: () => void;
}

export default function ScenarioBriefing({ scenario, onClose, onStart }: ScenarioBriefingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all"
      >
        <div className="relative p-8 space-y-6">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-sleek-accent flex items-center gap-2">
              <span className="text-lg">✈️</span>
              {scenario.category} & Roleplay
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              {scenario.title}
            </h1>
            <p className="text-sleek-text-secondary text-sm leading-relaxed">
              {scenario.userObjective}
            </p>
          </div>

          <div className="space-y-4 py-4 border-y border-white/5">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-sleek-accent shadow-[0_0_8px_#6366F1]" />
               <span className="text-xs font-semibold text-sleek-text-primary">Describe your suitcase clearly</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-sleek-accent shadow-[0_0_8px_#6366F1]" />
               <span className="text-xs font-semibold text-sleek-text-primary">Check for the nearest counter</span>
            </div>
          </div>

          <div className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-sleek-text-secondary opacity-60">
              AI Partner Identity
            </div>
            <div className="text-sm font-medium italic opacity-90 text-sleek-text-primary">
              "{scenario.startMessage}"
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full py-4 bg-sleek-accent text-white rounded-xl font-bold text-base hover:bg-sleek-accent-light transition-all active:scale-95 shadow-xl shadow-sleek-accent/20"
          >
            Enter Roleplay
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
