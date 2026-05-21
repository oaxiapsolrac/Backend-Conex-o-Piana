/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Shield, AlertCircle, Phone, ArrowUpRight, Heart, 
  BrainCircuit, Info, LifeBuoy, AlertTriangle, ShieldAlert, CornerDownRight, 
  MessageCircle, ExternalLink, HelpCircle, Activity, HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AssistantMessage, User } from '../types';

interface AssistenteChatProps {
  user: User;
}

// Empathy Conversation starter templates for atypical mothers
const SUGGESTED_STARTERS = [
  {
    icon: '💡',
    title: 'Desgaste Emocional',
    summary: 'Estou me sentindo sobrecarregada hoje...',
    text: 'Estou me sentindo extremamente sobrecarregada com a rotina de terapias e consultas essa semana. Sinto que não dou conta de tudo sozinha.'
  },
  {
    icon: '🏫',
    title: 'Desafios Escolares',
    summary: 'Como conversar sobre inclusão?',
    text: 'Como posso conversar de forma pacífica com a escola do meu filho para exigir que eles façam adaptações de inclusão que ele tem direito?'
  },
  {
    icon: '🌸',
    title: 'Julgamento Social',
    summary: 'Mães na praça julgaram o comportamento...',
    text: 'Hoje algumas mães na pracinha julgaram o comportamento estereotipado do meu filho e fiquei com o coração partido. Me sinto sem saber o que fazer.'
  },
  {
    icon: '🌟',
    title: 'Acolhimento da Culpa',
    summary: 'Como lidar com o cansaço diário?',
    text: 'Sinto muita culpa por me cansar tanto da rotina de cuidados do meu campeão e às vezes querer apenas um minuto de silêncio absoluto.'
  }
];

