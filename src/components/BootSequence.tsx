import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Activity, Zap, Target, Network } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
  stats: {
    fans: number;
    preds: number;
    wars: number;
  };
}

const playBootSound = (type: 'hum' | 'pulse' | 'activate' | 'reveal') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'hum') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(40, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
      osc.start();
      osc.stop(ctx.currentTime + 3);
    } else if (type === 'pulse') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'activate') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'reveal') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 2);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3);
      osc.start();
      osc.stop(ctx.currentTime + 3);
    }
  } catch (e) {
    // Ignore audio context autoplay rejections
  }
};

export default function BootSequence({ onComplete, stats }: BootSequenceProps) {
  const [bootPhase, setBootPhase] = useState(0);
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    // Attempt background hum
    playBootSound('hum');

    const timers: NodeJS.Timeout[] = [];

    // Phase 1 - Detection logs
    timers.push(setTimeout(() => { setBootPhase(1); playBootSound('pulse'); }, 1000));
    
    // Phase 2 - Agent activation
    timers.push(setTimeout(() => { setBootPhase(2); playBootSound('pulse'); }, 2500));
    
    // Phase 3 - ARISE
    timers.push(setTimeout(() => { setBootPhase(3); playBootSound('reveal'); }, 4500));
    
    // Phase 4 - LIVE & WELCOME
    timers.push(setTimeout(() => { setBootPhase(4); playBootSound('activate'); }, 6000));

    // Final Dashboard Reveal
    timers.push(setTimeout(() => {
      setShowBoot(false);
      setTimeout(onComplete, 1000); // Wait for transition
    }, 8000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {showBoot && (
        <motion.div
          key="boot-sequence"
          className="fixed inset-0 z-[100] bg-[#02050D] flex flex-col items-center justify-center overflow-hidden font-mono origin-center"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Cyberpunk scan lines */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-[101]"></div>
          <div className="absolute inset-0 pointer-events-none z-[102] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
          
          {/* Background glows */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-900/20 rounded-full blur-[150px]"
            animate={{ scale: [0.8, 1.2, 1], opacity: bootPhase >= 2 ? [0, 0.5] : 0 }}
            transition={{ duration: 4, ease: "easeInOut" }}
          ></motion.div>

          {/* PHASE 1 & 2: System Wake & Agent Activation */}
          <AnimatePresence>
            {bootPhase >= 1 && bootPhase < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                className="flex flex-col items-start justify-center w-full max-w-2xl px-8 z-10 space-y-6"
              >
                {/* Phase 1 Logs */}
                <div className="space-y-2 mb-12">
                  <TypingText text="detecting tournament activity..." delay={0} duration={0.6} />
                  {bootPhase >= 1 && <TypingText text="initializing multi-agent network..." delay={1} duration={0.8} />}
                </div>

                {/* Phase 2 Agents */}
                {bootPhase >= 2 && (
                  <div className="space-y-4">
                     <AgentLog icon={BrainCircuit} name="Prediction Core" status="ONLINE" color="#3B82F6" delay={0.1} />
                     <AgentLog icon={Activity} name="Emotion Agent" status="SYNCED" color="#FF4D6D" delay={0.4} />
                     <AgentLog icon={Target} name="Quest Generator" status="ACTIVE" color="#8B5CF6" delay={0.7} />
                     <AgentLog icon={Network} name="Rivalry Engine" status="CONNECTED" color="#00FFB2" delay={1.0} />
                     <AgentLog icon={Zap} name="Reward Agent" status="CALIBRATED" color="#FACC15" delay={1.3} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* PHASE 3: Cinematic Reveal */}
          <AnimatePresence mode="wait">
             {bootPhase === 3 && (
                <motion.div
                  key="arise"
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <h1 className="text-8xl md:text-[12rem] font-display font-black text-transparent bg-clip-text bg-white tracking-widest drop-shadow-[0_0_80px_rgba(255,255,255,0.8)] animate-pulse shadow-white/50 relative">
                    ARISE
                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-ping opacity-50 mix-blend-screen"></div>
                  </h1>
                </motion.div>
             )}

             {bootPhase >= 4 && (
                <motion.div
                  key="live-welcome-dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-8"
                >
                  <h2 className="text-3xl md:text-5xl font-mono font-bold text-[#00FFB2] tracking-[0.5em] uppercase drop-shadow-[0_0_30px_rgba(0,255,178,0.6)]">
                    THE FANFORGE IS LIVE
                  </h2>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-xl md:text-2xl mt-4 font-mono text-slate-300 tracking-[0.2em] uppercase"
                  >
                    WELCOME BACK, <span className="text-indigo-400 font-bold drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]">TACTICAL ANALYST.</span>
                  </motion.h3>
                </motion.div>
             )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypingText({ text, delay, duration }: { text: string; delay: number; duration: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="text-slate-500 font-mono text-sm tracking-widest uppercase flex items-center gap-2"
    >
      <span className="w-2 h-4 bg-slate-500 animate-pulse"></span>
      <motion.span
        initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
        animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
        transition={{ duration, ease: "linear", delay: delay + 0.1 }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

function AgentLog({ icon: Icon, name, status, color, delay }: { icon: any, name: string, status: string, color: string, delay: number }) {
  useEffect(() => {
    const t = setTimeout(() => playBootSound('activate'), delay * 1000 + 300);
    return () => clearTimeout(t);
  }, [delay]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex items-center gap-4 text-sm font-mono tracking-widest uppercase"
    >
      <span className="text-slate-600">[{name}]</span>
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.3 }}
        className="flex items-center gap-3"
      >
        <span className="w-10 h-px bg-slate-800 relative">
           <motion.span 
             initial={{ scaleX: 0, opacity: 1 }}
             animate={{ scaleX: 1, opacity: 0 }}
             transition={{ duration: 1, delay: delay + 0.5, repeat: Infinity }}
             className="absolute inset-0 origin-left"
             style={{ backgroundColor: color }}
           />
        </span>
        <div className="flex items-center gap-2 px-3 py-1 rounded-sm relative overflow-hidden" style={{ color }}>
           <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }}></div>
           <Icon size={14} className="animate-pulse" />
           <span className="font-bold relative z-10">{status}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
