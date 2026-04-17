import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scenario, Message } from '../types';
import { Mic, Send, Flag, Volume2, VolumeX, User, Bot, Loader2 } from 'lucide-react';
import { chatWithGemini } from '../services/gemini';

interface ChatProps {
  scenario: Scenario;
  onEnd: (history: Message[]) => void;
  onBack: () => void;
}

export default function Chat({ scenario, onEnd, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: scenario.startMessage }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initial speech for the first message
    if (!isMuted) {
      speak(scenario.startMessage);
    }

    // Setup Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const speak = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    // Use a natural sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
                      || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.rate = 0.95; // Slightly slower for ESL learners
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  const handleMicStart = () => {
    if (recognitionRef.current) {
      setInputText('');
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const handleMicEnd = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Automatically send if there's text
      if (inputText.trim()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputText.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(scenario, newMessages);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
      speak(response);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting. Could you repeat that?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Header */}
      <div className="border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-sleek-bg/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sleek-accent flex items-center justify-center text-white shadow-lg shadow-sleek-accent/20">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white leading-none tracking-tight">{scenario.title}</h3>
            <p className="text-[10px] text-sleek-text-secondary mt-1 uppercase tracking-widest flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-sleek-emerald animate-pulse" />
              Identity: {scenario.category} Agent
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleMute}
            className={`p-2 rounded-xl transition-colors ${isMuted ? 'text-sleek-rose bg-sleek-rose/10' : 'text-sleek-text-secondary hover:bg-white/5'}`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={() => onEnd(messages)}
            className="flex items-center gap-2 px-4 py-2 bg-sleek-rose/10 text-sleek-rose rounded-xl font-bold text-xs hover:bg-sleek-rose/20 transition-colors border border-sleek-rose/20"
          >
            <Flag size={14} />
            End Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 pb-40 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 text-xs font-bold border ${
                  m.role === 'user' ? 'bg-sleek-indigo text-white border-white/10' : 'bg-white/5 text-sleek-text-secondary border-white/5'
                }`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-sleek-indigo text-white rounded-tr-none' 
                    : 'bg-white/5 backdrop-blur-md border border-white/10 text-sleek-text-primary rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start items-center gap-2 text-sleek-text-secondary text-[10px] font-bold uppercase tracking-widest pl-12"
          >
            <Loader2 className="animate-spin" size={12} />
            Thinking...
          </motion.div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-2xl z-40">
        <div className="glass-panel p-3 rounded-[32px] flex gap-3 items-center shadow-2xl">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={isListening ? "Listening..." : "Speak now or type here..."}
            className="flex-1 bg-white/5 border-none rounded-2xl px-5 py-3 text-sm focus:ring-1 focus:ring-sleek-accent transition-all outline-none disabled:opacity-50 text-white placeholder:text-sleek-text-secondary/40"
          />
          
          <button
            type="button"
            onMouseDown={handleMicStart}
            onMouseUp={handleMicEnd}
            onTouchStart={handleMicStart}
            onTouchEnd={handleMicEnd}
            className={`w-12 h-12 rounded-full transition-all flex items-center justify-center relative shadow-lg ${
              isListening 
                ? 'bg-sleek-rose text-white scale-110 shadow-sleek-rose/40 animate-[pulse_2s_infinite]' 
                : 'bg-white/10 text-sleek-text-secondary hover:bg-white/20'
            }`}
             style={{
               animation: isListening ? 'pulse 2s infinite' : 'none'
             }}
          >
            <Mic size={20} />
            <style>{`
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }
                100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
              }
            `}</style>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputText.trim() || isLoading}
            className="bg-sleek-indigo text-white w-12 h-12 rounded-full hover:bg-sleek-accent-light transition-all disabled:opacity-20 flex items-center justify-center shadow-lg shadow-sleek-indigo/20"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[9px] text-center text-sleek-text-secondary mt-3 font-bold uppercase tracking-[0.2em] opacity-40">
          Listening for native patterns and fluency markers...
        </p>
      </div>
    </div>
  );
}
