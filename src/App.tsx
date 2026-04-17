import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Spinner from './components/Spinner';
import ScenarioBriefing from './components/ScenarioBriefing';
import Chat from './components/Chat';
import ReportCard from './components/ReportCard';
import { SCENARIOS } from './data/scenarios';
import { Scenario, Category, Message, EvaluationReport } from './types';
import { evaluateRoleplay } from './services/gemini';
import { Loader2, Music2, Sparkle } from 'lucide-react';

type Screen = 'home' | 'briefing' | 'chat' | 'evaluating' | 'report';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [report, setReport] = useState<EvaluationReport | null>(null);

  const handleSpinEnd = (category: Category) => {
    const categoryScenarios = SCENARIOS.filter(s => s.category === category);
    const randomScenario = categoryScenarios[Math.floor(Math.random() * categoryScenarios.length)];
    setSelectedScenario(randomScenario);
    setScreen('briefing');
  };

  const handleStartRoleplay = () => {
    setScreen('chat');
  };

  const handleEndRoleplay = async (chatHistory: Message[]) => {
    setHistory(chatHistory);
    setScreen('evaluating');
    
    try {
      if (selectedScenario) {
        const result = await evaluateRoleplay(selectedScenario, chatHistory);
        setReport(result);
        setScreen('report');
      }
    } catch (error) {
      console.error("Evaluation failed", error);
      // Fallback or retry logic could go here
      setScreen('home'); // Simple fallback
    }
  };

  const handleRestart = () => {
    setHistory([]);
    setReport(null);
    setScreen('chat');
  };

  const handleHome = () => {
    setSelectedScenario(null);
    setHistory([]);
    setReport(null);
    setScreen('home');
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-sleek-text-primary overflow-hidden flex flex-col">
      {/* Sleek Theme Navigation */}
      <nav className="h-[72px] px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3 font-extrabold text-xl tracking-tighter">
          SPEAK<span className="text-sleek-accent">SMART</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-sleek-amber/10 text-sleek-amber px-3 py-1 rounded-full text-xs font-bold border border-sleek-amber/20">
            🔥 12 DAY STREAK
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sleek-accent to-sleek-emerald shadow-lg shadow-sleek-accent/20" />
            <span className="text-sm font-semibold opacity-90">User</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 grid md:grid-cols-[1fr_400px] gap-10 p-10 items-center max-w-[1400px] mx-auto w-full"
            >
              <div className="spinner-section flex flex-col items-center justify-center">
                <Spinner onSpinEnd={handleSpinEnd} />
                <div className="mt-10 text-center space-y-3">
                   <p className="text-sleek-text-secondary text-sm font-medium">
                     Tap to select your random speaking challenge
                   </p>
                   <div className="flex gap-4 justify-center items-center">
                      {['TRAVEL', 'CAREER', 'SHOP', 'SOCIAL'].map(cat => (
                        <span key={cat} className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{cat}</span>
                      ))}
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <div className="px-3 py-1 bg-sleek-accent/10 text-sleek-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-sleek-accent/20">
                      The Ultimate ESL Coach
                    </div>
                  </motion.div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white">
                    Spin. Speak.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sleek-accent to-sleek-accent-light">Master Fluency.</span>
                  </h1>
                  <p className="text-sleek-text-secondary text-lg leading-relaxed">
                    Realistic AI roleplays designed to help you conquer everyday English conversations.
                  </p>
                </div>

                <div className="flex gap-6 opacity-60">
                   <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                     <Music2 size={24} className="text-sleek-accent" />
                     <span className="text-[10px] uppercase font-bold tracking-widest">Voice API</span>
                   </div>
                   <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                     <Sparkle size={24} className="text-sleek-emerald" />
                     <span className="text-[10px] uppercase font-bold tracking-widest">Gemini AI</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'briefing' && selectedScenario && (
            <ScenarioBriefing
              scenario={selectedScenario}
              onClose={() => setScreen('home')}
              onStart={handleStartRoleplay}
            />
          )}

        {screen === 'chat' && selectedScenario && (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1"
          >
            <Chat 
              scenario={selectedScenario} 
              onEnd={handleEndRoleplay} 
              onBack={() => setScreen('home')} 
            />
          </motion.div>
        )}

        {screen === 'evaluating' && (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-sleek-accent animate-spin" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-sleek-accent blur-2xl rounded-full -z-10" 
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Analyzing Your Fluency</h2>
              <p className="text-sleek-text-secondary italic font-medium">"Our AI Teacher is reviewing your grammar and pronunciation..."</p>
            </div>
          </motion.div>
        )}

        {screen === 'report' && selectedScenario && report && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <ReportCard
              report={report}
              scenario={selectedScenario}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}