// Contextual DID Avatar wrapper
function DidAvatar({ did, size = 32 }: { did: string; size?: number }) {
  const chars = did.replace(/[^a-zA-Z0-9]/g, '');
  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += chars.charCodeAt(i);
  }
  
  const presets = [
    { bg: 'from-pink-400 to-rose-500' },
    { bg: 'from-teal-400 to-emerald-500' },
    { bg: 'from-indigo-400 to-purple-500' },
    { bg: 'from-amber-400 to-orange-500' },
    { bg: 'from-sky-400 to-blue-500' },
  ];
  
  const preset = presets[sum % presets.length];
  const initials = chars.substring(0, 2).toUpperCase() || 'M';
  
  return (
    <div 
      className={`relative rounded-full font-mono flex items-center justify-center text-white text-[10px] font-bold shadow-2xs shrink-0 select-none bg-gradient-to-tr ${preset.bg}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {initials}
    </div>
  );
}

interface AssistenteChatProps {
  user: User;
  syncProofs?: () => Promise<void>;
  onNewProofEmitted?: (proof: any) => void;
}

export default function AssistenteChat({ user, syncProofs, onNewProofEmitted }: AssistenteChatProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEthicsInfo, setShowEthicsInfo] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch historic chat messages on load
  const loadHistory = async () => {
    try {
      const resp = await fetch(`/api/assistant/history/${user.uid}`);
      const data = await resp.json();
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // Initialize with cozy greeting matching spec
          setMessages([
            {
              id: 'welcome',
              userId: user.uid,
              role: 'assistant',
              content: 'Olá! Eu sou a assistente da Conexão Piana. Estou aqui para oferecer escuta, afeto e acolhimento em sua jornada como mãe atípica. Como você está se sentindo hoje? Sinta-se livre para desabafar.',
              createdAt: new Date().toISOString(),
            },
          ]);
        } else {
          setMessages(data);
        }
      }
    } catch (e) {
      console.error('Error loading assistant chat history:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user.uid]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  // Helper routine to dispatch assistant prompts (both custom and preset)
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: AssistantMessage = {
      id: Math.random().toString(),
      userId: user.uid,
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const resp = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          message: userMsg.content,
        }),
      });

      const data = await resp.json();
      if (!data.error) {
        setMessages((prev) => [...prev, data]);
        
        // Check if pioneira badge was awarded
        if (data.pioneira_badge && onNewProofEmitted) {
          onNewProofEmitted({
            userId: user.uid,
            badge: 'pioneira',
            solanaTx: data.pioneira_badge.solanaTx,
            createdAt: data.pioneira_badge.createdAt,
            status: data.pioneira_badge.status,
          });
        }

        if (syncProofs) {
          syncProofs().catch(e => console.error('Error syncing proofs inside chat:', e));
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Assistant error:', err);
      // Failsafe portuguese cozy response
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          userId: user.uid,
          role: 'assistant',
          content: 'Sinto muito, meu canal de comunicação falhou por um instante devido a instabilidades de rede. Mas saiba que sua voz é importante e as batalhas e dores da maternidade atípica são reais e dignas de respeito. Você é forte, mas não precisa carregar todo o peso do mundo sozinha.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  const selectStarterPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  // Check if any message inside the screen triggers CVV indicators (Emotional Crisis Protocol)
  const isCrisisTriggered = messages.some((m) => {
    const textLower = m.content.toLowerCase();
    return (
      textLower.includes('188') ||
      textLower.includes('crisi') ||
      textLower.includes('sofrimento intenso') ||
      textLower.includes('desesperada') ||
      textLower.includes('cvv') ||
      textLower.includes('sozinha') ||
      textLower.includes('morte') ||
      textLower.includes('suicid') ||
      textLower.includes('desespero') ||
      textLower.includes('fim da linha') ||
      textLower.includes('não aguento mais')
    );
  });

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 font-sans flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-160px)] lg:min-h-[580px]">
      
      {/* LEFT PANEL: Crisis Prevention & Guidelines info */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 shrink-0 order-2 lg:order-1">
        
        {/* Compliance Guidelines Header Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Conformidade e Ética</h3>
          </div>
          
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Nossa Inteligência Artificial é configurada com diretrizes rígidas de segurança civil, operando apenas como um suporte de empatia preventivo para mães.
          </p>

          <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[10.5px] text-slate-650">
            <div className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold mt-0.5">✔</span>
              <p><strong>Sem Diagnósticos:</strong> Não substituímos médicos, neuropediatras ou terapeutas clínicos ocupacionais.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold mt-0.5">✔</span>
              <p><strong>Identidade Criptográfica:</strong> Suas conversas são enviadas anonimizadas pelo seu DID ({user.did.substring(0, 15)}...).</p>
            </div>
          </div>
        </div>

        {/* ALWAYS PRESENT CRISIS TELEPHONY (CVV 188) PANEL */}
        <div className="bg-rose-500/[0.03] border-2 border-dashed border-rose-500/20 rounded-2xl p-5 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg animate-pulse">
              <Phone className="w-4 h-4 fill-rose-50" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-900">Apoio Emocional de Crise</h3>
          </div>

          <p className="text-[11px] text-rose-800 leading-relaxed">
            Se você se encontra em sofrimento extremo, angústia intolerável ou precisa conversar com alguém agora, procure o <strong>CVV (Disque 188)</strong>.
          </p>

          <div className="pt-2">
            <a
              href="tel:188"
              className="inline-flex w-full items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-850 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
              <span>Ligar Grátis para o CVV (188)</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <p className="text-[9px] text-slate-400 font-mono text-center pt-1">
            Sigiloso • Confidencial • 24 Horas
          </p>
        </div>

        {/* Emergency quick numbers panel */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-2xs space-y-2.5">
          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Telefones Úteis de Emergência</span>
          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
            <div className="bg-slate-800 p-2 rounded border border-slate-750 flex flex-col">
              <span className="text-slate-400 font-sans text-[9px] uppercase">SAMU</span>
              <span className="text-rose-400 font-bold font-mono">Disque 192</span>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-750 flex flex-col">
              <span className="text-slate-400 font-sans text-[9px] uppercase">Bombeiros</span>
              <span className="text-orange-400 font-bold font-mono">Disque 193</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Chat box and Conversational flow */}
      <div className="flex-1 bg-white border border-slate-150 rounded-2xl shadow-2xs flex flex-col overflow-hidden h-[500px] sm:h-[600px] lg:h-full order-1 lg:order-2">
        
        {/* Chat window Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Animated glowing AI avatar logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
              <div className="relative p-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-xl">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-850 flex items-center gap-1.5">
                Assistente de Acolhimento
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Camada IA Responsável de Diálogo • Devnet</p>
            </div>
          </div>

          <div className="bg-white border border-slate-150/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9.5px] text-slate-550 font-mono">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>ID: {user.did.substring(0, 10)}...</span>
          </div>
        </div>

        {/* Informative disclaimer details banner */}
        <AnimatePresence>
          {showEthicsInfo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-500/[0.03] border-b border-indigo-500/10 p-4 px-5 text-[11px] text-indigo-900 leading-normal flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 fill-indigo-100/30" />
                <p>
                  <strong>Escuta ética ativa ativa:</strong> Nossos canais não emitem diagnósticos médicos ou conselhos clínicos farmacológicos. Use esse espaço para compartilhar suas batalhas diárias e encontrar sentimentos de acolhimento e escuta acolhedora livre de censuras de ego.
                </p>
              </div>
              <button 
                onClick={() => setShowEthicsInfo(false)}
                className="text-indigo-400 hover:text-indigo-600 font-mono font-bold p-1 select-none"
                title="Descartar aviso"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable chat messages list screen */}
        <div 
          className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40 relative"
          ref={scrollRef}
        >
          {/* Main timeline messages list */}
          <div className="space-y-4">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant avatar logo left of message bubble */}
                  {!isUser && (
                    <div className="p-1.5 bg-indigo-50/70 text-indigo-650 rounded-full border border-indigo-100 shrink-0 shadow-3xs mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-4 shadow-3xs border text-xs md:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 border-slate-900 text-white rounded-tr-none'
                        : 'bg-white border-slate-150 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {!isUser && (
                      <span className="text-[9px] text-indigo-550 font-mono block mb-1 uppercase font-semibold">
                        Assistente Conexão Piana
                      </span>
                    )}
                    
                    <p className="whitespace-pre-wrap font-sans font-normal text-slate-750 selection:bg-amber-100">
                      {m.content}
                    </p>

                    {/* Timestamp signature */}
                    <span className={`text-[8.5px] font-mono block mt-1.5 text-right ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Internal Crisis Warning Box inside message bubble if active */}
                    {!isUser && (m.content.includes('188') || m.content.includes('CVV')) && (
                      <div className="mt-4 pt-3 border-t border-red-100 bg-red-500/[0.03] p-3 rounded-xl border border-dashed border-red-200 text-xs text-red-950 font-medium space-y-2 animate-pulse">
                        <p className="font-bold flex items-center gap-1.5 text-red-700">
                          <Phone className="w-4 h-4 text-red-650 animate-bounce" /> Canal de Crise Ativo
                        </p>
                        <p className="leading-relaxed">Se você está experimentando momentos difíceis, sobrecarga ou tristeza extrema, disque para o CVV gratuitamente.</p>
                        <a
                          href="tel:188"
                          className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-3 py-1.5 text-[10.5px] rounded-lg transition"
                        >
                          Discar CVV (188) <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* User DID avatar right of message bubble */}
                  {isUser && (
                    <DidAvatar did={user.did} size={30} />
                  )}
                </motion.div>
              );
            })}

            {/* Simulated typing indicator */}
            {isSending && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2.5"
              >
                <div className="p-1.5 bg-indigo-50/70 text-indigo-650 rounded-full border border-indigo-100 shrink-0 mt-1 shadow-3xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                
                <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-4 shadow-3xs text-slate-400 space-y-1">
                  <span className="text-[9px] text-indigo-500 font-mono block uppercase font-semibold">
                    Analisando sentimento contextual...
                  </span>
                  <div className="flex gap-1.5 items-center py-1 px-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Interactive Preset Prompt Starters (GRID DISPLAY ON INITIAL SESSION ONLY) */}
          {messages.length <= 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 pt-6 border-t border-slate-150/50 mt-4"
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-indigo-400 fill-indigo-50/10 animate-spin" style={{ animationDuration: '6s' }} />
                Clique em uma sugestão para iniciar um diálogo:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_STARTERS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectStarterPrompt(s.text)}
                    disabled={isSending}
                    className="text-left bg-white hover:bg-slate-50/80 active:bg-indigo-50/10 border border-slate-200 rounded-xl p-3.5 shadow-3xs hover:border-indigo-250 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{s.icon}</span>
                        <strong className="text-[11px] text-slate-800 font-bold group-hover:text-indigo-600 transition-colors uppercase font-mono tracking-tight">{s.title}</strong>
                      </div>
                      <p className="text-[11.5px] text-slate-500 leading-normal font-sans italic">
                        &ldquo;{s.summary}&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-end pt-2 text-slate-400 group-hover:text-indigo-550 transition-colors items-center gap-0.5 text-[10px] font-semibold">
                      <span>Iniciar conversa</span>
                      <CornerDownRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </div>

        {/* Input box section */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 space-y-3">
          
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder={isSending ? "Aguardando resposta..." : "Compartilhe suas angústias, rotinas ou o que você desejar..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-white text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 placeholder:text-slate-400 transition"
            />
            
            <button
              type="submit"
              disabled={!inputVal.trim() || isSending}
              className="bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white px-5 rounded-xl transition disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Interactive footer details */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 text-[9.5px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Prevenção proativa de saúde mental comunitária.
            </span>
            <span>CVV: 188 • Emergência: 192/193</span>
          </div>

        </div>

      </div>

    </div>
  );
}
