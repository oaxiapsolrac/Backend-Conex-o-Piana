/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Share2, Award, Heart, Shield, Send, Users, Sparkles, MessageSquare, 
  Check, HelpCircle, FileText, ArrowUpRight, ChevronRight, CornerDownRight, 
  AlertTriangle, Filter, Calendar, Activity, Lock, Cpu, Star, ExternalLink,
  ChevronDown, ChevronUp, RefreshCw, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, User, Interaction, Consent } from '../types';

interface FeedComunitarioProps {
  user: User;
  onViewBlock: () => void;
  simulateSolanaError: boolean;
  bypassAgeCheck: boolean;
  consents: Consent[];
  proofs: any[];
  onNewProofEmitted: (proof: any) => void;
  syncProofs?: () => Promise<void>;
}

// All collectible badges list metadata definitions
const ALL_BADGES = [
  {
    key: 'acolhedora',
    title: 'Acolhedora Certificada',
    desc: 'Deixou uma mensagem empática para apoiar outra mãe',
    icon: Award,
    color: 'from-amber-400 via-amber-300 to-amber-500',
    colorText: 'text-amber-900',
    colorBorder: 'border-amber-200',
    bgSoft: 'bg-amber-500/5',
  },
  {
    key: 'narradora',
    title: 'Mãe Narradora',
    desc: 'Publicou sua primeira história de desabafo no feed',
    icon: FileText,
    color: 'from-pink-400 via-pink-300 to-pink-500',
    colorText: 'text-pink-900',
    colorBorder: 'border-pink-200',
    bgSoft: 'bg-pink-500/5',
  },
  {
    key: 'pioneira',
    title: 'Pioneira da Rede',
    desc: 'Conversou com a Piana, nossa assistente de suporte',
    icon: Sparkles,
    color: 'from-purple-400 via-purple-300 to-purple-500',
    colorText: 'text-purple-900',
    colorBorder: 'border-purple-200',
    bgSoft: 'bg-purple-500/5',
  },
  {
    key: 'empatica',
    title: 'Super Empática',
    desc: 'Apoiou 3 ou mais mães com mensagens de afeto',
    icon: Heart,
    color: 'from-rose-400 via-rose-300 to-rose-500',
    colorText: 'text-rose-905',
    colorBorder: 'border-rose-250',
    bgSoft: 'bg-rose-500/5',
  },
  {
    key: 'guardia',
    title: 'Guardiã da Transparência',
    desc: 'Validou as assinaturas criptográficas on-chain da blockchain',
    icon: ShieldCheck,
    color: 'from-emerald-400 via-emerald-300 to-emerald-500',
    colorText: 'text-emerald-900',
    colorBorder: 'border-emerald-200',
    bgSoft: 'bg-emerald-500/5',
  }
];

// Preset comfort suggestions to assist mothers in drafting empathetic replies
const EMPATHETIC_PRESETS = [
  "Você é uma mãe maravilhosa e sua dedicação cura e apoia. Estou aqui por você.",
  "Estou torcendo muito por vocês hoje. Nenhuma batalha de mãe atípica é em vão!",
  "Não carregue toda a culpa do mundo nas costas. Descanse seu espírito, seu esforço é lindo.",
  "Um dia de cada vez. Sua sensibilidade e amor constroem pontes incríveis para seu filho.",
];

