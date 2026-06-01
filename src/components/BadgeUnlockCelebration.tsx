/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, FileText, Sparkles, Heart, ShieldCheck, Star, X, Sun, CheckCircle } from 'lucide-react';

interface BadgeUnlockCelebrationProps {
  badgeKey: 'acolhedora' | 'narradora' | 'pioneira' | 'empatica' | 'guardia';
  solanaTx?: string;
  onClose: () => void;
}

// Badge-specific metadata matching the main app themes
const BADGES_INFO = {
  acolhedora: {
    title: 'Acolhedora Certificada',
    desc: 'Você acendeu uma chama de esperança! Sua mensagem acolhedora enviada com carinho e sem julgamentos agora apoia outra mãe atípica.',
    icon: Award,
    gradient: 'from-amber-400 via-yellow-300 to-amber-500',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    accentColor: '#F59E0B',
    phrase: 'A empatia é a luz que guia a maternidade atípica.',
  },
  narradora: {
    title: 'Mãe Narradora',
    desc: 'Sua voz foi ouvida! Ao compartilhar seu primeiro desabafo e a respeito da jornada de seu filho, você quebrou o silêncio da rotina cansativa.',
    icon: FileText,
    gradient: 'from-pink-400 via-rose-300 to-pink-500',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    accentColor: '#EC4899',
    phrase: 'Nenhuma história de amor e luta deve ser invisível.',
  },
  pioneira: {
    title: 'Pioneira da Rede',
    desc: 'Primeira conexão estabelecida! Ao desabafar com a Piana, nossa assistente acolhedora de suporte ético, você iniciou uma jornada de autodescoberta.',
    icon: Sparkles,
    gradient: 'from-purple-400 via-violet-300 to-purple-500',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    accentColor: '#8B5CF6',
    phrase: 'Cuidar de você é o primeiro passo para cuidar do outro.',
  },
  empatica: {
    title: 'Super Empática',
    desc: 'Um farol na comunidade! Ao oferecer suporte dedicado e carinho a pelo menos 3 mães diferentes, você construiu um forte pilar de acolhimento mútuo.',
    icon: Heart,
    gradient: 'from-rose-400 via-rose-300 to-rose-500',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    accentColor: '#F43F5E',
    phrase: 'Na união de mães atípicas, o cansaço vira acolhimento.',
  },
  guardia: {
    title: 'Guardiã da Transparência',
    desc: 'Privacidade assegurada! Ao auditar e verificar suas assinaturas criptográficas on-chain, você garantiu a integridade e o anonimato da nossa rede de apoio.',
    icon: ShieldCheck,
    gradient: 'from-emerald-400 via-teal-300 to-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    accentColor: '#10B981',
    phrase: 'A tecnologia é segura quando protege quem amamos.',
  },
};

