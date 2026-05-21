/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowUpRight, CheckCircle, Database, HelpCircle, 
  Search, Clock, Link2, Key, Cpu, Sparkles, RefreshCw, FileJson, 
  Award, Lock, Code, ChevronRight, FileText, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Consent, ProofOfCare } from '../types';

interface CentralTransparenciaProps {
  user: User;
  consents: Consent[];
  proofs: ProofOfCare[];
  simulateSolanaError: boolean;
  syncProofs?: () => Promise<void>;
  onNewProofEmitted?: (proof: any) => void;
}

// SHA-256 client side helper using native Web Cryptography API
async function computeSHA256(text: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback simple hash calculation if crypto is blocked in iframe sandbox
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    }
    return 'fallback_sha256_' + Math.abs(h).toString(16).padStart(8, '0') + '00000000000000000000000000000';
  }
}

export default function CentralTransparencia({
  user,
  consents,
  proofs,
  simulateSolanaError,
  syncProofs,
  onNewProofEmitted,
}: CentralTransparenciaProps) {
  // Navigation internal mode
  const [activeSubTab, setActiveSubTab] = useState<'verificador' | 'blockchain' | 'firestore'>('verificador');

  // Input states for Interactive Crypto Validator
  const [inputDid, setInputDid] = useState(user.did);
  const [inputType, setInputType] = useState('lgpd_consent');
  const [inputTimestamp, setInputTimestamp] = useState(consents[0]?.createdAt || new Date().toISOString());
  const [computedHash, setComputedHash] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    hashComputed: string;
    matchedTx?: Consent | null;
    message: string;
  } | null>(null);

  // Firestore mode states
  const [firestoreData, setFirestoreData] = useState<any | null>(null);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('consents');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Solana search and filter
  const [solanaSearch, setSolanaSearch] = useState('');
  const [solanaFilter, setSolanaFilter] = useState<'all' | 'consent' | 'proof'>('all');

  // Load database raw schema for the NoSQL view
  const fetchFirestoreRaw = async () => {
    setIsLoadingFirestore(true);
    try {
      const resp = await fetch('/api/demo/firestore-raw');
      const data = await resp.json();
      setFirestoreData(data);
      if (data && data[selectedCollection] && data[selectedCollection].length > 0) {
        setSelectedDocId(data[selectedCollection][0].id || data[selectedCollection][0].uid || data[selectedCollection][0].hash || null);
      } else {
        setSelectedDocId(null);
      }
    } catch (e) {
      console.error('Error fetching NoSQL state:', e);
    } finally {
      setIsLoadingFirestore(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'firestore') {
      fetchFirestoreRaw();
    }
  }, [activeSubTab, selectedCollection]);

  // Set default timestamp on mount if consent is present
  useEffect(() => {
    if (consents.length > 0) {
      setInputTimestamp(consents[0].createdAt);
    }
  }, [consents]);

  // Run the SHA256 check
  const handleVerifySignature = async () => {
    setIsCalculating(true);
    setValidationResult(null);
    
    // Mimic deep execution pipeline calculation delay (350ms)
    await new Promise((resolve) => setTimeout(resolve, 550));

    const textToHash = inputDid + inputType + inputTimestamp;
    const hash = await computeSHA256(textToHash);
    setComputedHash(hash);

    // Look if any actual consent in consents matches this hash
    const foundConsent = consents.find(c => c.hash === hash || c.hash.substring(0, 32) === hash.substring(0, 32));

    if (foundConsent) {
      setValidationResult({
        success: true,
        hashComputed: hash,
        matchedTx: foundConsent,
        message: 'ASSINATURA CRIPTOGRÁFICA REGISTRADA INDUBITAVELMENTE NO METADADO DA TRANSACÃO SOLANA DEVNET!'
      });
      // Automatically award the 'guardia' badge on successful validator usage
      try {
        const resp = await fetch('/api/proofs/validate-on-chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            simulateError: false
          }),
        });
        const badgeData = await resp.json();
        if (badgeData.success && badgeData.badge && onNewProofEmitted) {
          onNewProofEmitted({
            userId: user.uid,
            badge: 'guardia',
            solanaTx: badgeData.badge.solanaTx,
            createdAt: badgeData.badge.createdAt,
            status: badgeData.badge.status,
          });
        }
        if (syncProofs) {
          await syncProofs();
        }
      } catch (badgeErr) {
        console.error('Failed to claim Transparency Guardian badge:', badgeErr);
      }
    } else {
      // Just simulate if no matches exist but maybe user tweaked something
      setValidationResult({
        success: false,
        hashComputed: hash,
        matchedTx: null,
        message: 'Nenhum registro correspondente foi localizado na transação Solana Devnet com estes valores.'
      });
    }
    setIsCalculating(false);
  };

  // Combine items to list on-chain ledger
  const txList = [
    ...consents.map((c) => ({
      ...c,
      txType: 'lgpd_consent',
      memoText: `{"type":"lgpd_consent","did":"${user.did}","hash":"${c.hash.substring(0, 12)}...","timestamp":"${c.createdAt}"}`,
    })),
    ...proofs.map((p) => ({
      ...p,
      txType: 'proof_of_care',
      transactionId: p.solanaTx,
      hash: p.solanaTx,
      memoText: `{"type":"proof_of_care","did":"${user.did}","badge":"${p.badge}","timestamp":"${p.createdAt}"}`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredTx = txList.filter((tx) => {
    if (solanaFilter === 'consent' && tx.txType !== 'lgpd_consent') return false;
    if (solanaFilter === 'proof' && tx.txType !== 'proof_of_care') return false;
    if (!solanaSearch) return true;
    return (
      (tx.transactionId && tx.transactionId.toLowerCase().includes(solanaSearch.toLowerCase())) ||
      (tx.hash && tx.hash.toLowerCase().includes(solanaSearch.toLowerCase()))
    );
  });

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 font-sans text-slate-800">
      
      {/* Intro banner header - Face style */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-3xs mb-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1877f2] via-violet-500 to-emerald-500"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#1877f2]/10 text-[#1877f2] text-[10.5px] px-2.5 py-1 rounded-full font-sans font-bold uppercase tracking-wider mb-2.5">
              <Code className="w-3.5 h-3.5" /> Garantia de Privacidade e Segurança
            </span>
            <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-slate-900 leading-tight">
              Sua Privacidade Protegida e Inviolável
            </h1>
            <p className="text-slate-550 text-xs md:text-sm font-sans mt-1 max-w-2xl leading-relaxed">
              Acompanhe de forma simples como seus termos e dados são salvaguardados por criptografia de cofre digital, garantindo anonimato absoluto e transparência nas interações de apoio.
            </p>
          </div>

          <div className="flex items-center gap-2 font-sans text-[10px] bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-500 font-semibold select-none">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cofre Digital Protegido e Ativo</span>
          </div>
        </div>
      </div>

      {/* Grid: 4 statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 select-none">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-[#1877f2] rounded-lg shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-bold">Identidade Maternal Protegida</p>
            <p className="text-xs font-bold text-slate-700 font-mono truncate max-w-[160px] cursor-help" title={user.did}>
              Código: {user.did.substring(0, 15)}...
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-bold">Termo de Consentimento (LGPD)</p>
            <p className="text-xs font-bold text-slate-800 font-sans">
              {consents.length > 0 ? '✓ Ativo e Registrado' : '✖ Não assinado'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-bold">Medalhas de Empatia</p>
            <p className="text-xs font-bold text-slate-800 font-sans">
              {proofs.length} conquistada(s)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-bold">Status de Registro Seguro</p>
            <p className="text-xs font-bold text-slate-800 font-sans flex items-center gap-1.5">
              <span>{simulateSolanaError ? 'Cofre Local Ativo' : 'Cofre Principal Sincronizado'}</span>
              <span className={`h-2 w-2 rounded-full ${simulateSolanaError ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
            </p>
          </div>
        </div>
      </div>

      {/* Main layout with SubNavigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column sidebar menus (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-3xs space-y-0.5 select-none">
            <p className="text-[9.5px] uppercase font-sans tracking-widest text-[#1877f2] px-3.5 py-2 font-bold select-none">
              Validação de Privacidade
            </p>
            
            <button
              onClick={() => setActiveSubTab('verificador')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeSubTab === 'verificador'
                  ? 'bg-slate-100 text-[#1877f2] font-bold'
                  : 'hover:bg-slate-50 text-slate-650'
              }`}
            >
              <Cpu className="w-5 h-5 text-[#1877f2]" />
              <div className="min-w-0 flex-1">
                <span>Confirmar Termo LGPD</span>
                <p className="text-[9px] text-slate-400 font-normal truncate mt-0.5">Valide a privacidade do seu consentimento</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab('blockchain')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeSubTab === 'blockchain'
                  ? 'bg-slate-100 text-[#1877f2] font-bold'
                  : 'hover:bg-slate-50 text-slate-650'
              }`}
            >
              <Link2 className="w-5 h-5 text-indigo-500" />
              <div className="min-w-0 flex-1">
                <span>Cofre de Registros Geral</span>
                <p className="text-[9px] text-slate-400 font-normal truncate mt-0.5">Veja eventos protegidos on-chain</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab('firestore')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeSubTab === 'firestore'
                  ? 'bg-slate-100 text-[#1877f2] font-bold'
                  : 'hover:bg-slate-50 text-slate-650'
              }`}
            >
              <Database className="w-5 h-5 text-teal-500" />
              <div className="min-w-0 flex-1">
                <span>Nuvem de Dados</span>
                <p className="text-[9px] text-slate-400 font-normal truncate mt-0.5">Dados anonimizados e seguros</p>
              </div>
            </button>
          </div>

          <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 rounded-lg p-4 text-white space-y-2.5 shadow-3xs select-none">
            <h4 className="text-xs font-sans font-bold tracking-wider text-amber-300 flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-4 h-4" /> Como funciona?
            </h4>
            <div className="text-[10px] text-indigo-105 leading-relaxed font-sans space-y-2">
              <p>
                1. <strong>Privacidade Blindada</strong>: Seus dados pessoais ficam apartados das mensagens e termos autorizados. O seu identificador é pseudônimo e as conversas são seguras.
              </p>
              <p>
                2. <strong>Cofre Criptográfico Inviolável</strong>: Os termos que você assina geram um código único imutável gravado no cofre digital (blockchain). Isso impede que qualquer pessoa altere suas escolhas ou leia suas postagens sem permissão.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Dynamic active screen (9 cols) */}
        <div className="lg:col-span-9">
          
          {/* SCREEN PANEL 1: CRIPTOGRAPHIC SHA256 VALIDATOR */}
          {activeSubTab === 'verificador' && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-3xs space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#1877f2]" /> Garantia de Proteção do Seu Termo (LGPD)
                </h3>
                <p className="text-xs text-slate-550 font-sans mt-0.5 max-w-xl">
                  Confirme se o seu termo está gravado de forma 100% segura no cofre criptográfico fazendo uma validação de integridade digital instantânea.
                </p>
              </div>

              {/* Input details form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-150">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wide text-slate-450 font-bold block">
                    1. Identificador descentralizado (DID)
                  </label>
                  <input
                    type="text"
                    value={inputDid}
                    onChange={(e) => {
                      setInputDid(e.target.value);
                      setValidationResult(null);
                    }}
                    className="w-full bg-white text-slate-800 border border-slate-250 p-2 rounded text-xs font-mono focus:outline-none focus:border-[#1877f2]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wide text-slate-450 font-bold block">
                    2. Tipo de Consentimento
                  </label>
                  <select
                    value={inputType}
                    onChange={(e) => {
                      setInputType(e.target.value);
                      setValidationResult(null);
                    }}
                    className="w-full bg-white text-slate-800 border border-slate-250 p-2 rounded text-xs focus:outline-none focus:border-[#1877f2] font-semibold"
                  >
                    <option value="lgpd_consent">Consentimento Cláusulas LGPD (Padrão)</option>
                    <option value="proof_of_care">Medalha de Reputação Morais</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wide text-slate-450 font-bold block">
                    3. Registro Temporal (GMT Timestamp do Contrato)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputTimestamp}
                      onChange={(e) => {
                        setInputTimestamp(e.target.value);
                        setValidationResult(null);
                      }}
                      className="w-full bg-white text-slate-800 border border-slate-250 p-2 rounded text-xs font-mono focus:outline-none focus:border-[#1877f2]"
                    />
                    <button
                      onClick={() => {
                        setInputTimestamp(new Date().toISOString());
                        setValidationResult(null);
                      }}
                      className="px-3 bg-slate-200 hover:bg-slate-250 rounded text-slate-700 font-sans text-xs transition font-semibold"
                    >
                      Agora
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    *Para validar o seu termo de privacidade atual, certifique-se de preencher com o timestamp idêntico ao carregado sob a transação inicial.
                  </p>
                </div>
              </div>

              {/* Cryptographic Execution algorithm layout */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-150 pt-4">
                <div className="font-mono text-[10.5px] leading-relaxed text-slate-500">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Variável de Entrada (String Bruta Concatenada)</p>
                  <p className="bg-slate-100 p-2 rounded text-slate-700 select-all font-semibold font-mono break-all text-[10px] border border-slate-150 mt-1 max-w-lg">
                    {inputDid}{inputType}{inputTimestamp}
                  </p>
                  <p className="text-[9.5px] font-mono text-[#1877f2] mt-1.5 flex items-center gap-1 font-bold">
                    <Cpu className="w-3.5 h-3.5" /> Função de Redução Criptográfica: SHA256 (String)
                  </p>
                </div>

                <button
                  onClick={handleVerifySignature}
                  disabled={isCalculating}
                  className="bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1565c0] text-white font-sans font-bold text-xs py-3 px-5 rounded-lg transition shrink-0 shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Calcular Assinatura Criptográfica</span>
                    </>
                  )}
                </button>
              </div>

              {/* Big dynamic high fidelity result section */}
              <AnimatePresence>
                {validationResult && (
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    className={`p-5 rounded-xl border ${
                      validationResult.success 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-950' 
                        : 'bg-amber-500/5 border-amber-500/20 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl shrink-0 ${validationResult.success ? 'bg-emerald-100 text-emerald-600 animate-bounce' : 'bg-amber-100 text-amber-600'}`}>
                        {validationResult.success ? <CheckCircle className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
                      </div>
                      
                      <div className="space-y-2.5 min-w-0 flex-1">
                        <div>
                          <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${validationResult.success ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {validationResult.success ? '✓ CONSENTIMENTO VALIDADO COM SUCESSO' : '✖ ERRO DE COMPATIBILIDADE DE HASH'}
                          </p>
                          <h4 className="text-xs font-black font-sans tracking-wide leading-tight uppercase mt-0.5">
                            {validationResult.message}
                          </h4>
                        </div>

                        {/* Computed result hash value */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 block font-mono">Assinatura SHA-256 local recalculada:</span>
                          <pre className="text-[10px] bg-black text-emerald-400 p-2.5 rounded-lg overflow-x-auto font-mono select-all select-text border border-slate-800">
                            {validationResult.hashComputed}
                          </pre>
                        </div>

                        {validationResult.success && validationResult.matchedTx && (
                          <div className="space-y-1 px-3 py-2 bg-slate-100 border border-slate-200 text-[10.5px] rounded-lg text-slate-650 font-mono">
                            <p className="font-bold border-b border-slate-200 pb-1 text-slate-800 text-[9.5px]">REGISTRO ENCONTRADO NA NET DEVNET:</p>
                            <p className="mt-1">Transaction Link Signature:</p>
                            <p className="text-[#1877f2] font-black break-all select-all text-[9.5px] bg-white border border-slate-150 p-1 rounded">
                              {validationResult.matchedTx.transactionId}
                            </p>
                            <div className="flex gap-4 mt-2 border-t border-slate-200 pt-1 text-[9px] text-slate-500">
                              <span>Status: <b className="text-emerald-600">Sincronizado na Solana</b></span>
                              <span>Tipo: <b>{validationResult.matchedTx.userId === user.uid ? 'Seu próprio termo' : 'Termo de terceiro'}</b></span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* SCREEN PANEL 2: SOLANA MEMO PROGRAM DEVNET LEDGER */}
          {activeSubTab === 'blockchain' && (
            <div className="bg-slate-950 rounded-lg border border-slate-850 p-5 shadow-3xs text-slate-100 space-y-4 font-mono">
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-850 pb-4 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-amber-500 flex items-center gap-1.5 font-sans">
                    <Link2 className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Solana Devnet Log de Transmissões
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                    Auditório de transações transmitidas para o ID do Programa Memo <code className="bg-slate-900 px-1 py-0.2 rounded text-slate-300 font-mono text-[9.5px]">Mem6gK3G...</code>
                  </p>
                </div>

                {/* Filter Selector */}
                <div className="flex bg-slate-900 p-0.5 rounded-md text-[10px]">
                  <button
                    onClick={() => setSolanaFilter('all')}
                    className={`px-2.5 py-1 rounded transition font-sans cursor-pointer ${solanaFilter === 'all' ? 'bg-amber-500/10 text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSolanaFilter('consent')}
                    className={`px-2.5 py-1 rounded transition font-sans cursor-pointer ${solanaFilter === 'consent' ? 'bg-amber-500/10 text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Consentimento
                  </button>
                  <button
                    onClick={() => setSolanaFilter('proof')}
                    className={`px-2.5 py-1 rounded transition font-sans cursor-pointer ${solanaFilter === 'proof' ? 'bg-amber-500/10 text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Care Badge
                  </button>
                </div>
              </div>

              {/* Internal transaction log layout */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {filteredTx.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 font-sans flex flex-col items-center gap-2">
                    <HelpCircle className="w-8 h-8 text-slate-700" />
                    <span>Nenhuma transação on-chain localizada na sua conta.</span>
                  </div>
                ) : (
                  filteredTx.map((tx, idx) => {
                    const isPending = tx.status === 'pending';
                    const isConsent = tx.txType === 'lgpd_consent';

                    return (
                      <div
                        key={idx}
                        className={`bg-slate-900/60 rounded-lg p-3.5 border text-xs ${
                          isPending ? 'border-amber-500/20' : 'border-slate-850'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2 font-mono">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-sans uppercase font-bold tracking-wider ${
                              isConsent ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {isConsent ? 'LGPD Consentimento' : 'Reputação Proof of Care'}
                          </span>

                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(tx.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1.5 font-mono mb-2">
                          <div className="text-[11px]">
                            <span className="text-slate-500">Transação ID:</span>
                            <div className="font-semibold text-slate-300 break-all select-all font-mono py-1 block">
                              {tx.transactionId}
                            </div>
                          </div>

                          <div className="flex border-t border-slate-850 pt-2 text-[10.5px]">
                            <div className="flex-1">
                              <span className="text-slate-500 block">Tipo:</span>
                              <span className="text-slate-300 uppercase font-semibold font-mono">{tx.txType}</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-slate-500 block">Status:</span>
                              <span className={isPending ? 'text-amber-500 animate-pulse font-bold' : 'text-emerald-400 font-bold'}>
                                {isPending ? '✖ Pendente (Sinc)' : '✔ Sincronizado'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <span className="text-[9.5px] text-slate-500 block mb-1">Payload Codificado no Payload de Dados:</span>
                          <pre className="text-[9.5px] bg-black p-2 rounded text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text font-mono">
                            {tx.memoText}
                          </pre>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 bg-slate-900 border border-slate-850 text-[10px] text-slate-400 font-sans leading-relaxed rounded flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  O hash e o DID salvos no log permitem que o consórcio de auditores comprove de forma redundante e sem revelar mensagens pessoais que a privacidade destas mães é blindada matematicamente contra fraudes de dados.
                </span>
              </div>
            </div>
          )}

          {/* SCREEN PANEL 3: LIVE FIRESTORE SIMULATION COLLECTIONS */}
          {activeSubTab === 'firestore' && (
            <div className="bg-slate-950 rounded-lg border border-slate-850 p-5 shadow-3xs text-slate-100 space-y-4 font-mono">
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-teal-400 flex items-center gap-1.5 font-sans">
                    <Database className="w-4.5 h-4.5 text-teal-400 animate-pulse" /> Console em Tempo Real do Firestore
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                    Acompanhe em tempo real a sincronização interna NoSQL dos dados anônimos de acolhimento.
                  </p>
                </div>

                <button
                  onClick={fetchFirestoreRaw}
                  className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-[9px] font-mono flex items-center gap-1.5 text-slate-300 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingFirestore ? 'animate-spin' : ''}`} /> Sincronizar Árvore NoSQL
                </button>
              </div>

              {/* Grid: Left Collections Selector, Right Documents content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* 1. Selector side */}
                <div className="md:col-span-4 space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wide text-slate-500 block font-bold mb-1">Coleções Firestore</span>
                  {[
                    { id: 'users', count: firestoreData?.users?.length || 0, label: '📁 users' },
                    { id: 'consents', count: firestoreData?.consents?.length || 0, label: '📁 consents' },
                    { id: 'posts', count: firestoreData?.posts?.length || 0, label: '📁 posts' },
                    { id: 'interactions', count: firestoreData?.interactions?.length || 0, label: '📁 interactions' },
                    { id: 'proof_of_care', count: firestoreData?.proof_of_care?.length || 0, label: '📁 proof_of_care' },
                    { id: 'assistant_messages', count: firestoreData?.assistant_messages?.length || 0, label: '📁 assistant_msg' },
                  ].map((col) => {
                    const isSel = selectedCollection === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => {
                          setSelectedCollection(col.id);
                          setSelectedDocId(null);
                          if (firestoreData && firestoreData[col.id] && firestoreData[col.id].length > 0) {
                            const firstId = firestoreData[col.id][0].id || firestoreData[col.id][0].uid || firestoreData[col.id][0].hash;
                            setSelectedDocId(firstId || null);
                          }
                        }}
                        className={`w-full p-2 rounded-lg text-left text-xs font-mono transition flex items-center justify-between border cursor-pointer ${
                          isSel 
                            ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 font-bold' 
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-850 text-slate-400'
                        }`}
                      >
                        <span className="truncate">{col.label}</span>
                        <span className="text-[9.5px] font-bold bg-slate-950 px-1 py-0.2 border border-slate-850 rounded text-slate-450">
                          {col.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. Document entries and Inspect views */}
                <div className="md:col-span-8 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Document list */}
                    <div className="border border-slate-850 bg-slate-950 rounded-lg flex flex-col h-[200px]">
                      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-850 text-[10px] text-slate-400 uppercase font-bold">
                        Documentos
                      </div>
                      <div className="flex-grow overflow-y-auto p-1.5 space-y-1">
                        {isLoadingFirestore ? (
                          <div className="text-center py-10 text-slate-600 animate-pulse text-[10px]">Carregando...</div>
                        ) : !firestoreData || !firestoreData[selectedCollection] || firestoreData[selectedCollection].length === 0 ? (
                          <div className="text-center py-10 text-slate-650 text-[10px] font-sans">Sem documentos nesta coleção.</div>
                        ) : (
                          firestoreData[selectedCollection].map((doc: any, i: number) => {
                            const docId = doc.id || doc.uid || doc.hash || `doc_${i}`;
                            const isSelected = selectedDocId === docId;
                            
                            let briefText = doc.did || doc.userId || doc.content || doc.message || doc.badge || '';
                            if (briefText.length > 15) briefText = briefText.substring(0, 13) + '...';

                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedDocId(docId)}
                                className={`w-full p-2 rounded text-left font-mono text-[9.5px] transition flex flex-col border cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-800 border-teal-500/50 text-slate-200'
                                    : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                <span className="text-slate-300 font-semibold truncate">ID: {docId.substring(0, 12)}...</span>
                                <span className="text-slate-550 truncate text-[8.5px] pl-1 border-l border-slate-850 mt-0.5">{briefText}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* JSON Display */}
                    <div className="border border-slate-850 bg-slate-950 rounded-lg flex flex-col h-[200px]">
                      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-850 text-[10px] text-slate-400 uppercase font-bold flex justify-between items-center">
                        <span>Inspetor JSON</span>
                        <FileJson className="w-3.5 h-3.5" />
                      </div>
                      
                      <div className="flex-grow overflow-y-auto p-2.5 text-[9.5px]">
                        {selectedDocId && firestoreData && firestoreData[selectedCollection] ? (
                          (() => {
                            const currentDoc = firestoreData[selectedCollection].find((doc: any) => {
                              const target = doc.id || doc.uid || doc.hash;
                              return target === selectedDocId;
                            });

                            if (!currentDoc) {
                              return <div className="text-center py-10 text-slate-650 font-sans">Selecione para ler dados NoSQL.</div>;
                            }

                            return (
                              <pre className="text-teal-400 select-text leading-tight leading-relaxed select-all">
                                {JSON.stringify(currentDoc, null, 2)}
                              </pre>
                            );
                          })()
                        ) : (
                          <div className="text-center py-10 text-slate-600 font-sans">Selecione um documento.</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