// Helper to render deterministic avatar based on anonymous DID characters
function DidAvatar({ did, size = 36 }: { did: string; size?: number }) {
  const chars = did.replace(/[^a-zA-Z0-9]/g, '');
  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += chars.charCodeAt(i);
  }
  
  const presets = [
    { bg: 'from-pink-400 to-rose-500', bgSoft: 'bg-rose-500/10', text: 'text-rose-500' },
    { bg: 'from-teal-400 to-emerald-500', bgSoft: 'bg-emerald-500/10', text: 'text-emerald-500' },
    { bg: 'from-indigo-400 to-purple-500', bgSoft: 'bg-purple-500/10', text: 'text-purple-500' },
    { bg: 'from-amber-400 to-orange-500', bgSoft: 'bg-orange-500/10', text: 'text-orange-500' },
    { bg: 'from-sky-400 to-blue-500', bgSoft: 'bg-blue-500/10', text: 'text-blue-500' },
  ];
  
  const preset = presets[sum % presets.length];
  const initials = chars.substring(0, 2).toUpperCase() || 'M';
  
  return (
    <div 
      className={`relative rounded-full font-mono flex items-center justify-center text-white text-[11px] font-bold shadow-2xs shrink-0 select-none bg-gradient-to-tr ${preset.bg}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {initials}
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse"></span>
    </div>
  );
}

// Interactive gold care coin displaying an elegant 3D-axis spinning layout
function DigitalCareCoin() {
  return (
    <div className="relative w-24 h-24 mx-auto my-3 flex items-center justify-center">
      {/* Outer spinning dash ring */}
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/30 animate-[spin_12s_linear_infinite]"></div>
      {/* Dynamic secondary glowing ring */}
      <div className="absolute inset-2 rounded-full border border-amber-300/30 animate-[spin_8s_reverse_infinite]"></div>
      
      {/* Golden coin base */}
      <motion.div 
        whileHover={{ scale: 1.08 }}
        className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 via-amber-200 to-amber-500 flex items-center justify-center shadow-md border border-amber-400/50 cursor-pointer relative group"
      >
        <div className="w-13 h-13 rounded-full border border-white/40 flex items-center justify-center bg-amber-500/10">
          <Award className="w-7 h-7 text-amber-950 font-bold" />
        </div>
        {/* Shine gloss indicator */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 pointer-events-none"></div>
      </motion.div>
    </div>
  );
}

// Parse posts and extract tagged prefixes cleanly
const parsePostContent = (content: string) => {
  const match = content.match(/^\[(DESABAFO|DUVIDA|VITORIA|CONEXAO)\]\s*(.*)/s);
  if (match) {
    return {
      category: match[1] as 'DESABAFO' | 'DUVIDA' | 'VITORIA' | 'CONEXAO',
      text: match[2],
    };
  }
  return {
    category: null,
    text: content,
  };
};

const PORTUGUESE_PROFANITY_WORDS = [
  'caralho', 'puta', 'puto', 'fodase', 'foda-se', 'foda', 'foder', 'buceta', 'bosta', 'merda',
  'arrombado', 'arrombada', 'viado', 'porra', 'filho da puta', 'filha da puta', 'corno',
  'idiota', 'cuzão', 'cuzao', 'cu', 'cacete', 'vaca', 'vagabunda', 'vagabundo', 'pica',
  'babaca', 'imbecil', 'otario', 'otário', 'desgraçado', 'desgraçada', 'retardado', 'retardada',
  'pqp', 'fdp', 'putaria', 'chupa', 'caceta', 'caralhada', 'bostinha', 'bostão', 'bostao',
  'cornas', 'cornalha', 'estupido', 'estúpidas', 'estúpido', 'vabagundo', 'corna', 'trouxa',
  'retardados', 'putas', 'caralhos', 'fofoqueira', 'fofoqueiro', 'incompetente'
];

function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  // 1. Standard normalization
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove accents

  // 2. Leetspeak substitution
  const leetMap: { [key: string]: string } = {
    '4': 'a', '@': 'a',
    '3': 'e',
    '1': 'i', '!': 'i',
    '0': 'o',
    '5': 's', '$': 's',
  };
  let leetCleaned = '';
  for (const char of normalized) {
    leetCleaned += leetMap[char] || char;
  }

  // Remove duplicate repeating characters to handle "puuuuta" or "fodd-aa"
  const removeConsecutiveDuplicates = (str: string) => {
    return str.replace(/(.)\1+/g, '$1');
  };

  const simpleClean = (str: string) => {
    return str.replace(/[^a-z]/g, '');
  };

  const cleanText = leetCleaned;
  const noDupsText = removeConsecutiveDuplicates(cleanText);
  const ultraCleaned = simpleClean(cleanText);
  const ultraCleanedNoDups = removeConsecutiveDuplicates(ultraCleaned);

  for (const badWord of PORTUGUESE_PROFANITY_WORDS) {
    const cleanBadWord = badWord.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanBadWordNoDups = removeConsecutiveDuplicates(cleanBadWord);
    
    // Check with word boundaries on leet-cleaned text
    const regex = new RegExp(`\\b${cleanBadWord}\\b`, 'i');
    if (regex.test(cleanText)) return true;
    if (regex.test(noDupsText)) return true;

    // Direct substring checks for longer words to avoid false positives on short words (e.g. "cu" in "curva")
    if (cleanBadWord.length > 3) {
      if (cleanText.includes(cleanBadWord)) return true;
      if (noDupsText.includes(cleanBadWordNoDups)) return true;
      const strippedBadWord = cleanBadWord.replace(/[^a-z]/g, '');
      if (ultraCleaned.includes(strippedBadWord)) return true;
      if (ultraCleanedNoDups.includes(removeConsecutiveDuplicates(strippedBadWord))) return true;
    } else {
      // For short words like "cu", we use strict boundary checks to avoid matching "curso" / "desculpe"
      const shortWordRegex = new RegExp(`(^|[^a-z])${cleanBadWord}([^a-z]|$)`, 'i');
      if (shortWordRegex.test(cleanText)) return true;
      if (shortWordRegex.test(noDupsText)) return true;
    }
  }
  return false;
}

export default function FeedComunitario({
  user,
  onViewBlock,
  simulateSolanaError,
  bypassAgeCheck,
  consents,
  proofs,
  onNewProofEmitted,
  syncProofs,
}: FeedComunitarioProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'DESABAFO' | 'DUVIDA' | 'VITORIA' | 'CONEXAO'>('DESABAFO');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DESABAFO' | 'DUVIDA' | 'VITORIA' | 'CONEXAO'>('ALL');

  // Nest responses state for expandability
  const [postInteractions, setPostInteractions] = useState<Record<string, Interaction[]>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState<Record<string, boolean>>({});

  // Interaction modal triggers
  const [activeSupportPost, setActiveSupportPost] = useState<Post | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [interactionResult, setInteractionResult] = useState<any | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);

  // Fetch lists of posts on load
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const resp = await fetch('/api/posts');
      const data = await resp.json();
      setPosts(data);
    } catch (e) {
      console.error('Error fetching posts:', e);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [consents]);

  // Handle collapsible comments expander and load interactions
  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);

    // Fetch comments lazily
    setIsLoadingInteractions(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/posts/${postId}/interactions`);
      const data = await res.json();
      setPostInteractions(prev => ({ ...prev, [postId]: data }));
    } catch (e) {
      console.error('Error fetching interactions for post:', e);
    } finally {
      setIsLoadingInteractions(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Create new anonymous post prefixed with the chosen category tag
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPostError(null);

    if (containsProfanity(newPostContent)) {
      setPostError('Sua publicação contém palavras inadequadas ou ofensivas para nossa comunidade de mães. Por favor, reformule seu texto com empatia.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const taggedContent = `[${selectedCategory}] ${newPostContent}`;
      const resp = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          content: taggedContent,
        }),
      });
      const data = await resp.json();
      if (!data.error) {
        setPosts([data.post, ...posts]);
        setNewPostContent('');
        
        // Check if narradora badge was awarded
        if (data.narratoraBadge && onNewProofEmitted) {
          onNewProofEmitted({
            userId: user.uid,
            badge: 'narradora',
            solanaTx: data.narratoraBadge.solanaTx,
            createdAt: data.narratoraBadge.createdAt,
            status: data.narratoraBadge.status,
          });
        }

        if (syncProofs) {
          syncProofs().catch(e => console.error('Error syncing narrative proof:', e));
        }
      } else {
        setPostError(data.error);
      }
    } catch (e) {
      console.error('Error creating post:', e);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Submit response support feedback (Tela 4: Interações de Acolhimento)
  const handleSubmitSupport = async () => {
    if (!activeSupportPost || supportMessage.trim().length === 0) return;
    setSupportError(null);

    if (containsProfanity(supportMessage)) {
      setSupportError('A sua mensagem de acolhimento contém termos inadequados para o nosso ambiente de apoio mútuo. Por favor, envie uma mensagem com empatia e carinho.');
      return;
    }

    setIsSubmittingSupport(true);
    setInteractionResult(null);

    try {
      const resp = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: activeSupportPost.id,
          senderId: user.uid,
          message: supportMessage,
          bypassAgeCheck: bypassAgeCheck,
          simulateError: simulateSolanaError,
        }),
      });

      const data = await resp.json();
      if (data.error) {
        setSupportError(data.error);
        return;
      }
      setInteractionResult(data);

      if (data.proof_of_care && data.proof_of_care.issued) {
        onNewProofEmitted({
          userId: user.uid,
          badge: 'acolhedora',
          solanaTx: data.proof_of_care.solanaTx,
          createdAt: new Date().toISOString(),
          status: simulateSolanaError ? 'pending' : 'synced',
        });
      }

      // Check if empatica badge was awarded
      if (data.empatica_badge && data.empatica_badge.issued) {
        onNewProofEmitted({
          userId: user.uid,
          badge: 'empatica',
          solanaTx: data.empatica_badge.solanaTx,
          createdAt: new Date().toISOString(),
          status: simulateSolanaError ? 'pending' : 'synced',
        });
      }

      if (syncProofs) {
        syncProofs().catch(e => console.error('Error syncing dynamic interaction proof:', e));
      }

      // Automatically sync expanded thread if open
      if (expandedPostId === activeSupportPost.id) {
        const updateRes = await fetch(`/api/posts/${activeSupportPost.id}/interactions`);
        const updateData = await updateRes.json();
        setPostInteractions(prev => ({ ...prev, [activeSupportPost.id]: updateData }));
      }
    } catch (e) {
      console.error('Error submitting support interaction:', e);
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  const hasAcolhedoraBadge = proofs.some(p => p.userId === user.uid);
  const myPostsCount = posts.filter(p => p.userId === user.uid).length;
  const myProofsCount = proofs.filter(p => p.userId === user.uid).length;

  // Filter posts list based on selected category tab
  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'ALL') return true;
    const parsed = parsePostContent(post.content);
    return parsed.category === activeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 font-sans antialiased text-stone-800">
      
      {/* Three-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1: LEFT SIDEBAR NAVIGATION (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Mini Profile Shortcut */}
          <div className="bg-white rounded-2xl border border-stone-150 p-4 shadow-piana space-y-3">
            <div className="flex items-center gap-2.5">
              <DidAvatar did={user.did} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Identidade Maternal</p>
                <p className="text-xs font-bold text-stone-850 break-all select-all tracking-tight cursor-help" title={user.did}>
                  Mãe {user.did.substring(0, 10)}...
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-semibold">
              <span>Seus relatos: <b className="text-stone-700">{myPostsCount}</b></span>
              <span>Acolhimentos: <b className="text-stone-700">{myProofsCount}</b></span>
            </div>
          </div>

          {/* Left Navigation mimicking standard menu options */}
          <div className="space-y-1 bg-white/60 p-1.5 rounded-2xl border border-stone-150/50">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeFilter === 'ALL' ? 'bg-piana-primary/10 text-piana-primary' : 'hover:bg-piana-secondary/20 text-stone-600'
              }`}
            >
              <Users className={`w-4 h-4 ${activeFilter === 'ALL' ? 'text-piana-primary' : 'text-stone-500'}`} />
              <span>Feed de Apoio Geral</span>
            </button>

            <button
              onClick={() => setActiveFilter('DESABAFO')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeFilter === 'DESABAFO' ? 'bg-rose-500/10 text-rose-600' : 'hover:bg-piana-secondary/20 text-stone-600'
              }`}
            >
              <Heart className={`w-4 h-4 fill-current ${activeFilter === 'DESABAFO' ? 'text-rose-500' : 'text-stone-500'}`} />
              <span>Canal de Desabafos</span>
            </button>

            <button
              onClick={() => setActiveFilter('DUVIDA')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeFilter === 'DUVIDA' ? 'bg-amber-500/15 text-amber-700' : 'hover:bg-piana-secondary/20 text-stone-600'
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${activeFilter === 'DUVIDA' ? 'text-amber-600' : 'text-stone-500'}`} />
              <span>Dúvidas & Conselhos</span>
            </button>

            <button
              onClick={() => setActiveFilter('VITORIA')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeFilter === 'VITORIA' ? 'bg-emerald-500/10 text-emerald-700' : 'hover:bg-piana-secondary/20 text-stone-600'
              }`}
            >
              <Award className={`w-4 h-4 ${activeFilter === 'VITORIA' ? 'text-emerald-600' : 'text-stone-500'}`} />
              <span>Pequenas Vitórias</span>
            </button>

            <button
              onClick={() => setActiveFilter('CONEXAO')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeFilter === 'CONEXAO' ? 'bg-piana-primary/10 text-piana-primary' : 'hover:bg-piana-secondary/20 text-stone-600'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeFilter === 'CONEXAO' ? 'text-piana-primary' : 'text-stone-500'}`} />
              <span>Canais de Conexão</span>
            </button>
          </div>

          <div className="border-t border-stone-200/50 my-2"></div>

          {/* Interactive Medalhas section */}
          <div className="bg-white rounded-2xl border border-stone-150 p-4 shadow-piana space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Minhas Medalhas ({myProofsCount}/5)</span>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-55/10 px-1.5 py-0.5 rounded-md">
                <span className="h-1 w-1 bg-emerald-550 rounded-full animate-ping"></span>
                Web3 NFT Ativo
              </span>
            </div>
            
            <div className="space-y-2">
              {ALL_BADGES.map((badge) => {
                const proof = proofs.find((p) => p.badge === badge.key && p.userId === user.uid);
                const isEarned = !!proof;
                const BadgeIcon = badge.icon;
                
                return (
                  <div 
                    key={badge.key}
                    className={`p-2.5 rounded-xl border text-left transition duration-200 relative ${
                      isEarned 
                        ? `${badge.bgSoft} ${badge.colorBorder} hover:shadow-xs` 
                        : 'bg-stone-50/50 border-stone-150/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                        isEarned 
                          ? `bg-gradient-to-tr ${badge.color} text-white` 
                          : 'bg-stone-200 text-stone-400'
                      }`}>
                        <BadgeIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-[11px] font-bold ${isEarned ? 'text-stone-900 font-extrabold' : 'text-stone-500 font-medium'}`}>
                            {badge.title}
                          </p>
                          {isEarned && (
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-700 px-1 py-0.2 rounded font-black uppercase tracking-wider font-mono">
                              NFT
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-stone-400 font-medium leading-tight truncate" title={badge.desc}>
                          {badge.desc}
                        </p>
                      </div>
                    </div>
                    {isEarned && (
                      <div className="mt-1.5 pt-1 border-t border-stone-100 flex items-center justify-between text-[8px] text-stone-400 font-mono">
                        <span className="truncate max-w-[130px]" title={proof.solanaTx}>Tx ID: {proof.solanaTx}</span>
                        <span className="capitalize">{proof.status === 'synced' ? '● on-chain' : '⏱ pendente'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy Security Protection Card */}
          <div className="bg-gradient-to-tr from-piana-primary to-piana-secondary rounded-2xl p-5 text-xs text-white shadow-sm space-y-3 relative overflow-hidden">
            {/* Subtle light effect decorative circle */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-4 -translate-y-4"></div>
            
            <div className="flex items-center gap-2 text-white font-bold select-none">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="text-[10px] uppercase font-bold tracking-wider block">Privacidade Blindada</span>
            </div>
            
            <p className="text-[11px] text-white/90 leading-relaxed font-sans font-medium">
              Nossa tecnologia age em silêncio para garantir o seu anonimato. Seus relatos são guardados sob identificações seguras, imunes a vazamento de dados.
            </p>

            <div className="pt-2.5 border-t border-white/20 font-mono text-[9px] text-white/80 flex items-center justify-between">
              <span>Status operacional:</span>
              <span className="text-emerald-300 font-bold flex items-center gap-1 selection:bg-emerald-900 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                Ativo e Seguro
              </span>
            </div>
          </div>

        </div>

        {/* ================= COLUMN 2: CENTRAL FEED STREAM (6 cols) ================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Post Creation Composer */}
          <div className="bg-white rounded-2xl border border-stone-150 shadow-piana p-5 space-y-4">
            
            <div className="flex gap-3 items-center">
              <DidAvatar did={user.did} size={40} />
              
              <div className="bg-piana-bg hover:bg-piana-secondary/15 rounded-2xl flex-1 px-4 py-3 text-stone-500 text-xs text-left select-none cursor-default duration-150 font-semibold">
                No que você gostaria de desabafar de forma anônima hoje, Mãe?
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4">
              <form onSubmit={handleCreatePost} className="space-y-4">
                
                {/* Expandable options row */}
                <div className="flex items-center justify-between flex-wrap gap-1.5 bg-piana-bg/60 p-1.5 rounded-xl border border-stone-200/50">
                  {(['DESABAFO', 'DUVIDA', 'VITORIA', 'CONEXAO'] as const).map(cat => {
                    const isActive = selectedCategory === cat;
                    const label = cat === 'DESABAFO' ? '🌸 Desabafo' : cat === 'DUVIDA' ? '💡 Dúvida' : cat === 'VITORIA' ? '🌟 Vitória' : '🤝 Conexão';
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-2 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center ${
                          isActive 
                            ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-black' 
                            : 'text-stone-500 hover:text-stone-700'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  placeholder={
                    selectedCategory === 'DESABAFO' ? "Compartilhe sobre cansaço de terapias, lutas ou sentimentos em anonimato total..." :
                    selectedCategory === 'DUVIDA' ? "Qual é o seu questionamento sobre inclusão escolar, medicação, laudos ou médicos?" :
                    selectedCategory === 'VITORIA' ? "Espalhe esperança! Qual barreira seu filho(a) superou recentemente?" :
                    "Deseja fazer conexão com outras mães de diagnósticos parecidos na sua região?"
                  }
                  value={newPostContent}
                  onChange={(e) => {
                    setNewPostContent(e.target.value);
                    if (postError) setPostError(null);
                  }}
                  rows={3}
                  maxLength={280}
                  className="w-full bg-piana-bg/40 focus:bg-white border border-stone-200 focus:border-piana-primary rounded-xl p-3.5 text-xs leading-relaxed focus:outline-none resize-none placeholder:text-stone-400 text-stone-800 transition-all font-sans"
                />

                {postError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] p-3.5 rounded-xl flex items-start gap-2 font-sans font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="leading-normal">{postError}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400 font-sans text-[10px] flex items-center gap-1 leading-none select-none font-semibold">
                    <Lock className="w-3.5 h-3.5 text-piana-success" />
                    <span>Seu relato é 100% anônimo</span> • {280 - newPostContent.length} carac.
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmittingPost || !newPostContent.trim()}
                    className="bg-piana-primary hover:bg-piana-primary/95 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isSubmittingPost ? (
                      <>
                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                        <span>Anonimizando...</span>
                      </>
                    ) : (
                      <>
                        <span>Publicar</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>

          {/* Selector Filter Pills toolbar below status composer */}
          <div className="bg-white rounded-2xl border border-stone-150 p-4 shadow-piana flex justify-between items-center">
            <span className="text-xs text-stone-600 font-bold flex items-center gap-2 select-none">
              <span className="h-2 w-2 rounded-full bg-piana-primary animate-pulse"></span>
              Filtro ativo: {activeFilter === 'ALL' ? 'Todos os posts' : activeFilter === 'DESABAFO' ? '🌸 Desabafos' : activeFilter === 'DUVIDA' ? '💡 Dúvidas' : activeFilter === 'VITORIA' ? '🌟 Vitórias' : '🤝 Conexões'}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => fetchPosts()}
                className="p-1.5 hover:bg-stone-50 rounded-full text-stone-400 hover:text-stone-600 transition cursor-pointer"
                title="Sincronizar Feed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Posts Feed Stream of Cards */}
          <div className="space-y-4">
            {isLoadingPosts ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-lg border border-slate-200">
                <LoaderSpinning label="Descriptografando relatos da blockchain..." />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto border border-slate-100 animate-bounce">
                  <Filter className="w-6 h-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">Nenhum relato nesta categoria de filtro</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                    Seja a primeira a relatar sua experiência! Troque o filtro no menu ao lado para ler todos.
                  </p>
                </div>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isOwnPost = post.userId === user.uid;
                const parsed = parsePostContent(post.content);
                const isExpanded = expandedPostId === post.id;
                const comments = postInteractions[post.id] || [];
                const isLoadingComments = isLoadingInteractions[post.id] || false;

                // Category labels and colors
                let categoryColor = 'text-slate-600 bg-slate-100 border-slate-200';
                let categoryLabel = 'Relato';
                
                if (parsed.category === 'DESABAFO') {
                  categoryColor = 'text-rose-600 bg-rose-50 border-rose-100';
                  categoryLabel = '🌸 Desabafo';
                } else if (parsed.category === 'DUVIDA') {
                  categoryColor = 'text-amber-750 bg-amber-55 border-amber-100';
                  categoryLabel = '💡 Dúvida';
                } else if (parsed.category === 'VITORIA') {
                  categoryColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                  categoryLabel = '🌟 Vitória';
                } else if (parsed.category === 'CONEXAO') {
                  categoryColor = 'text-indigo-600 bg-indigo-50 border-indigo-100';
                  categoryLabel = '🤝 Conexão';
                }

                return (
                  <motion.div
                    key={post.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-stone-150 overflow-hidden shadow-piana"
                  >
                    
                    {/* Post Card Component layout */}
                    <div className="p-5 space-y-4">
                      
                      {/* Post Header */}
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2.5">
                          <DidAvatar did={post.authorDid} size={36} />
                          <div>
                            <span className="text-xs font-bold text-stone-800 tracking-tight flex items-center gap-1.5 leading-none cursor-help">
                              Mãe {post.authorDid.substring(0, 12)}...
                              {isOwnPost && (
                                <span className="text-[9px] bg-piana-primary/10 text-piana-primary px-1.5 py-0.5 rounded font-black tracking-wide">
                                  Você
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] text-stone-400 font-sans mt-1.5 block font-semibold">
                              Publicação Segura e Monitorada
                            </span>
                          </div>
                        </div>

                        {/* Category badge tag */}
                        <div className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${categoryColor}`}>
                          {categoryLabel}
                        </div>
                      </div>

                      {/* Decrypted content plain text */}
                      <p className="text-xs sm:text-sm text-stone-700 leading-normal font-sans font-medium p-0.5 whitespace-pre-wrap selection:bg-piana-primary/10">
                        {parsed.text}
                      </p>

                      {/* Comments and support stats bar - Dynamic, Anti-toxic & Real */}
                      {comments.length === 0 ? (
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-sans font-semibold">
                          <div className="flex items-center gap-1.5 opacity-80 select-none">
                            <Heart className="w-3.5 h-3.5 text-stone-300" />
                            <span>Aguardando o primeiro acolhimento amigo</span>
                          </div>
                          <div className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-150 select-none">
                            Privado e Seguro
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-sans font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center shadow-3xs">
                              <Heart className="w-2.5 h-2.5 text-white fill-white" />
                            </span>
                            <span className="text-stone-700 font-semibold select-none">
                              {(() => {
                                const hasMySupport = comments.some((comment: Interaction) => comment.senderId === user.uid);
                                const otherSupportsCount = comments.filter((comment: Interaction) => comment.senderId !== user.uid).length;
                                if (hasMySupport) {
                                  return comments.length === 1 
                                    ? 'Você acolheu este desabafo' 
                                    : `Você e mais ${otherSupportsCount} mãe${otherSupportsCount > 1 ? 's' : ''} acolheram`;
                                } else {
                                  return comments.length === 1 
                                    ? '1 mãe acolheu este desabafo' 
                                    : `${comments.length} mães acolheram este relato`;
                                }
                              })()}
                            </span>
                          </div>
                          <div className="text-[10px] text-piana-primary font-bold bg-piana-primary/10 px-2.5 py-0.5 rounded-full border border-piana-primary/15 select-none animate-pulse">
                            Apoio Ativo
                          </div>
                        </div>
                      )}

                      {/* Interacting Buttons Row */}
                      <div className="pt-1.5 border-t border-stone-100 grid grid-cols-2 gap-2 text-center font-semibold">
                        
                        {/* Interactive heart button */}
                        <button
                          onClick={() => {
                            setActiveSupportPost(post);
                            setSupportMessage('');
                            setInteractionResult(null);
                            setSupportError(null);
                          }}
                          className="flex items-center justify-center gap-2 py-2 hover:bg-stone-50 text-rose-500 font-bold text-xs rounded-xl transition cursor-pointer select-none"
                        >
                          <Heart className="w-4 h-4 fill-rose-50" />
                          <span>Apoiar / Acolher</span>
                        </button>
                        
                        {/* Expand thread toggle */}
                        <button
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center justify-center gap-2 py-2 hover:bg-stone-50 font-bold text-xs rounded-xl transition cursor-pointer select-none ${
                            isExpanded ? 'text-piana-primary bg-piana-primary/5' : 'text-stone-500'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Comentar ({comments.length})</span>
                        </button>

                      </div>

                    </div>

                    {/* Collapsible comment thread */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-piana-bg/60 border-t border-stone-200/60 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-stone-400 uppercase tracking-wider pb-1.5 border-b border-stone-200">
                              <Activity className="w-3.5 h-3.5 text-piana-primary" />
                              <span>Livro-razão de auditoria de comentários</span>
                            </div>

                            {isLoadingComments ? (
                              <div className="py-4 text-center bg-white rounded-2xl border border-stone-100">
                                <LoaderSpinning label="Carregando acolhimentos..." />
                              </div>
                            ) : comments.length === 0 ? (
                              <div className="text-center py-5 bg-white p-5 rounded-2xl border border-stone-100 space-y-1.5">
                                <p className="text-xs font-bold text-stone-700">Ainda não há acolhimentos para este relato.</p>
                                <p className="text-[10.5px] text-stone-400 font-semibold leading-relaxed">
                                  Escreva uma mensagem calorosa de conforto clicando em "Apoiar / Acolher"!
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3 pt-1">
                                {comments.map((comment: Interaction) => (
                                  <div 
                                    key={comment.id}
                                    className="flex items-start gap-2.5 max-w-full"
                                  >
                                    <DidAvatar did={comment.senderDid} size={30} />
                                    
                                    <div className="flex-1 min-w-0">
                                      {/* Rounded standard grey speech bubbles */}
                                      <div className="bg-piana-bg px-3.5 py-2 rounded-2xl text-stone-850 inline-block max-w-full">
                                        <div className="flex items-center gap-1.5 pb-0.5">
                                          <span className="text-xs font-bold text-stone-900">Mãe {comment.senderDid.substring(0, 12)}...</span>
                                          <span className="text-[9px] text-stone-400 font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <p className="text-xs font-sans text-stone-700 leading-normal font-medium whitespace-pre-wrap break-words">
                                          {comment.message}
                                        </p>
                                      </div>

                                      {/* Proof of Care info blocks nestled nicely underneath */}
                                      {comment.proof_of_care && comment.proof_of_care.issued ? (
                                        <div className="mt-1 pl-1 bg-amber-500/[0.03] p-1.5 rounded-xl border border-amber-500/10 flex flex-wrap items-center justify-between gap-2 max-w-md">
                                          <div className="flex items-center gap-1 text-[9px] text-amber-800 font-bold">
                                            <Award className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Sua ação de acolhimento gerou uma medalha de empatia!</span>
                                          </div>
                                          {comment.proof_of_care.solanaTx && (
                                            <span className="text-[8.5px] font-sans text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-500/10 font-bold select-none">
                                              Código Seguro Ativo
                                            </span>
                                          )}
                                        </div>
                                      ) : null}

                                      {comment.ai_context && (
                                        <div className="mt-1 pl-2.5 text-[10px] text-stone-400 font-semibold italic border-l-2 border-piana-primary/30">
                                          Validação IA: {comment.ai_context}
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })
            )}
          </div>

        </div>

        {/* ================= COLUMN 3: RIGHT PANEL & ONLINE USERS (3 cols) ================= */}
        <div className="hidden lg:col-span-3 space-y-4">
          
          {/* Sponsoring/Suggested atypical channels */}
          <div className="bg-white rounded-2xl border border-stone-150 p-5 shadow-piana space-y-4">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block">Parceiros de Confiança</span>
            
            <div className="space-y-4">
              <a 
                href="https://www.neosaber.com.br" 
                target="_blank" 
                rel="noreferrer" 
                className="group block space-y-2 hover:opacity-95 text-xs transition duration-250 ease-in-out transform hover:-translate-y-0.5"
              >
                <div className="w-full h-24 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 border border-stone-100 relative overflow-hidden">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded absolute top-2 left-2 z-10 shadow-3xs">NeuroSaber</span>
                  <Award className="w-8 h-8 text-emerald-600 opacity-60 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-850 text-[11px] group-hover:text-piana-primary transition">Manual Prático NeuroSaber</h4>
                  <p className="text-[10px] text-stone-400 leading-normal mt-0.5 font-sans font-medium">
                    Baixe gratuitamente um e-book exclusivo de estimulação para crianças autistas ou com TDAH.
                  </p>
                </div>
              </a>

              <a 
                href="https://www.ama.org.br" 
                target="_blank" 
                rel="noreferrer" 
                className="group block space-y-2 hover:opacity-95 text-xs transition duration-250 ease-in-out transform hover:-translate-y-0.5"
              >
                <div className="w-full h-24 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 border border-stone-100 relative overflow-hidden">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-[#8B7CF6] text-white px-2 py-0.5 rounded absolute top-2 left-2 z-10 shadow-3xs">AMA São Paulo</span>
                  <Users className="w-8 h-8 text-[#8B7CF6] opacity-60 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-850 text-[11px] group-hover:text-piana-primary transition">Oficinas Sociais Gratuitas</h4>
                  <p className="text-[10px] text-stone-400 leading-normal mt-0.5 font-sans font-medium">
                    Fique sabendo das inscrições abertas para atendimento terapêutico e oficinas sensoriais na AMA.
                  </p>
                </div>
              </a>
            </div>

          </div>

          {/* Contacts sidebar mimics Messenger Active friends listing */}
          <div className="bg-white rounded-2xl border border-stone-150 p-5 shadow-piana space-y-4">
            <span className="text-[11px] font-bold text-stone-400 tracking-widest uppercase flex justify-between items-center">
              <span>Mães Ativas no Momento</span>
              <span className="h-2 w-2 rounded-full bg-piana-success animate-ping"></span>
            </span>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-rose-100/80 text-rose-800 font-sans text-[10px] font-extrabold flex items-center justify-center">ML</div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-piana-success ring-2 ring-white"></span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-850 leading-none">Mãe Laura</p>
                  <p className="text-[9.5px] text-stone-400 font-sans font-semibold truncate leading-none mt-1.5">Conectado de SP</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/85 text-emerald-800 font-sans text-[10px] font-extrabold flex items-center justify-center">MH</div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-piana-success ring-2 ring-white"></span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-850 leading-none">Mãe Helena</p>
                  <p className="text-[9.5px] text-stone-400 font-sans font-semibold truncate leading-none mt-1.5">Conectado de RS</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100/80 text-purple-800 font-sans text-[10px] font-extrabold flex items-center justify-center">MP</div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-piana-success ring-2 ring-white"></span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-850 leading-none">Mãe Patrícia</p>
                  <p className="text-[9.5px] text-stone-400 font-sans font-semibold truncate leading-none mt-1.5">Conectado do RJ</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-orange-100/80 text-orange-850 font-sans text-[10px] font-extrabold flex items-center justify-center">MC</div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-piana-success ring-2 ring-white"></span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-850 leading-none">Mãe Cecília</p>
                  <p className="text-[9.5px] text-stone-400 font-sans font-semibold truncate leading-none mt-1.5">Conectado de MG</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ================= INTERACTION COMFORT WRITING DIALOG MODAL ================= */}
      <AnimatePresence>
        {activeSupportPost && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl border border-stone-150 max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-piana-primary p-4.5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-white" />
                  <h3 className="font-extrabold text-sm">Oferecer Conforto & Apoio</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveSupportPost(null);
                    setInteractionResult(null);
                  }}
                  className="text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <div className="bg-piana-bg/60 p-4 rounded-xl border border-stone-100">
                  <p className="text-[9.5px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-1.5">Relato da Mãe</p>
                  <p className="text-xs text-stone-700 italic leading-relaxed whitespace-pre-wrap select-none truncate-3" title={activeSupportPost.content}>
                    "{parsePostContent(activeSupportPost.content).text}"
                  </p>
                </div>

                {!interactionResult ? (
                  // WRITE FORM COMFORT FIELD
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 block">Escreva sua Mensagem de Empatia:</label>
                      <textarea
                        rows={4}
                        placeholder="Crie um texto carinhoso, empático e de acolhimento... (Mínimo de 15 caracteres contendo profundidade ética)"
                        value={supportMessage}
                        onChange={(e) => {
                          setSupportMessage(e.target.value);
                          if (supportError) setSupportError(null);
                        }}
                        className="w-full bg-[#FAF9F7]/80 focus:bg-white border border-stone-200 focus:border-piana-primary rounded-xl p-3 text-xs focus:outline-none resize-none placeholder:text-stone-400 text-stone-850 transition-all font-sans leading-relaxed shadow-3xs"
                      />
                    </div>

                    {supportError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] p-3.5 rounded-xl flex items-start gap-2 font-sans font-medium">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="leading-normal">{supportError}</p>
                      </div>
                    )}

                    {/* Preset helper tags */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-stone-400 font-bold block bg-[#FAF9F7]/80 p-1.5 px-2.5 rounded-lg border border-stone-100">
                        💡 Sugestões de Frases Empáticas (Clique para preencher):
                      </span>
                      <div className="flex flex-col gap-1.5 flex-wrap">
                        {EMPATHETIC_PRESETS.map((pst, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSupportMessage(pst)}
                            className="text-[10px] text-stone-600 font-sans font-semibold text-left p-2 hover:bg-piana-primary/5 border border-stone-200 hover:border-piana-primary/30 rounded-xl transition duration-150 truncate shrink-0 cursor-pointer bg-white"
                          >
                            "{pst}"
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Control rules feedback criteria indicator */}
                    <div className="border-t border-stone-100 pt-3 flex justify-between items-center mt-2 font-sans font-medium">
                      <div className="text-[10px] text-stone-400 font-sans font-bold">
                        Comprimento: <b className={supportMessage.trim().length >= 15 ? 'text-piana-success' : 'text-amber-500'}>{supportMessage.trim().length} caracteres</b>
                      </div>
                      
                      <button
                        onClick={handleSubmitSupport}
                        disabled={isSubmittingSupport || supportMessage.trim().length === 0}
                        className="bg-piana-primary hover:bg-[#7a6ae5] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-sans shadow-3xs"
                      >
                        {isSubmittingSupport ? 'Acolhendo com carinho...' : 'Compartilhar Apoio'}
                      </button>
                    </div>
                  </div>
                ) : interactionResult.proof_of_care?.issued ? (
                  // SUCCESS WEB3 COMPILATION AND REPUTATION GAINED OUT
                  <div className="space-y-4 text-center py-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-3xs">
                      <Check className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-900">Acolhimento Registrado com Sucesso!</h4>
                      <p className="text-xs text-stone-600 leading-normal font-sans">
                        Sua empatia foi validada com sucesso e um selo de proteção de dados foi ativado para o seu suporte!
                      </p>
                    </div>

                    <div className="bg-[#FAF9F7]/85 p-4 rounded-xl border border-stone-150 font-mono text-[10.5px] text-stone-550 space-y-2 text-left">
                      <div className="flex justify-between font-sans">
                        <span>Código Seguro do Cofre Virtual:</span>
                        <span className="text-stone-800 font-bold max-w-[200px] truncate font-mono">{interactionResult.proof_of_care.solanaTx}</span>
                      </div>
                      <div className="flex justify-between font-sans">
                        <span>Status de Proteção:</span>
                        <span className="text-stone-700 font-extrabold flex items-center gap-1 font-sans">✔ REGISTRADO COM SEGURANÇA</span>
                      </div>
                      <div className="flex justify-between font-sans">
                        <span>Validação de Conteúdo da IA:</span>
                        <span className="text-piana-primary font-bold uppercase font-sans">Acolhimento Empático Confirmado</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onViewBlock()}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 font-bold cursor-pointer hover:bg-amber-500/15 transition font-sans"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" /> Verificar Registro de Proteção <ArrowUpRight className="w-3 h-3 text-amber-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // IF NOT ELIGIBLE SHOW RULES OUTPUT
                  <div className="bg-[#FAF9F7]/85 border border-stone-150 rounded-xl p-4.5 space-y-3">
                    <div className="flex items-start gap-2.5 text-stone-700">
                      <HelpCircle className="w-5 h-5 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-xs block font-bold text-stone-900">Acolhimento enviado com sucesso</strong>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                          Sua mensagem foi entregue à outra mãe! No entanto, o badge de Proof of Care não foi emitido pelas razões abaixo:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pl-7 text-[10px] font-sans font-semibold text-stone-500">
                      <div className="flex items-center gap-1.5">
                        {interactionResult.rulesValidated?.accountAgeValid ? (
                          <span className="text-piana-success font-bold">✔</span>
                        ) : (
                          <span className="text-amber-500 font-bold font-sans">✕</span>
                        )}
                        <span>Conta criada há mais de 10 minutos (Seu tempo: {interactionResult.rulesValidated?.accountAgeMinutes} min)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {interactionResult.rulesValidated?.characterLengthValid ? (
                          <span className="text-piana-success font-bold">✔</span>
                        ) : (
                          <span className="text-amber-500 font-bold font-sans">✕</span>
                        )}
                        <span>Mensagem com mais de 15 caracteres (Seu comprimento: {interactionResult.rulesValidated?.characterLength} carac.)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-piana-success font-bold">✔</span>
                        <span>Ausência de publicações marcadas como SPAM</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {interactionResult.rulesValidated?.noRecentBadge ? (
                          <span className="text-piana-success font-bold">✔</span>
                        ) : (
                          <span className="text-amber-500 font-bold font-sans">✕</span>
                        )}
                        <span>Sem insígnias duplicadas emitidas nas últimas 24 horas</span>
                      </div>
                    </div>

                    {simulateSolanaError && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] text-amber-700 font-sans flex items-start gap-1.5 mt-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="leading-normal">
                          <strong>Simulação de Erro Ativa:</strong> O aviso obrigatório try/catch falhou. Caso as regras fossem válidas, a transação seria salva localmente sob estado pendente.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Close and return to Feed */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveSupportPost(null);
                      setInteractionResult(null);
                      fetchPosts();
                    }}
                    className="bg-stone-850 hover:bg-stone-900 text-white font-extrabold text-[11px] py-2.5 px-4 rounded-xl transition cursor-pointer"
                  >
                    Voltar ao Feed Comunitário
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline Sub-components for loader to keep file independent and clean
function LoaderSpinning({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-piana-primary border-t-transparent"></div>
      <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}