export default function BadgeUnlockCelebration({ badgeKey, solanaTx, onClose }: BadgeUnlockCelebrationProps) {
  const badge = BADGES_INFO[badgeKey] || BADGES_INFO.acolhedora;
  const BadgeIcon = badge.icon;

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; scale: number; duration: number }>>([]);
  const [clickBursts, setClickBursts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [shined, setShined] = useState(false);

  // Generate background light particle dust
  useEffect(() => {
    const list = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage x
      y: 100 + Math.random() * 20, // start below
      delay: Math.random() * 3,
      scale: 0.4 + Math.random() * 0.8,
      duration: 4 + Math.random() * 5,
    }));
    setParticles(list);

    // Dynamic shimmer interval on the medal
    const interval = setInterval(() => {
      setShined(prev => !prev);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleMedalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newBurst = {
      id: Date.now(),
      x,
      y,
    };
    setClickBursts(prev => [...prev, newBurst]);
    setTimeout(() => {
      setClickBursts(prev => prev.filter(b => b.id !== newBurst.id));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden">
      
      {/* Light-theme Custom CSS injection for specialized halo effects and floating sparkles */}
      <style>{`
        @keyframes sun-ray-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes float-dust {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes aura-expansion {
          0% { transform: scale(0.95); opacity: 0.35; }
          50% { transform: scale(1.1); opacity: 0.55; }
          100% { transform: scale(0.95); opacity: 0.35; }
        }
        @keyframes radial-pulse {
          0% { box-shadow: 0 0 40px 10px ${badge.glowColor}; }
          50% { box-shadow: 0 0 80px 25px ${badge.glowColor}; }
          100% { box-shadow: 0 0 40px 10px ${badge.glowColor}; }
        }
        @keyframes slide-shimmer {
          0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
          15% { opacity: 0.8; }
          30% { transform: translateX(150%) skewX(-25deg); opacity: 0; }
          100% { transform: translateX(150%) skewX(-25deg); opacity: 0; }
        }
        @keyframes burst-ray {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .anim-sun-ray {
          animation: sun-ray-spin 25s linear infinite;
        }
        .anim-aura-pulse {
          animation: aura-expansion 4s ease-in-out infinite;
        }
        .anim-radial-pulse {
          animation: radial-pulse 3.5s ease-in-out infinite;
        }
        .anim-shimmer {
          animation: slide-shimmer 4s infinite ease-out;
        }
        .float-sparkle {
          animation: float-dust linear infinite;
        }
      `}</style>

      {/* Deep Glass Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0F0D1C]/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Radiant Light Cone / Sun Ray background (Light emissions) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        
        {/* Soft backlighting spheres */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[100px] anim-aura-pulse transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${badge.glowColor} 0%, rgba(139, 124, 246, 0.05) 70%, transparent 100%)` }}
        />
        
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-20"
          style={{ background: `radial-gradient(circle, #FAF9F7 0%, transparent 80%)` }}
        />

        {/* Dynamic spinning sun rays (light-lines vector mask) */}
        <div className="absolute w-[500px] h-[500px] opacity-[0.16] anim-sun-ray flex items-center justify-center">
          {Array.from({ length: 16 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2.5 h-[500px] rounded-full bg-gradient-to-t from-transparent via-white to-transparent" 
              style={{ transform: `rotate(${i * (360 / 16)}deg)` }}
            />
          ))}
        </div>

        {/* Floating Light Sparks */}
        {particles.map((p) => {
          const colors = [
            'text-amber-300',
            'text-white',
            'text-indigo-200',
            'text-yellow-100',
            'text-pink-300',
            'text-purple-300'
          ];
          const colorClass = colors[p.id % colors.length];
          return (
            <div
              key={p.id}
              className={`absolute float-sparkle ${colorClass} mix-blend-screen opacity-0`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `scale(${p.scale})`,
              }}
            >
              {p.id % 2 === 0 ? (
                <Star className="w-5 h-5 fill-current" />
              ) : (
                <Sun className="w-4 h-4 fill-current" />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Celebration Content Card */}
      <motion.div
        initial={{ scale: 0.85, y: 35, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 100 } }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        className="relative bg-white/95 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-lg w-full rounded-2xl p-6 md:p-8 text-center overflow-hidden"
      >
        
        {/* Border Aura Light Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#8B7CF6] to-emerald-400"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 text-stone-400 hover:text-stone-700 hover:bg-slate-100 rounded-full cursor-pointer transition focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Subtitle/Indicator - Soft Web3 tag */}
        <div className="inline-flex items-center gap-1.5 bg-[#8B7CF6]/10 text-[#8B7CF6] font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Medalha de Empatia Desbloqueada
        </div>

        {/* 3D Touch-interactive Spinning Medal */}
        <div className="relative w-44 h-44 mx-auto mb-6 flex items-center justify-center select-none">
          
          {/* External golden rotating rings */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/20 anim-sun-ray opacity-60"></div>
          <div 
            className="absolute inset-2 rounded-full border border-dashed anim-sun-ray opacity-30"
            style={{ borderColor: badge.accentColor, animationDirection: 'reverse', animationDuration: '10s' }}
          ></div>
          
          {/* Pulsing Backlight glow sphere */}
          <div className="absolute w-32 h-32 rounded-full anim-radial-pulse"></div>

          {/* Core Medal */}
          <motion.div
            whileHover={{ scale: 1.12, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMedalClick}
            className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-stone-800 to-black p-1 shadow-[0_12px_24px_rgba(0,0,0,0.5)] cursor-pointer flex items-center justify-center"
          >
            {/* Gloss reflection line crossing */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
              <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/35 to-transparent anim-shimmer" />
            </div>

            {/* Inner ring background depending on badge key */}
            <div className={`w-full h-full rounded-full bg-gradient-to-b ${badge.gradient} p-2 flex items-center justify-center`}>
              <div className="w-full h-full rounded-full bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white relative border border-white/10">
                
                {/* Glowing light ray burst */}
                <div 
                  className="absolute inset-0 rounded-full opacity-15"
                  style={{ background: `radial-gradient(circle, ${badge.accentColor} 0%, transparent 80%)` }}
                />

                <BadgeIcon className="w-13 h-13 filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)] relative z-10" style={{ color: badge.accentColor }} />
                
                {/* Micro glowing stars inside the sphere */}
                <Star className="absolute top-4 left-4 w-2 h-2 text-white/50 fill-white" />
                <Star className="absolute bottom-4 right-5 w-2.5 h-2.5 text-white/70 fill-white" />
              </div>
            </div>

            {/* Interactive bursts created on tap */}
            {clickBursts.map((b) => (
              <span
                key={b.id}
                className="absolute w-8 h-8 rounded-full border-2 border-white/50 bg-white/10 pointer-events-none"
                style={{
                  left: `${b.x}px`,
                  top: `${b.y}px`,
                  animation: 'burst-ray 0.7s forwards ease-out',
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Congratulatory Text Headers */}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 font-sans mb-2.5">
          {badge.title}
        </h2>

        {/* Dedication beautiful quote phrase */}
        <p className="text-xs font-serif italic text-slate-500 mb-4 px-3">
          "{badge.phrase}"
        </p>

        {/* Detailed Description block */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-stone-650 text-[12px] md:text-xs leading-relaxed text-left relative">
          <p className="font-medium text-slate-700">{badge.desc}</p>
          
          {/* Solana Proof details if available */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-[10px] text-slate-450">
            <div className="flex items-center gap-1 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Registrado On-Chain</span>
            </div>
            {solanaTx && (
              <div className="truncate text-slate-400 hover:text-[#8B7CF6] transition flex items-center gap-1 self-start sm:self-center bg-white border border-slate-100 px-2.5 py-1 rounded-md">
                <span>TX:</span>
                <span className="max-w-[120px] truncate">{solanaTx}</span>
              </div>
            )}
          </div>
        </div>

        {/* Positive Support Action Button */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full bg-[#8B7CF6] hover:bg-[#7a6ae5] active:bg-[#6c5cd4] text-white font-black text-sm py-3.5 px-6 rounded-xl shadow-[0_4px_16px_rgba(139,124,246,0.25)] transition duration-200 ease-in-out transform hover:-translate-y-0.5 relative group pointer-events-auto cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 fill-white/10" /> Ativar Brilho de Conquista e Voltar
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent anim-shimmer pointer-events-none" />
          </button>
          
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            Este prêmio foi registrado livre de impostos e taxas como prova social na rede Solana Devnet.
          </p>
        </div>

      </motion.div>
    </div>
  );
}
