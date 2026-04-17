import React from 'react';
import { motion } from 'motion/react';
import { EvaluationReport, Scenario } from '../types';
import { Award, CheckCircle2, AlertCircle, RefreshCcw, Home, Star, Bot } from 'lucide-react';

interface ReportCardProps {
  report: EvaluationReport;
  scenario: Scenario;
  onRestart: () => void;
  onHome: () => void;
}

export default function ReportCard({ report, scenario, onRestart, onHome }: ReportCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-sleek-emerald';
    if (score >= 6) return 'text-sleek-accent';
    if (score >= 4) return 'text-sleek-amber';
    return 'text-sleek-rose';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-sleek-emerald';
    if (score >= 6) return 'bg-sleek-accent';
    if (score >= 4) return 'bg-sleek-amber';
    return 'bg-sleek-rose';
  };

  return (
    <div className="min-h-full bg-transparent p-6 pb-20 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-20 h-20 bg-gradient-to-br from-sleek-accent to-sleek-indigo rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-sleek-accent/40 mb-2"
          >
            <Award size={36} />
          </motion.div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-sleek-accent mb-2">Performance Assessment</p>
            <h1 className="text-5xl font-extrabold text-white tracking-tighter">{scenario.title}</h1>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Overall', score: report.overallScore, icon: Star },
            { label: 'Fluency', score: report.fluencyScore, icon: CheckCircle2 },
            { label: 'Grammar', score: report.grammarScore, icon: AlertCircle }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-[32px] flex flex-col items-center text-center space-y-6 shadow-xl relative overflow-hidden group hover:bg-white/[0.08] transition-all"
            >
              <item.icon size={20} className={getScoreColor(item.score)} />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-sleek-text-secondary uppercase tracking-[0.2em]">{item.label}</p>
                <p className={`text-6xl font-black ${getScoreColor(item.score)} tracking-tight`}>
                  {item.score}
                </p>
                <p className="text-[10px] font-bold text-sleek-text-secondary/40">OUT OF 10</p>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score * 10}%` }}
                  className={`h-full ${getScoreBg(item.score)} shadow-[0_0_10px_currentColor]`} 
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sleek-indigo/10 rounded-[40px] p-10 text-white shadow-2xl border border-sleek-indigo/20 relative overflow-hidden text-center"
        >
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
             <div className="flex justify-center mb-2">
               <Bot size={24} className="text-sleek-accent-light" />
             </div>
             <p className="text-xl font-medium text-sleek-text-primary leading-relaxed">
               "{report.feedback}"
             </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-sleek-accent/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        </motion.div>

        {/* Key Areas */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-sleek-text-secondary uppercase tracking-[0.3em] text-center">Language Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.corrections.map((corr, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-panel p-8 rounded-[32px] space-y-6 hover:border-white/20 transition-all border-white/5"
              >
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-sleek-rose tracking-widest opacity-60">You Observed</p>
                  <p className="text-sleek-text-primary font-medium italic opacity-80">"{corr.original}"</p>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-sleek-emerald tracking-widest opacity-60">Recommended</p>
                  <p className="text-sleek-text-primary font-bold text-lg">"{corr.correction}"</p>
                </div>
                <div className="text-xs text-sleek-text-secondary leading-relaxed bg-white/5 p-4 rounded-2xl">
                  {corr.explanation}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-6 pt-10">
          <button
            onClick={onRestart}
            className="flex-1 py-5 bg-sleek-indigo text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-sleek-accent-light transition-all active:scale-95 shadow-xl shadow-sleek-indigo/20 group uppercase text-sm tracking-widest"
          >
            <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
            Repeat Session
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-5 bg-white/5 text-sleek-text-primary border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-lg uppercase text-sm tracking-widest"
          >
            <Home size={18} />
            New Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
