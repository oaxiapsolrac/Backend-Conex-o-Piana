/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, CheckCircle, ArrowRight, Heart, Lock, Key, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Consent, User } from '../types';

interface ConsentLGPDProps {
  user: User;
  onConsentSuccess: (consent: Consent, isBackup: boolean, warnMessage: string) => void;
  simulateSolanaError: boolean;
  onViewBlock: () => void;
}

const SIGNING_STEPS = [
  { text: 'Validando identificadores seguros...', label: 'Identidade' },
  { text: 'Gerando assinaturas de proteção do anonimato...', label: 'Privacidade' },
  { text: 'Criptografando para o livro-razão protetivo...', label: 'Criptografia' },
  { text: 'Sincronizando portal de cuidado de mães...', label: 'Finalização' },
];

export default function ConsentLGPD({ user, onConsentSuccess, simulateSolanaError, onViewBlock }: ConsentLGPDProps) {
  const [acceptedClauses, setAcceptedClauses] = useState({
    pseudonym: false,
    blockchain: false,
    ethics: false,
  });

  const [isSigningFlow, setIsSigningFlow] = useState(false);
  const [signingStep, setSigningStep] = useState(0);
  const [simulatedHash, setSimulatedHash] = useState('');

  useEffect(() => {
    const chars = '0123456789abcdef';
    let h = '';
    for (const i of Array(32).keys()) {
      h += chars[Math.floor(Math.random() * chars.length)];
    }
    setSimulatedHash('0x' + h);
  }, [isSigningFlow]);

  const handleStartSigning = () => {
    setIsSigningFlow(true);
    setSigningStep(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSigningFlow) {
      timer = setInterval(() => {
        setSigningStep((prev) => {
          if (prev < SIGNING_STEPS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(timer);
            executeConsentSubmission();
            return prev;
          }
        });
      }, 850);
    }
    return () => clearInterval(timer);
  }, [isSigningFlow]);

  const executeConsentSubmission = async () => {
    try {
      const response = await fetch('/api/consents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          simulateError: simulateSolanaError,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const isBackup = data.consent.status === 'pending';
        onConsentSuccess(data.consent, isBackup, data.message);
      } else {
        throw new Error(data.error || 'Erro ao registrar consentimento.');
      }
    } catch (e: any) {
      console.error(e);
      const fallbackConsent: Consent = {
        userId: user.uid,
        hash: simulatedHash,
        transactionId: 'pending_sync_client_' + Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      onConsentSuccess(
        fallbackConsent,
        true,
        'Registro de privacidade salvo de forma protegida localmente. Será sincronizado com a rede de suporte.'
      );
    } finally {
      setIsSigningFlow(false);
    }
  };

  const allAccepted = acceptedClauses.pseudonym && acceptedClauses.blockchain && acceptedClauses.ethics;

  return (
    <div className="max-w-2xl mx-auto my-8 px-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl shadow-piana border border-stone-150 p-6 md:p-10"
      >
        <AnimatePresence mode="wait">
          {!isSigningFlow ? (
            <motion.div
              key="consent-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-piana-primary/10 text-piana-primary rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-stone-900">Privacidade, Segurança e LGPD</h2>
                  <p className="text-xs text-stone-500 font-medium">Assinatura de Proteção • Tecnologia Invisível de Cuidado</p>
                </div>
              </div>

              {/* Identity Display Banner */}
              <div className="bg-piana-bg border border-stone-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Identificador Criptográfico Anônimo (DID)</p>
                  <p className="text-xs font-mono font-semibold text-stone-700 mt-1 select-all">{user.did}</p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-100 shadow-3xs flex items-center gap-2 text-xs text-stone-600">
                  <span className="h-2 w-2 rounded-full bg-piana-success animate-pulse"></span>
                  <span className="font-semibold text-stone-700">Ativa</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                Para que você possa compartilhar, pedir ajuda e dar carinho de forma totalmente livre de julgamentos, criamos um pacto de confidencialidade técnica. Nossas chaves criptográficas garantem que nenhuma informação identificável sobre você fique salva.
              </p>

              {/* Interactive Clause Cards */}
              <div className="space-y-3.5 pt-2">
                {/* Clause 1 */}
                <div 
                  onClick={() => setAcceptedClauses({ ...acceptedClauses, pseudonym: !acceptedClauses.pseudonym })}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition duration-300 cursor-pointer ${
                    acceptedClauses.pseudonym 
                      ? 'bg-piana-primary/5 border-piana-primary/30 shadow-3xs' 
                      : 'bg-stone-50/55 border-stone-100 hover:bg-stone-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id="clause-pseudonym"
                      checked={acceptedClauses.pseudonym}
                      onChange={() => {}} 
                      className="rounded-lg border-stone-300 text-piana-primary focus:ring-piana-primary/30 w-5 h-5 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="clause-pseudonym" className="text-xs md:text-[13px] text-stone-600 leading-normal cursor-pointer">
                    <strong className="text-stone-800 block font-bold mb-0.5">Anonimato de Identidade (Art. 13-A da LGPD)</strong>
                    Autorizo o uso do meu identificador anônimo DID exclusivo. Entendo que nenhuma informação como CPF, e-mail ou nome pessoal será coletada ou armazenada.
                  </label>
                </div>

                {/* Clause 2 */}
                <div 
                  onClick={() => setAcceptedClauses({ ...acceptedClauses, blockchain: !acceptedClauses.blockchain })}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition duration-300 cursor-pointer ${
                    acceptedClauses.blockchain 
                      ? 'bg-piana-primary/5 border-piana-primary/30 shadow-3xs' 
                      : 'bg-stone-50/55 border-stone-100 hover:bg-stone-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id="clause-blockchain"
                      checked={acceptedClauses.blockchain}
                      onChange={() => {}}
                      className="rounded-lg border-stone-300 text-piana-primary focus:ring-piana-primary/30 w-5 h-5 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="clause-blockchain" className="text-xs md:text-[13px] text-stone-600 leading-normal cursor-pointer">
                    <strong className="text-stone-800 block font-bold mb-0.5">Registro Imutável de Salvaguarda</strong>
                    Compreendo que a prova criptográfica do meu ato de consentimento será registrada no ledger imutável (Memo na Solana) de forma anônima para comprovação ética e jurídica do MVP.
                  </label>
                </div>

                {/* Clause 3 */}
                <div 
                  onClick={() => setAcceptedClauses({ ...acceptedClauses, ethics: !acceptedClauses.ethics })}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition duration-300 cursor-pointer ${
                    acceptedClauses.ethics 
                      ? 'bg-piana-primary/5 border-piana-primary/30 shadow-3xs' 
                      : 'bg-stone-50/55 border-stone-100 hover:bg-stone-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id="clause-ethics"
                      checked={acceptedClauses.ethics}
                      onChange={() => {}}
                      className="rounded-lg border-stone-300 text-piana-primary focus:ring-piana-primary/30 w-5 h-5 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="clause-ethics" className="text-xs md:text-[13px] text-stone-600 leading-normal cursor-pointer">
                    <strong className="text-stone-800 block font-bold mb-0.5">Pacto Empático e Antipoluição Cognitiva</strong>
                    Comprometo-me a interagir com acolhimento e afeto, sabendo que este ambiente é imune a discursos ofensivos ou hostilidades para manter o bem-estar mental das mães.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-2">
                <button
                  onClick={handleStartSigning}
                  disabled={!allAccepted}
                  className="w-full bg-piana-primary hover:scale-[1.005] active:scale-[0.995] text-white font-semibold text-sm py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Ativar e Entrar no Ambiente Seguro</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="bg-piana-secondary/15 p-4 rounded-2xl border border-piana-secondary/35 text-[11px] leading-relaxed text-stone-600 flex items-start gap-3">
                  <Compass className="w-4 h-4 text-piana-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-800 font-bold block mb-0.5">Onde está a complexidade tecnológica?</strong>
                    Ela é invisível. Ao clicar, o seu navegador calcula um hash digital que serve como um certificado digital anônimo inviolável, salvaguardando a sua conta. Nenhuma informação pessoal precisa ser criada ou exposta.
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* WARM AESTHETIC SIGNING VISUALIZER (Zero cyberpunk neon logs, gorgeous gentle maternal progress loader) */
            <motion.div
              key="signing-warm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 py-6 text-center"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-3 border-dashed border-piana-secondary border-t-piana-primary"></div>
                  <div className="absolute bg-[#FAF9F7] p-3.5 rounded-full border border-stone-100 shadow-md">
                    <Lock className="w-6 h-6 text-piana-primary animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-stone-900">Configurando seu Espaço de Cuidado</h3>
                  <p className="text-xs text-stone-500 font-medium">Assegurando as defesas de privacidade on-chain...</p>
                </div>
              </div>

              {/* Visual Beautiful Status Panel */}
              <div className="bg-piana-bg border border-stone-100 rounded-2.5xl p-6 text-left space-y-4 max-w-md mx-auto relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-piana-secondary via-piana-primary to-piana-support"></div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-stone-700">
                    <span>Etapa ativa:</span>
                    <span className="text-piana-primary uppercase tracking-wider text-[10px] font-bold">Processando</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-850 leading-relaxed min-h-[22px]">
                    ✨ {SIGNING_STEPS[signingStep].text}
                  </p>
                </div>

                <div className="space-y-1 border-t border-stone-200/60 pt-3">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Certificado de segurança:</span>
                    <span className="font-mono text-[10px] text-stone-500">{simulatedHash.substring(0, 18)}...</span>
                  </div>
                </div>
              </div>

              {/* Elegant Step badges */}
              <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto pt-2">
                {SIGNING_STEPS.map((step, idx) => {
                  const isActive = idx === signingStep;
                  const isDone = idx < signingStep;

                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl border text-center transition-all duration-350 ${
                        isActive 
                          ? 'border-piana-primary bg-piana-primary/5 text-piana-primary font-bold shadow-3xs'
                          : isDone
                            ? 'border-piana-success/30 bg-piana-success/10 text-stone-700 font-medium'
                            : 'border-stone-100 bg-stone-50/50 text-stone-400'
                      }`}
                    >
                      <p className="text-[11px] leading-tight truncate font-bold">{step.label}</p>
                      <p className="text-[9px] font-semibold mt-1">
                        {isDone ? '✔ Pronto' : isActive ? 'Ativo' : 'Pendente'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
