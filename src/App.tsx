/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { Heart, Link2, BookOpen, MessageSquare, ShieldCheck, HelpCircle, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Onboarding from './components/Onboarding';
import ConsentLGPD from './components/ConsentLGPD';
import FeedComunitario from './components/FeedComunitario';
import AssistenteChat from './components/AssistenteChat';
import SolanaExplorer from './components/SolanaExplorer';
import CentralTransparencia from './components/CentralTransparencia';
import MaternalProfileModal from './components/MaternalProfileModal';
import AppLogo from './components/AppLogo';
import { User, Consent, ProofOfCare } from './types';

function DidAvatarMin({ did }: { did: string }) {
  const chars = did.replace(/[^a-zA-Z0-9]/g, '');
  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += chars.charCodeAt(i);
  }
  const presets = [
    'bg-rose-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-blue-500',
  ];
  const bg = presets[sum % presets.length];
  const initials = chars.substring(0, 2).toUpperCase() || 'M';
  return (
    <div className={`w-6 h-6 rounded-full text-white font-mono flex items-center justify-center text-[9px] font-bold shrink-0 ${bg}`}>
      {initials}
    </div>
  );
}

export default function App() {
  // Session states
  const [user, setUser] = useState<User | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [proofs, setProofs] = useState<ProofOfCare[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Demotoolbar state
  // DEMO: bypassAgeCheck=true desativa a regra dos 10 minutos
  // para permitir demonstração imediata.
  // A DemoToolbar permite ativar/desativar ao vivo durante a apresentação.
  const [bypassAgeCheck, setBypassAgeCheck] = useState(true); // default true for immediate demo success!
  const [simulateSolanaError, setSimulateSolanaError] = useState(false);

  // Navigation states
  const [activeTab, setActiveTab] = useState<'feed' | 'assistant' | 'central'>(() => {
    const saved = localStorage.getItem('piana_active_tab');
    if (saved === 'feed' || saved === 'assistant' || saved === 'central') {
      return saved;
    }
    return 'feed';
  });
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Success message toasts triggered during transitions
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // DEMO: Sessão persistida via localStorage.
  // Usar sempre o mesmo navegador durante a apresentação.
  // Não trocar de dispositivo durante a demo.
  // Load session from localStorage on mount
  const loadSession = async () => {
    try {
      const savedUid = localStorage.getItem('piana_user_uid');
      if (savedUid) {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: savedUid }),
        });
        const userData = await response.json();
        if (!userData.error) {
          setUser(userData);
          // Fetch blockchain state for consent and proofs de care
          const statusResp = await fetch('/api/demo/blockchain-state');
          const statusData = await statusResp.json();
          
          setConsents(statusData.consents.filter((c: Consent) => c.userId === userData.uid));
          setProofs(statusData.proofOfCare.filter((p: ProofOfCare) => p.userId === userData.uid));
        }
      }
    } catch (e) {
      console.error('Error recovering session:', e);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    localStorage.setItem('piana_active_tab', activeTab);
  }, [activeTab]);

  // Display elegant alert popups
  const triggerToast = (msg: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  // Start Session (Tela 1 Action)
  const handleStartSession = async () => {
    setIsInitializing(true);
    try {
      // Create random unique client UUID
      const uid = 'piana_uid_' + Math.random().toString(36).substring(2) + Date.now();
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      const userData = await response.json();
      if (!userData.error) {
        localStorage.setItem('piana_user_uid', uid);
        setUser(userData);
        triggerToast('Sessão anônima de acolhimento criada com sucesso! Assinatura Web3 gerada.');
      }
    } catch (e) {
      console.error('Session starting failed:', e);
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle successful consent accepted (Tela 2 Action)
  const handleConsentAccepted = (newConsent: Consent, isBackup: boolean, message: string) => {
    setConsents([newConsent]);
    if (isBackup) {
      triggerToast(message, 'warning');
    } else {
      triggerToast(message, 'success');
    }
  };

  // Log new emitted proof from active feed interactions
  const handleNewProofEmitted = (newProof: ProofOfCare) => {
    setProofs((prev) => [...prev, newProof]);
    if (newProof.status === 'pending') {
      triggerToast(
        'Mensagem enviada com sucesso! Registro blockchain pendente temporariamente.',
        'warning'
      );
    } else {
      triggerToast(
        'Mensagem enviada! Medalha Proof of Care registrada on-chain com sucesso na SolanaDevnet!'
      );
    }
  };

  // Synchronously fetch and refresh proofs of care (medals/badges) on-chain
  const syncProofs = async () => {
    if (!user) return;
    try {
      const resp = await fetch('/api/demo/blockchain-state');
      const data = await resp.json();
      if (data && Array.isArray(data.proofOfCare)) {
        setProofs(data.proofOfCare.filter((p: ProofOfCare) => p.userId === user.uid));
      }
    } catch (e) {
      console.error('Error syncing proofs:', e);
    }
  };

  // Reset database for clear testing
  const handleReset = async () => {
    if (confirm('Deseja realmente resetar todas as tabelas simuladas e apagar os registros do banco?')) {
      try {
        await fetch('/api/demo/reset', { method: 'POST' });
        localStorage.removeItem('piana_user_uid');
        setUser(null);
        setConsents([]);
        setProofs([]);
        setActiveTab('feed');
        setIsExplorerOpen(false);
        triggerToast('Sessão encerrada de forma limpa. Banco de dados do MVP reinicializado.', 'success');
      } catch (e) {
        console.error('Reset failed:', e);
      }
    }
  };

  const handleAccountDeleted = () => {
    localStorage.removeItem('piana_user_uid');
    setUser(null);
    setConsents([]);
    setProofs([]);
    setIsProfileOpen(false);
    triggerToast(
      'Sua conta e todos os dados foram apagados permanentemente com segurança sob regulação da LGPD (Direito ao Esquecimento).',
      'success'
    );
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-teal-600 border-t-transparent mb-4"></div>
        <p className="text-xs text-slate-550 font-mono">Conexão Piana • Carregando ambiente seguro...</p>
      </div>
    );
  }

  // Multi-step route controllers
  const isRegisteredUser = user !== null;
  const hasConsentedLGPD = consents.length > 0;

  return (
    <div className="min-h-screen bg-piana-bg text-piana-text flex flex-col relative font-sans">
      
      {/* Primary Top Header Navigation */}
      <header className="bg-white/85 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          
          <div className="flex items-center gap-3 select-none">
            <AppLogo withContainer={true} />
            <span className="text-piana-primary font-sans font-extrabold tracking-tight text-xl select-none">
              conexão piana
            </span>
          </div>

          {/* Action Auditing Bar button togglers - Soft styled */}
          {isRegisteredUser && hasConsentedLGPD ? (
            <div className="flex h-full items-center">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center justify-center px-4 md:px-5 h-full border-b-[3px] transition cursor-pointer gap-2 text-sm ${
                  activeTab === 'feed'
                    ? 'border-piana-primary text-piana-primary font-bold'
                    : 'border-transparent text-stone-500 hover:text-piana-primary'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden md:inline">Feed de Apoio</span>
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center justify-center px-4 md:px-5 h-full border-b-[3px] transition cursor-pointer gap-2 text-sm ${
                  activeTab === 'assistant'
                    ? 'border-piana-primary text-piana-primary font-bold'
                    : 'border-transparent text-stone-500 hover:text-piana-primary'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">Assistente Piana</span>
              </button>
              <button
                onClick={() => setActiveTab('central')}
                className={`flex items-center justify-center px-4 md:px-5 h-full border-b-[3px] transition cursor-pointer gap-2 text-sm ${
                  activeTab === 'central'
                    ? 'border-piana-primary text-piana-primary font-bold'
                    : 'border-transparent text-stone-500 hover:text-piana-primary'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">Transparência Web3</span>
              </button>
            </div>
          ) : (
            <div className="w-10"></div>
          )}

          {/* Audit Blockchain explorer shortcut */}
          <div className="flex items-center gap-2">
            {isRegisteredUser && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="hidden md:flex items-center gap-1.5 bg-piana-secondary/20 hover:bg-piana-secondary/30 active:bg-piana-secondary/35 border border-piana-secondary/35 px-2.5 py-1.5 rounded-full text-piana-text cursor-pointer transition focus:outline-none"
                title="Ver seu perfil"
              >
                <DidAvatarMin did={user.did} />
                <span className="text-[11px] font-semibold text-stone-700">
                  {user.pseudonym || `Mãe ${user.did.substring(0, 5)}...`}
                </span>
              </button>
            )}

            <button
              onClick={() => setIsExplorerOpen(true)}
              className="flex items-center gap-1.5 bg-piana-primary/10 hover:bg-piana-primary/20 active:bg-piana-primary/25 text-piana-primary font-semibold text-xs px-3.5 py-2 rounded-full transition cursor-pointer border border-piana-primary/15"
            >
              <Link2 className="w-3.5 h-3.5 text-piana-primary" />
              <span className="hidden sm:inline">Auditar Ledger</span> ({consents.length + proofs.length})
            </button>
          </div>

        </div>
      </header>

      {/* Success and Falling Warnings Alert Toast banner */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className={`p-4 rounded-2xl shadow-piana border text-xs flex items-start gap-3 ${
                toast.type === 'warning'
                  ? 'bg-rose-50 border-piana-alert/30 text-stone-800'
                  : 'bg-emerald-50 border-piana-success/30 text-stone-800'
              }`}
            >
              {toast.type === 'warning' ? (
                <AlertCircle className="w-4 h-4 text-piana-alert shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-piana-success shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-semibold">{toast.message}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Sections routing switch */}
      <main className="flex-1">
        {!isRegisteredUser ? (
          /* Step 1: Onboarding anonymous session instantiation */
          <Onboarding onStartSession={handleStartSession} isLoading={isInitializing} />
        ) : !hasConsentedLGPD ? (
          /* Step 2: Accept explicit protection clauses */
          <ConsentLGPD
            user={user}
            onConsentSuccess={handleConsentAccepted}
            simulateSolanaError={simulateSolanaError}
            onViewBlock={() => setIsExplorerOpen(true)}
          />
        ) : activeTab === 'feed' ? (
          /* Step 3: Main anonymous community board */
          <FeedComunitario
            user={user}
            onViewBlock={() => setIsExplorerOpen(true)}
            simulateSolanaError={simulateSolanaError}
            bypassAgeCheck={bypassAgeCheck}
            consents={consents}
            proofs={proofs}
            onNewProofEmitted={handleNewProofEmitted}
            syncProofs={syncProofs}
            onProfileClick={() => setIsProfileOpen(true)}
          />
        ) : activeTab === 'assistant' ? (
          /* Step 4: Crisis-aware Ethical assistant therapist */
          <AssistenteChat user={user} syncProofs={syncProofs} />
        ) : (
          /* Step 6: Full transparency ledger & verify dashboard */
          <CentralTransparencia
            user={user}
            consents={consents}
            proofs={proofs}
            simulateSolanaError={simulateSolanaError}
            syncProofs={syncProofs}
          />
        )}
      </main>

      {/* Solana Block visual audit database slide menu */}
      <SolanaExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        consents={consents}
        proofs={proofs}
      />

      {/* Maternal Profile & LGPD Forget Data Modal */}
      {isRegisteredUser && (
        <MaternalProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onProfileUpdated={(updatedUser) => setUser(updatedUser)}
          onAccountDeleted={handleAccountDeleted}
        />
      )}

      {/* Humble Humanity Footer */}
      <footer className="bg-white border-t border-slate-150 py-5 text-center text-[10px] text-slate-400 font-sans tracking-wide">
        <p>Conexão Piana — HackaNation MVP v3.0 • Tecnologia que acolhe e protege.</p>
        <p className="mt-1 text-[9px] text-slate-350">
          Solana Memo Program (System Signature ID) • Firebase Serverless Simulation
        </p>
      </footer>
    </div>
  );
}
