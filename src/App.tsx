import { useState, useRef, useEffect, useCallback } from 'react';
import Lenis from 'lenis';
import { Trophy, Flame, Zap, Target, Cpu, Activity, Fingerprint, Swords, BrainCircuit, Network, Clock, CheckCircle2 } from 'lucide-react';
import { Prediction, UserStats, Quest, AgentAction, ClanWar } from './types';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import HolographicCrystal from './components/HolographicCrystal';
import BootSequence from './components/BootSequence';

// Sound utility function
const playSound = (type: 'lock' | 'alert' | 'xp') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'lock') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'alert') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    } else if (type === 'xp') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    }
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

const Particles = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);
  
  useEffect(() => {
    const list = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(list);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20 blur-[1px]"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};


const INITIAL_PREDICTIONS: Prediction[] = [
  { 
    id: '1', matchId: 'm1', type: 'standard', title: 'Winner of Match 32', options: ['Dragons FC', 'Lions City'], predictedOption: null, status: 'active', reward: 50,
    aiReasoning: { confidence: 78, risk: 'Medium', volatility: 'Low', factors: ['Higher possession trend', 'Better recent form', 'Opponent fatigue detected'] }
  },
  { 
    id: '2', matchId: 'm2', type: 'flash', title: 'Next team to score (Next 5m)', options: ['Dragons FC', 'Lions City', 'None'], predictedOption: null, status: 'active', reward: 120, timeRemaining: '02:45',
    aiReasoning: { confidence: 62, risk: 'High', volatility: 'High', factors: ['Dragons FC momentum surging', 'Attack pattern recognized'] }
  },
];

const INITIAL_ACTIONS: AgentAction[] = [
  { id: 'a1', agent: 'Rivalry Agent', action: 'Matched opponent Ankit Sharma', timestamp: 'Just now', type: 'routine' },
  { id: 'a2', agent: 'Quest Agent', action: 'Generated redemption challenge', timestamp: '5m ago', type: 'alert' },
  { id: 'a3', agent: 'Prediction Coach', action: 'Analyzed risk on Match 32', timestamp: '12m ago', type: 'routine' },
];

const CLAN_WAR: ClanWar = {
  clanId: 'c1', clanName: 'Cyber Titans', opponentName: 'Goal Hunters', territoryControl: 62
};

const AGENT_PROFILES: Record<string, { icon: any, color: string, glow: string, label: string, status: string }> = {
  'Prediction Core': { icon: BrainCircuit, color: '#3B82F6', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', label: 'PRED_CORE', status: 'COLD_LOGIC' },
  'Prediction Agent': { icon: BrainCircuit, color: '#3B82F6', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', label: 'PRED_CORE', status: 'COLD_LOGIC' },
  'PREDICTION_CORE': { icon: BrainCircuit, color: '#00FFB2', glow: 'shadow-[0_0_10px_rgba(0,255,178,0.5)]', label: 'PRED_CORE', status: 'OPTIMIZING' },
  'Emotion Agent': { icon: Activity, color: '#FF4D6D', glow: 'shadow-[0_0_10px_rgba(255,77,109,0.5)]', label: 'EMOTION_SYS', status: 'EMPATHETIC' },
  'EMOTION_AGENT': { icon: Activity, color: '#FF4D6D', glow: 'shadow-[0_0_10px_rgba(255,77,109,0.5)]', label: 'EMOTION_SYS', status: 'EMPATHETIC' },
  'Reward Agent': { icon: Zap, color: '#FACC15', glow: 'shadow-[0_0_10px_rgba(250,204,21,0.5)]', label: 'REWARD_ENG', status: 'HYPE_MAX' },
  'TACTICAL_NODE': { icon: Target, color: '#3B82F6', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', label: 'TACTIC_NODE', status: 'ANALYTICAL' },
};

const getAgentProfile = (name: string) => AGENT_PROFILES[name] || { icon: Cpu, color: '#94A3B8', glow: 'shadow-[0_0_10px_rgba(148,163,184,0.5)]', label: 'SYS_CORE', status: 'ONLINE' };

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [predictions, setPredictions] = useState<Prediction[]>(INITIAL_PREDICTIONS);
  const [actions, setActions] = useState<AgentAction[]>(INITIAL_ACTIONS);
  const [stats] = useState<UserStats>({ 
    score: 1250, streak: 3, badges: ['Early Bird'], 
    level: 12, xp: 450, nextLevelXp: 1000, fanType: 'Tactical Analyst',
    profile: { archetype: 'Tactical Analyst', riskAppetite: 'Medium', loyaltyIndex: 87, predictionAccuracy: 72, behaviorPattern: 'Competitive' }
  });
  
  const [momentum, setMomentum] = useState(74); // 74% Dragons FC
  const [opacityVolatilty, setOpacityVolatility] = useState(50);
  const [hasFlashActive, setHasFlashActive] = useState(true);
  const [commentary, setCommentary] = useState([
    { id: 'c1', type: 'prediction', agent: 'PREDICTION_CORE', text: 'Dragons FC structural dominance increasing. Expected Goals (xG) up by 0.24' },
    { id: 'c2', type: 'emotion', agent: 'EMOTION_AGENT', text: 'Anomaly detected in crowd telemetry: Lions City fan sentiment dropping rapidly.' }
  ]);

  const [liveStats, setLiveStats] = useState({ fans: 184203, preds: 12442, wars: 84 });

  useEffect(() => {
    const liveInterval = setInterval(() => {
      setLiveStats(prev => ({
        fans: prev.fans + Math.floor(Math.random() * 14) - 5,
        preds: prev.preds + Math.floor(Math.random() * 60) - 25,
        wars: Math.max(80, prev.wars + (Math.random() > 0.8 ? 1 : Math.random() < 0.2 ? -1 : 0))
      }));
    }, 2000);
    return () => clearInterval(liveInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const actionsList = [
        { agent: 'Emotion Agent', action: 'Detected frustration spike in rival', type: 'alert' as const },
        { agent: 'Reward Agent', action: 'Boosted comeback XP by 30%', type: 'urgent' as const },
        { agent: 'Prediction Agent', action: 'Updated odds for Dragons FC', type: 'routine' as const }
      ];
      setActions(prev => [{ id: Date.now().toString(), ...actionsList[Math.floor(Math.random() * actionsList.length)], timestamp: 'Just now' }, ...prev.slice(0, 3)]);
      
      const newCommentaryList = [
        { type: 'tactical', agent: 'TACTICAL_NODE', text: 'Lions City defensive formation showing structural fatigue on the left flank.' },
        { type: 'emotion', agent: 'EMOTION_AGENT', text: 'Global predictions shifting. Emotional volatility reaching critical threshold.' },
        { type: 'prediction', agent: 'PREDICTION_CORE', text: 'Probability of a score event in the next 3 protocol cycles has increased by 14%.' },
      ];
      setCommentary(prev => [{ id: Date.now().toString(), ...newCommentaryList[Math.floor(Math.random() * newCommentaryList.length)] }, ...prev].slice(0, 3));
      
      const newMomentum = Math.max(30, Math.min(90, momentum + (Math.random() * 20 - 10)));
      setMomentum(newMomentum);
      setOpacityVolatility(newMomentum);
      
      if (Math.random() > 0.7) {
        playSound('alert');
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handlePredict = (id: string, option: string) => {
    playSound('lock');
    setPredictions(prev => prev.map(p => p.id === id ? { ...p, predictedOption: option } : p));
    setActions(prev => [{ id: Date.now().toString(), agent: 'Prediction Agent', action: `Locked prediction for ${option}`, timestamp: 'Just now', type: 'routine' }, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const { scrollYProgress } = useScroll();
  const backgroundY1 = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const backgroundY2 = useTransform(scrollYProgress, [0, 1], ['100%', '-50%']);
  
  // Reactive background color based on momentum volatility
  const volatilityColor = useSpring(Math.abs(opacityVolatilty - 50) > 30 ? '#100518' : '#050816', { stiffness: 50, damping: 20 });
  
  const sec1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const sec2Progress = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const matchArenaScale = useTransform(sec2Progress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const sec3Progress = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const networkScale = useTransform(sec3Progress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <>
      <AnimatePresence>
        {isBooting && <BootSequence onComplete={() => setIsBooting(false)} stats={liveStats} />}
      </AnimatePresence>

      <motion.div style={{ backgroundColor: volatilityColor as any }} className="min-h-screen text-slate-100 font-sans flex flex-col items-center transition-colors duration-1000">
      {/* GLOBAL BACKGROUNDS */}
      <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
         <motion.div style={{ y: backgroundY1 }} className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-900/10 rounded-full blur-[100px] animate-pulse"></motion.div>
         <motion.div style={{ y: backgroundY2 }} className={`absolute bottom-1/4 right-1/4 w-[50rem] h-[50rem] rounded-full blur-[120px] animate-[pulse_4s_ease-in-out_infinite] transition-colors duration-1000 ${hasFlashActive ? 'bg-rose-900/10' : 'bg-purple-900/10'}`}></motion.div>
         <Particles />
         {/* Particles */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#050816_100%)] opacity-80 backdrop-blur-[1px]"></div>
      </div>

      {/* SECTION 1: HERO COMMAND CENTER */}
      <motion.section style={{ opacity: sec1Opacity }} className="h-[120vh] w-full max-w-7xl px-4 flex flex-col items-center pt-24 relative z-10 sticky top-0">
        <h1 className="text-[10px] font-mono tracking-[0.5em] text-[#00FFB2] mb-6 uppercase animate-pulse">Global Live Layer</h1>
        <div className="w-full bg-[#050816]/60 backdrop-blur-3xl p-8 rounded-[2rem] shadow-[0_0_40px_rgba(79,70,229,0.15),inset_0_0_20px_rgba(255,255,255,0.02)] border border-[#4F46E5]/30 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 hover:shadow-[0_0_60px_rgba(79,70,229,0.25),inset_0_0_30px_rgba(255,255,255,0.05)] transition-all duration-700 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none"></div>
          
          <div className="flex items-center gap-8 z-10 w-full lg:w-auto">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-indigo-500 animate-[ping_3s_infinite] blur-xl opacity-20 rounded-2xl group-hover:opacity-40 transition-opacity"></div>
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#050816] to-[#0A102A] flex items-center justify-center relative shadow-lg shadow-indigo-500/30 border border-indigo-400/50 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                <HolographicCrystal type="badge" color="#8B5CF6" />
                <span className="text-4xl font-display font-bold relative z-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">L{stats.level}</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 drop-shadow-lg">FanForge OS</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/30 backdrop-blur-md">
                  {stats.fanType}
                </span>
                <span className="text-sm font-bold font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-2 backdrop-blur-md">
                  <Flame size={14} className="animate-pulse" /> {stats.streak} Streak
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col items-center justify-center z-10 px-10 relative group border-l border-r border-[#4F46E5]/20 min-w-[300px]">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-[150px] pointer-events-none opacity-80 mix-blend-screen transition-opacity group-hover:opacity-100 duration-700">
              <HolographicCrystal />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-[0.3em] font-bold mb-4 flex items-center gap-2 relative z-10">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-[ping_2s_infinite]"></span>
               Tournament Pulse
            </span>
            <div className="flex gap-10 relative z-10">
              <div className="text-center group-hover:scale-110 transition-transform duration-500">
                <div className="text-3xl font-display font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                   {liveStats.fans.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#00FFB2] mt-1 font-bold shadow-black drop-shadow-md">Active Fans</div>
              </div>
              <div className="text-center group-hover:scale-110 transition-transform duration-500 delay-75">
                <div className="text-3xl font-display font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                   {liveStats.preds.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#3B82F6] mt-1 font-bold shadow-black drop-shadow-md">Preds/min</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start lg:items-end z-10 w-full lg:w-auto">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#00FFB2]">Core active</span>
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <motion.span key={i} animate={{ height: ['10px', '24px', '10px'] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="w-1.5 bg-[#00FFB2] rounded-sm"></motion.span>
                  ))}
                </div>
             </div>
             <div className="text-sm font-mono text-slate-300 flex flex-col items-end gap-2">
               <div className="flex justify-between w-full gap-4">
                 <span className="opacity-60 uppercase tracking-wider">Score</span> 
                 <span className="font-bold text-white font-display text-2xl text-[#FACC15] drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-pulse">{stats.score}</span>
               </div>
               <div className="flex justify-between w-full gap-4 pt-2 border-t border-slate-800">
                 <span className="opacity-60 uppercase tracking-wider text-[10px]">Rank</span> 
                 <span className="font-bold text-white font-display text-lg text-white">#284</span>
               </div>
             </div>
          </div>
        </div>
        
        <div className="mt-auto pb-12 flex flex-col items-center opacity-50 animate-bounce">
           <span className="text-[10px] font-mono tracking-widest uppercase mb-2">Scroll to enter Arena</span>
           <div className="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </motion.section>

      {/* SECTION 2: LIVE MATCH ARENA (Sticky container with scrolling content inside) */}
      <section className="relative w-full h-[250vh]">
         <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-0"></div>
            <motion.div style={{ scale: matchArenaScale }} className="w-full max-w-6xl pointer-events-auto z-10 transition-transform duration-500 hover:scale-[1.01]">
               <div className={`bg-[#050816]/90 border ${hasFlashActive ? 'border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.15),inset_0_0_30px_rgba(244,63,94,0.05)]' : 'border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.15),inset_0_0_30px_rgba(255,255,255,0.02)]'} p-8 lg:p-12 rounded-[3rem] relative overflow-hidden backdrop-blur-2xl transition-all duration-700`}>
                 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[3rem] pointer-events-none"></div>
                 <div className={`absolute right-0 top-0 w-96 h-96 rounded-full blur-[100px] animate-pulse pointer-events-none transition-colors duration-1000 ${hasFlashActive ? 'bg-rose-500/10' : 'bg-[#00FFB2]/5'}`}></div>
                 <div className={`absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${hasFlashActive ? 'bg-purple-600/10' : 'bg-indigo-600/10'}`}></div>
                 
                 <div className="flex justify-between items-center mb-12 relative z-10 border-b border-white/5 pb-6">
                   <h2 className="text-sm lg:text-base font-bold uppercase tracking-[0.3em] text-white flex items-center gap-3 font-mono">
                      <Activity size={24} className="text-[#00FFB2]" /> Stadium Hologram
                   </h2>
                   <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                     <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                     <span className="text-xs font-mono font-bold text-red-400 tracking-widest">LIVE DATA FEED</span>
                   </div>
                 </div>

                 <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                    <div className="flex-1 space-y-10">
                       {/* Momentum Engine */}
                       <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                           <div className="flex justify-between text-sm font-display font-black tracking-widest mb-4">
                              <span className={momentum > 50 ? 'text-[#3B82F6]' : 'text-slate-500 transition-colors'}>DRAGONS FC</span>
                              <span className={momentum < 50 ? 'text-[#FF8A00]' : 'text-slate-500 transition-colors'}>LIONS CITY</span>
                           </div>
                           <div className="w-full bg-[#03040b] h-8 rounded-full overflow-hidden flex relative ring-2 ring-white/5 shadow-2xl">
                              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-slate-500 z-10 -translate-x-1/2 opacity-30 mix-blend-screen"></div>
                              <motion.div 
                                 className="bg-gradient-to-r from-blue-600 to-[#3B82F6] h-full relative" 
                                 animate={{ width: `${momentum}%` }}
                                 transition={{ type: "spring", stiffness: 50 }}
                              >
                                 <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/20 blur-sm mix-blend-overlay"></div>
                              </motion.div>
                              <motion.div 
                                 className="bg-gradient-to-l from-orange-600 to-[#FF8A00] h-full relative" 
                                 animate={{ width: `${100 - momentum}%` }}
                                 transition={{ type: "spring", stiffness: 50 }}
                              >
                                 <div className="absolute left-0 top-0 bottom-0 w-8 bg-white/20 blur-sm mix-blend-overlay"></div>
                              </motion.div>
                           </div>
                           <div className="flex justify-between mt-3 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                              <span>{momentum.toFixed(0)}% Momentum</span>
                              <span>{(100-momentum).toFixed(0)}% Momentum</span>
                           </div>
                       </div>
                       
                       {/* Active Prediction */}
                       <AnimatePresence>
                         {predictions.filter(p => !p.predictedOption).slice(0,1).map(pred => (
                           <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={pred.id} className="bg-gradient-to-b from-[#0A102A]/80 to-[#050816]/80 border border-[#00FFB2]/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(0,255,178,0.15),inset_0_0_20px_rgba(0,255,178,0.05)] relative overflow-hidden group hover:shadow-[0_0_50px_rgba(0,255,178,0.25),inset_0_0_30px_rgba(0,255,178,0.1)] transition-all duration-500 hover:-translate-y-1">
                             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00FFB2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                             <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                   <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FFB2] mb-2 block">System Query</span>
                                   <h3 className="text-2xl font-display font-black text-white tracking-tight">{pred.title}</h3>
                                </div>
                                {pred.type === 'flash' && <span className="text-xs font-mono font-bold text-[#FF4D6D] uppercase flex items-center gap-1.5 animate-pulse bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"><Clock size={16}/> {pred.timeRemaining}</span>}
                             </div>
                             <div className="grid grid-cols-2 gap-4 relative z-10">
                               {pred.options.map(opt => (
                                 <button key={opt} onClick={() => handlePredict(pred.id, opt)} className="py-5 rounded-2xl bg-slate-900 border border-slate-700 font-display font-black tracking-widest hover:border-[#00FFB2] hover:bg-[#050816] transition-all uppercase relative overflow-hidden group/btn text-lg hover:shadow-[0_0_20px_rgba(0,255,178,0.2)]">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FFB2]/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                                     <span className="relative z-10 text-slate-300 group-hover/btn:text-white transition-colors">{opt}</span>
                                 </button>
                               ))}
                             </div>
                           </motion.div>
                         ))}
                       </AnimatePresence>
                    </div>

                    <div className="w-full lg:w-1/3 flex flex-col gap-4 border-l border-white/5 pl-0 lg:pl-12">
                       <h3 className="text-xs uppercase font-mono tracking-[0.2em] text-[#8B5CF6] flex items-center gap-2 mb-2">
                         <Network size={16}/> Telemetry Stream
                       </h3>
                       <div className="flex-1 bg-[#050816]/60 rounded-2xl border border-[#8B5CF6]/30 p-5 overflow-hidden relative shadow-[0_0_30px_rgba(139,92,246,0.1),inset_0_0_20px_rgba(139,92,246,0.05)] hover:shadow-[0_0_40px_rgba(139,92,246,0.2),inset_0_0_30px_rgba(139,92,246,0.1)] transition-all duration-500 group">
                          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-2xl"></div>
                          <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-[#050816] to-transparent z-10 pointer-events-none"></div>
                          <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-[#050816] to-transparent z-10 pointer-events-none"></div>
                          
                          <div className="space-y-4 relative z-0 h-[400px] overflow-hidden flex flex-col justify-end pb-4">
                            <AnimatePresence>
                               {commentary.map(c => {
                                 const p = getAgentProfile(c.agent);
                                 return (
                                   <motion.div key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 items-start border-b border-slate-800/80 pb-4 last:border-0 relative">
                                      <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-800 -z-10"></div>
                                      <div className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0 relative">
                                         <div className="absolute inset-0 opacity-20 animate-pulse" style={{ backgroundColor: p.color }}></div>
                                         <p.icon size={14} style={{ color: p.color }} className="relative z-10"/>
                                      </div>
                                      <div>
                                         <span className="text-[9px] font-mono tracking-[0.2em] uppercase font-bold mb-1 block" style={{ color: p.color }}>{p.label} <span className="opacity-50 mx-1">•</span> {c.type}</span>
                                         <p className="text-xs font-mono text-slate-300 leading-relaxed pr-2">{c.text}</p>
                                      </div>
                                   </motion.div>
                                 )
                               })}
                            </AnimatePresence>
                          </div>
                       </div>
                    </div>
                 </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* SECTION 3: AI AGENT NETWORK */}
      <section className="relative w-full h-[200vh]">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 z-10">
             <motion.div style={{ scale: networkScale }} className="w-full max-w-7xl">
                <div className="flex flex-col items-center">
                   <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-indigo-400 mb-16 flex items-center gap-3">
                      <Network size={20} /> Neural Agent Network
                   </h2>
                   <div className="relative w-full aspect-[2/1] md:aspect-[21/9] rounded-[3rem] border border-slate-800/80 bg-[#050816]/80 backdrop-blur-3xl overflow-hidden shadow-2xl flex items-center justify-center group">
                      
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4F46E5_0%,_transparent_60%)] opacity-5"></div>

                      <svg className="absolute inset-0 w-full h-full opacity-30 group-hover:opacity-60 transition-opacity duration-1000">
                         <path d="M200,200 C300,100 500,200 600,250 S800,150 900,200" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
                         <path d="M200,300 C400,400 500,100 800,300" stroke="#FF4D6D" strokeWidth="1.5" fill="none" strokeDasharray="3,3" className="animate-[dash_15s_linear_infinite_reverse]" />
                         <path d="M400,200 C500,300 700,200 800,250" stroke="#FACC15" strokeWidth="1" fill="none" className="animate-pulse opacity-50" />
                      </svg>

                      <div className="relative w-full h-full">
                         <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[25%] left-[20%] flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-[#050816] border-2 border-[#3B82F6] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] relative group/node cursor-pointer hover:scale-110 transition-transform">
                               <div className="absolute inset-0 bg-[#3B82F6]/10 rounded-full animate-ping opacity-50"></div>
                               <BrainCircuit size={32} className="text-[#3B82F6] group-hover/node:animate-bounce" />
                            </div>
                            <span className="text-xs font-mono tracking-widest text-[#3B82F6] uppercase font-bold">Prediction Core</span>
                            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Nodes Active: 204</span>
                         </motion.div>

                         <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[40%] right-[25%] flex flex-col items-center gap-3">
                            <div className="w-24 h-24 rounded-full bg-[#050816] border-2 border-[#FF4D6D] flex items-center justify-center shadow-[0_0_40px_rgba(255,77,109,0.3)] relative group/node cursor-pointer hover:scale-110 transition-transform">
                               <div className="absolute inset-0 bg-[#FF4D6D]/10 rounded-full animate-ping opacity-50 transition-all duration-3000"></div>
                               <Activity size={40} className="text-[#FF4D6D] group-hover/node:animate-pulse" />
                            </div>
                            <span className="text-xs font-mono tracking-widest text-[#FF4D6D] uppercase font-bold">Emotion Agent</span>
                            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Sentiment: Volatile</span>
                         </motion.div>

                         <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[20%] left-[45%] flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-[#050816] border-2 border-[#FACC15] flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)] relative group/node cursor-pointer hover:scale-110 transition-transform">
                               <Zap size={24} className="text-[#FACC15]" />
                            </div>
                            <span className="text-xs font-mono tracking-widest text-[#FACC15] uppercase font-bold">Reward Engine</span>
                            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Multiplier: 1.5x</span>
                         </motion.div>
                         
                         <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute top-[15%] right-[45%] flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-[#050816] border border-[#8B5CF6] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                               <Target size={16} className="text-[#8B5CF6]" />
                            </div>
                            <span className="text-[9px] font-mono tracking-widest text-[#8B5CF6] uppercase">Quest Gen</span>
                         </motion.div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
      </section>

      {/* SECTION 4: FAN DNA LAB */}
      <section className="min-h-screen w-full max-w-7xl px-4 py-24 relative z-10 flex flex-col items-center justify-center">
         <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ margin: "-20%" }} transition={{ duration: 0.8 }} className="w-full max-w-5xl bg-[#050816]/70 backdrop-blur-2xl p-12 rounded-[3rem] border border-indigo-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.15),inset_0_0_30px_rgba(255,255,255,0.02)] hover:shadow-[0_0_80px_rgba(79,70,229,0.25),inset_0_0_50px_rgba(255,255,255,0.05)] transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-400 mb-6 flex items-center gap-3">
                     <Fingerprint size={16} /> Identity Evolution Lab
                  </h2>
                  <h3 className="text-5xl font-display font-black text-white mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Tactical Analyst</h3>
                  <p className="text-slate-400 font-mono text-sm leading-relaxed mb-10 border-l-2 border-indigo-500/50 pl-4">
                     Your predictive behavioral pattern leans heavily towards analytical logic over emotional fervor. Analyzed across 1,240 data points, you frequently lock predictions during low volatility windows.
                  </p>
                  <div className="space-y-8">
                     <div className="group">
                        <div className="flex justify-between text-xs font-mono uppercase text-slate-300 mb-3 font-bold px-1">
                           <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFB2]"/> Accuracy</span> 
                           <span className="text-[#00FFB2] text-sm">72%</span>
                        </div>
                        <div className="w-full bg-[#03040b] rounded-full h-2.5 overflow-hidden ring-1 ring-white/5 shadow-inner">
                           <motion.div initial={{ width: 0 }} whileInView={{ width: '72%' }} viewport={{ margin: "-20%" }} transition={{ duration: 1.5, delay: 0.5 }} className="bg-gradient-to-r from-teal-600 to-[#00FFB2] h-full rounded-full relative group-hover:brightness-125 transition-all">
                              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                           </motion.div>
                        </div>
                     </div>
                     <div className="group">
                        <div className="flex justify-between text-xs font-mono uppercase text-slate-300 mb-3 font-bold px-1">
                           <span className="flex items-center gap-2"><Target size={14} className="text-[#FF8A00]"/> Risk Appetite</span> 
                           <span className="text-[#FF8A00] text-sm flex items-center gap-1">Optimal <Cpu size={12}/></span>
                        </div>
                        <div className="w-full bg-[#03040b] rounded-full h-2.5 overflow-hidden ring-1 ring-white/5 shadow-inner">
                           <motion.div initial={{ width: 0 }} whileInView={{ width: '50%' }} viewport={{ margin: "-20%" }} transition={{ duration: 1.5, delay: 0.7 }} className="bg-gradient-to-r from-orange-600 to-[#FF8A00] h-full rounded-full relative group-hover:brightness-125 transition-all">
                              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                           </motion.div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex justify-center relative">
                  <div className="w-80 h-80 border border-slate-700/50 rounded-full relative animate-[spin_40s_linear_infinite] flex items-center justify-center">
                     <div className="absolute inset-0 bg-[conic-gradient(var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent rounded-full pointer-events-none"></div>
                     <div className="w-64 h-64 border border-slate-600/50 rounded-full flex items-center justify-center relative animate-[spin_30s_linear_infinite_reverse]">
                        <div className="w-48 h-48 border-2 border-indigo-500/30 rounded-full bg-indigo-500/5 backdrop-blur-md shadow-[inset_0_0_50px_rgba(79,70,229,0.1)]"></div>
                     </div>
                     {/* Orbiting nodes */}
                     <div className="absolute top-0 w-3 h-3 rounded-full bg-[#00FFB2] shadow-[0_0_15px_#00FFB2]"></div>
                     <div className="absolute bottom-0 right-14 w-3 h-3 rounded-full bg-[#FF4D6D] shadow-[0_0_15px_#FF4D6D]"></div>
                     <div className="absolute top-1/2 -left-1.5 w-3 h-3 rounded-full bg-[#FACC15] shadow-[0_0_15px_#FACC15]"></div>
                  </div>
                  <Fingerprint size={80} className="text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]" />
               </div>
            </div>
         </motion.div>
      </section>

      {/* SECTION 5: CLAN WAR ZONE */}
      <section className="min-h-screen w-full relative z-10 flex flex-col items-center justify-center border-y border-rose-900/30 bg-[#050204]/80 backdrop-blur-md py-32 overflow-hidden transition-colors duration-1000 hover:bg-[#080306]/90">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-950/40 via-[#050204]/80 to-[#050204] pointer-events-none"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
         
         <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-20%" }} transition={{ duration: 0.8 }} className="w-full max-w-6xl px-4 flex flex-col items-center relative z-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-white/50 mb-4 font-mono">GLOBAL CONFLICT</h2>
            <h1 className="text-5xl font-display font-black text-rose-500 mb-20 tracking-widest drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]">WAR ZONE</h1>
            
            <div className="w-full flex flex-col md:flex-row items-center gap-12 md:gap-16">
               <div className="flex flex-col items-center text-center group">
                  <div className="w-40 h-40 rounded-full border-4 border-[#3B82F6] flex items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.3)] bg-slate-900 mb-6 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                     <HolographicCrystal type="badge" color="#3B82F6" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-white tracking-widest uppercase">{CLAN_WAR.clanName}</h3>
                  <span className="text-sm font-mono text-[#3B82F6] font-bold tracking-widest mt-2 bg-[#3B82F6]/10 px-4 py-1.5 rounded-full border border-[#3B82F6]/20">{CLAN_WAR.territoryControl}% Control</span>
               </div>
               
               <div className="flex-1 w-full text-center flex flex-col items-center mt-[-40px]">
                  <span className="text-xs font-mono tracking-[0.6em] text-rose-300/80 mb-6 font-bold flex items-center gap-3">
                     <Swords size={16} /> LIVE TERRITORY <Swords size={16} />
                  </span>
                  <div className="w-full h-12 bg-[#050816] rounded-full overflow-hidden flex ring-4 ring-[#050204] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
                     <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-rose-900/50 z-10 -translate-x-1/2"></div>
                     <motion.div className="bg-gradient-to-r from-blue-700 via-blue-500 to-[#3B82F6] h-full relative" initial={{ width: 0 }} whileInView={{ width: `${CLAN_WAR.territoryControl}%` }} viewport={{ margin: "-20%" }} transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}>
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/30 skew-x-12 mix-blend-overlay"></div>
                     </motion.div>
                     <motion.div className="bg-gradient-to-l from-rose-700 via-rose-500 to-[#FF4D6D] h-full relative" initial={{ width: 0 }} whileInView={{ width: `${100-CLAN_WAR.territoryControl}%` }} viewport={{ margin: "-20%" }} transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}>
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-white/30 -skew-x-12 mix-blend-overlay"></div>
                     </motion.div>
                  </div>
               </div>

               <div className="flex flex-col items-center text-center group">
                  <div className="w-40 h-40 rounded-full border-4 border-[#FF4D6D] flex items-center justify-center relative shadow-[0_0_50px_rgba(255,77,109,0.3)] bg-slate-900 mb-6 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                     <HolographicCrystal type="badge" color="#FF4D6D" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-white tracking-widest uppercase">{CLAN_WAR.opponentName}</h3>
                  <span className="text-sm font-mono text-[#FF4D6D] font-bold tracking-widest mt-2 bg-[#FF4D6D]/10 px-4 py-1.5 rounded-full border border-[#FF4D6D]/20">{100 - CLAN_WAR.territoryControl}% Control</span>
               </div>
            </div>
         </motion.div>
      </section>

      {/* SECTION 6: LEGACY TIMELINE */}
      <section className="min-h-screen w-full max-w-7xl px-4 py-32 relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ margin: "-20%" }} transition={{ duration: 0.8 }} className="text-center mb-24">
             <Trophy size={64} className="text-[#FACC15] mx-auto mb-8 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
             <h2 className="text-5xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] via-white to-amber-200 tracking-tight pb-2">Your Season Legacy</h2>
             <p className="text-slate-400 font-mono mt-6 uppercase tracking-[0.3em] text-sm font-bold opacity-80 decoration-[#FACC15]/30 underline underline-offset-8">AI-Synthesized Recap</p>
          </motion.div>

          <div className="max-w-4xl w-full relative pb-20">
             {/* Timeline center line */}
             <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FACC15] via-[#8B5CF6]/30 to-transparent md:-translate-x-1/2 rounded-full overflow-hidden">
                <div className="w-full h-32 bg-white/50 animate-[slideDown_3s_linear_infinite]"></div>
             </div>
             
             {[
               { title: "The Rival Hunter Rises", desc: "You accurately predicted 9 underdog comebacks, outperforming 85% of standard algorithms. The Prediction Core upgraded your risk profile.", date: "Week 2", icon: Target, color: "#3B82F6" },
               { title: "Clan War Veteran", desc: "Generated 4,200 XP for Cyber Titans during the bloody siege of Goal Hunters. Territory expanded by 14% due to your direct inputs.", date: "Week 5", icon: Swords, color: "#FF4D6D" },
               { title: "Emotion System Bypass", desc: "Made 14 highly logical predictions during extreme crowd emotional volatility states, cementing your Tactical Analyst archetype.", date: "Week 7", icon: Activity, color: "#00FFB2" },
             ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-10%" }} transition={{ duration: 0.6, delay: i*0.2 }} className={`flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 relative w-full ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} group`}>
                   <div className={`md:w-1/2 bg-[#050816]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(255,255,255,0.02)] hover:border-[${item.color}]/50 hover:shadow-[0_0_40px_${item.color}40,inset_0_0_20px_rgba(255,255,255,0.05)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] ml-14 md:ml-0 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} relative overflow-hidden`}>
                      <div className={`absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      <span className="text-xs font-mono tracking-widest font-bold mb-2 block uppercase" style={{color: item.color}}>{item.date}</span>
                      <h4 className="text-2xl font-display font-black text-white mb-4 tracking-wide">{item.title}</h4>
                      <p className="text-sm text-slate-400 font-mono leading-relaxed">{item.desc}</p>
                   </div>
                   <div className={`absolute md:relative left-[20px] md:left-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#050816] md:border-4 flex items-center justify-center shrink-0 z-10 shadow-[0_0_25px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:shadow-[0_0_40px_${item.color}80] transition-all duration-500 md:-translate-x-0 -translate-x-1/2`} style={{borderColor: `${item.color}50`}}>
                      <item.icon size={28} style={{color: item.color}} className="group-hover:animate-pulse" />
                   </div>
                   <div className="hidden md:block w-1/2"></div>
                </motion.div>
             ))}
          </div>
      </section>
      
      {/* GLOBAL ALERTS TICKER */}
      <div className="fixed bottom-0 w-full bg-[#050816]/95 backdrop-blur-xl border-t border-slate-800/80 flex overflow-hidden py-3 z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
         <div className="flex animate-marquee whitespace-nowrap items-center">
           <div className="flex gap-20 px-10 text-xs font-mono tracking-[0.2em] text-slate-400 uppercase font-bold">
             <span className="flex items-center gap-3"><span className="text-[#FF8A00] animate-pulse">⚡</span> Dragons FC momentum surge</span>
             <span className="flex items-center gap-3"><span className="text-[#FF4D6D] animate-pulse">🔥</span> Cyber Titans dominating (62%)</span>
             <span className="flex items-center gap-3"><span className="text-[#FACC15] animate-pulse">🏆</span> 184,203 active fans</span>
             <span className="flex items-center gap-3"><span className="text-[#00FFB2] animate-pulse">🤖</span> Reward Agent: XP 1.5x</span>
           </div>
           <div className="flex gap-20 px-10 text-xs font-mono tracking-[0.2em] text-slate-400 uppercase font-bold">
             <span className="flex items-center gap-3"><span className="text-[#FF8A00] animate-pulse">⚡</span> Dragons FC momentum surge</span>
             <span className="flex items-center gap-3"><span className="text-[#FF4D6D] animate-pulse">🔥</span> Cyber Titans dominating (62%)</span>
             <span className="flex items-center gap-3"><span className="text-[#FACC15] animate-pulse">🏆</span> 184,203 active fans</span>
             <span className="flex items-center gap-3"><span className="text-[#00FFB2] animate-pulse">🤖</span> Reward Agent: XP 1.5x</span>
           </div>
         </div>
      </div>
      
      <style>{`
        @keyframes slideDown { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(400px); opacity: 0; } }
      `}</style>
    </motion.div>
    </>
  );
}
