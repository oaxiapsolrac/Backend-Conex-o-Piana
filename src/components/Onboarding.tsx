/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Shield, Users, ArrowRight, Cpu, Lock, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  onStartSession: () => void;
  isLoading: boolean;
}

const SIMULATED_STEPS = [
  { text: 'Iniciando ambiente seguro e privativo...', icon: Shield },
  { text: 'Codificando credenciais de acolhimento...', icon: Lock },
  { text: 'Gerando chaves de segurança para anonimato...', icon: Key },
  { text: 'Estabelecendo Identificador de Cuidado (DID)...', icon: Sparkles },
];

export default function Onboarding({ onStartSession, isLoading }: OnboardingProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (localLoading) {
      interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < SIMULATED_STEPS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              onStartSession();
            }, 0);
            return prev;
          }
        });
      }, 750);
    }
    return () => clearInterval(interval);
  }, [localLoading, onStartSession]);

  const handleTrigger = () => {
    setLocalLoading(true);
    setStepIndex(0);
  };

  const CurrentIcon = SIMULATED_STEPS[stepIndex].icon;

  return (
    <div className="min-h-[calc(100vh-140px)] bg-piana-bg flex items-center justify-center p-4 md:p-12 font-sans select-none">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left column: Warm, human, empathetic representation */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-piana-secondary/30 text-piana-primary px-4 py-1.5 rounded-full text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Infraestrutura Social de Acolhimento</span>
          </div>
          
          <h1 className="text-stone-900 text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tight leading-none">
            Tecnologia que <span className="text-piana-primary">acolhe</span> sem intimidar.
          </h1>
          
          <p className="text-stone-600 text-base md:text-lg lg:text-xl font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
            A Conexão Piana é um espaço seguro e livre de julgamentos para mães de crianças atípicas. Compartilhe suas experiências, encontre apoio emocional e sinta-se em casa com total anonimato e proteção.
          </p>
          
          {/* Supportive values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-start gap-3 bg-white/50 border border-stone-100 p-4 rounded-2xl">
              <div className="bg-piana-primary/10 p-2.5 rounded-xl text-piana-primary shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-stone-800">Privacidade Absoluta</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Sua voz protegida por tecnologia de anonimato seguro (DID).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/50 border border-stone-100 p-4 rounded-2xl">
              <div className="bg-piana-secondary/35 p-2.5 rounded-xl text-stone-700 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-stone-800">Ambiente Não Tóxico</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Um feed livre de algoritmos competitivos, focado no afeto.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Calm Welcoming Interactive Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl shadow-piana border border-stone-150 p-6 md:p-8 space-y-6 relative overflow-hidden"
          >
            {/* Soft pink / lavander decoration blobs in background */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-piana-secondary/30 rounded-full blur-2xl -z-10 translate-x-4 -translate-y-4"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-piana-support/25 rounded-full blur-3xl -z-10 -translate-x-10 translate-y-10"></div>

            <div className="space-y-2 text-center">
              <h2 className="text-lg font-bold text-stone-800">Seja bem-vinda</h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Para manter sua total segurança e privacidade, geramos credenciais anônimas automáticas baseadas em criptografia.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!localLoading && !isLoading ? (
                <motion.div
                  key="form-welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-3 bg-piana-bg/60 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                      <Lock className="w-3.5 h-3.5 text-piana-primary" />
                      <span>Sua Proteção Digital</span>
                    </div>
                    
                    <div className="text-[11.5px] text-stone-600 space-y-2 leading-relaxed font-medium">
                      <p>✨ Nenhum dado de CPF, e-mail ou nome é solicitado.</p>
                      <p>🔒 Sua conta é identificada por uma chave de bem-estar social.</p>
                      <p>🌱 Ambiente acolhedor moderado com inteligência ética e respeitosa.</p>
                    </div>
                  </div>

                  {/* Primary Emotional Warm Button */}
                  <button
                    onClick={handleTrigger}
                    className="w-full bg-piana-primary hover:scale-[1.01] active:scale-[0.99] text-white font-semibold text-sm py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <span>Entrar no Ambiente Seguro</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1.5">
                    <p className="text-[10px] text-stone-400 font-medium">
                      Ao entrar, você concorda com nossas diretrizes de acolhimento mútuo.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="initializing-card"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 space-y-6 flex flex-col items-center justify-center"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Ring loader in Piana primary color */}
                    <div className="animate-spin rounded-full h-16 w-16 border-2 border-dashed border-piana-primary/20 border-t-piana-primary"></div>
                    <div className="absolute shrink-0">
                      <CurrentIcon className="w-6 h-6 text-piana-primary animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-center px-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      Espaço de Cuidado
                    </h3>
                    <p className="text-xs font-semibold text-stone-700 min-h-[36px] flex items-center justify-center max-w-xs mx-auto">
                      {SIMULATED_STEPS[stepIndex].text}
                    </p>
                  </div>

                  {/* Progressive indicator bar */}
                  <div className="flex gap-1.5 justify-center">
                    {SIMULATED_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                          i === stepIndex ? 'bg-piana-primary w-9' : i < stepIndex ? 'bg-piana-primary/40' : 'bg-stone-100'
                        }`}
                      ></div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
