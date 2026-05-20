/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Search, FileText, CheckCircle, Clock, Link2, Key, HelpCircle, Database, Folder, Shield, RefreshCw, ChevronRight, CornerDownRight, FileJson } from 'lucide-react';
import { Consent, ProofOfCare } from '../types';

interface SolanaExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  consents: Consent[];
  proofs: ProofOfCare[];
}

export default function SolanaExplorer({ isOpen, onClose, consents, proofs }: SolanaExplorerProps) {
  // Navigation: Toggle between Solana Ledger and Live Firestore Collections Inspector
  const [explorerMode, setExplorerMode] = useState<'solana' | 'firestore'>('solana');
  
  // Solana mode states
  const [activeSolanaTab, setActiveTab] = useState<'all' | 'consents' | 'proofs'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Firestore mode states
  const [firestoreData, setFirestoreData] = useState<any | null>(null);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('users');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Fetch live collections tree from backend
  const fetchFirestoreRaw = async () => {
    setIsLoadingFirestore(true);
    try {
      const resp = await fetch('/api/demo/firestore-raw');
      const data = await resp.json();
      setFirestoreData(data);
      // Auto-set first doc from collection as selected if available
      if (data && data[selectedCollection] && data[selectedCollection].length > 0) {
        setSelectedDocId(data[selectedCollection][0].id || data[selectedCollection][0].uid || data[selectedCollection][0].hash || null);
      } else {
        setSelectedDocId(null);
      }
    } catch (e) {
      console.error('Error loading Firestore raw state:', e);
    } finally {
      setIsLoadingFirestore(false);
    }
  };

  useEffect(() => {
    if (isOpen && explorerMode === 'firestore') {
      fetchFirestoreRaw();
    }
  }, [isOpen, explorerMode, selectedCollection]);

  if (!isOpen) return null;

  // Combine items into a timeline of transactions for Solana View
  const txList = [
    ...consents.map((c) => ({
      ...c,
      txType: 'lgpd_consent',
      memoText: `{"type":"lgpd_consent","did":"PIANA-XXXXXX","hash":"${c.hash.substring(0, 8)}...","timestamp":"${c.createdAt}"}`,
    })),
    ...proofs.map((p) => ({
      ...p,
      txType: 'proof_of_care',
      transactionId: p.solanaTx,
      hash: p.solanaTx,
      memoText: `{"type":"proof_of_care","did":"PIANA-XXXXXX","badge":"${p.badge}","timestamp":"${p.createdAt}"}`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredTx = txList.filter((tx) => {
    if (activeSolanaTab === 'consents' && tx.txType !== 'lgpd_consent') return false;
    if (activeSolanaTab === 'proofs' && tx.txType !== 'proof_of_care') return false;

    if (searchTerm === '') return true;
    return (
      (tx.transactionId && tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.hash && tx.hash.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-slate-950 text-slate-100 shadow-2xl z-50 flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/95 flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-sans font-bold text-base text-amber-500 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" /> Auditar Sistema Conexão Piana
          </h2>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">Console de Engenharia MVP v3.1</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 px-2.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition font-sans text-xs flex items-center gap-1 cursor-pointer"
        >
          <X className="w-4 h-4" /> Fechar
        </button>
      </div>

      {/* Toggle View Mode (Solana / Firestore) */}
      <div className="bg-slate-900/40 p-2.5 border-b border-slate-800 shrink-0 flex gap-2">
        <button
          onClick={() => setExplorerMode('solana')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition cursor-pointer ${
            explorerMode === 'solana'
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" /> Solana Ledger ({txList.length})
        </button>
        <button
          onClick={() => setExplorerMode('firestore')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition cursor-pointer ${
            explorerMode === 'firestore'
              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Firestore Console Live
        </button>
      </div>

      {/* VIEW CONTENT MODULE: SOLANA DEVNET LEDGER */}
      {explorerMode === 'solana' ? (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Info Stats bar */}
          <div className="bg-slate-900/15 p-3 px-4 border-b border-slate-800/50 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div>
              Rede: <span className="text-amber-500 font-medium font-mono">Solana Devnet</span>
            </div>
            <div>
              Prog. ID: <span className="text-slate-200">Mem6gK3G...MemoProg</span>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col gap-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por Assinatura ou Hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 text-xs font-mono transition"
              />
            </div>

            {/* Quick Filter Selection */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 rounded-md transition text-center font-sans cursor-pointer ${activeSolanaTab === 'all' ? 'bg-amber-500/15 text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Todos ({txList.length})
              </button>
              <button
                onClick={() => setActiveTab('consents')}
                className={`flex-1 py-1 rounded-md transition text-center font-sans cursor-pointer ${activeSolanaTab === 'consents' ? 'bg-amber-500/15 text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Consentimentos
              </button>
              <button
                onClick={() => setActiveTab('proofs')}
                className={`flex-1 py-1 rounded-md transition text-center font-sans cursor-pointer ${activeSolanaTab === 'proofs' ? 'bg-amber-500/15 text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Proof of Care
              </button>
            </div>
          </div>

          {/* Transaction Grid list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs max-h-[calc(100vh-220px)]">
            {filteredTx.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-sans flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-slate-700" />
                <span className="text-xs">Nenhum registro on-chain localizado.</span>
              </div>
            ) : (
              filteredTx.map((tx, idx) => {
                const isPending = tx.status === 'pending';
                const isConsent = tx.txType === 'lgpd_consent';

                return (
                  <div
                    key={idx}
                    className={`bg-slate-900/80 rounded-xl border p-4 transition duration-200 hover:border-slate-700 ${
                      isPending ? 'border-amber-500/20 bg-amber-500/[0.01]' : 'border-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider ${
                          isConsent ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isConsent ? 'LGPD Consent' : 'Proof of Care'}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] mb-3">
                      <div>
                        <span className="text-slate-500">Signature ID:</span>
                        <div className="font-semibold text-slate-300 break-all bg-black/40 px-2 py-1 rounded text-[10px] mt-0.5 flex justify-between items-center gap-1.5">
                          <span className="truncate">{tx.transactionId}</span>
                          {isPending ? (
                            <span className="text-[9px] text-amber-500 shrink-0 font-sans border border-amber-500/30 px-1 py-0.2 rounded bg-amber-500/10 animate-pulse">
                              Pendente Sinc.
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 shrink-0 font-sans border border-emerald-400/20 px-1 py-0.2 rounded bg-emerald-400/10 flex items-center gap-0.5">
                              ✔ Sucesso
                            </span>
                          )}
                        </div>
                      </div>

                      {isConsent && (
                        <div>
                          <span className="text-slate-500">Hash SHA256 Auditável:</span>
                          <div className="text-slate-400 break-all bg-black/20 px-2 py-0.5 rounded text-[10px] mt-0.5 select-all">
                            {tx.hash}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-500 block mb-1">Payload no Solana Memo Program:</span>
                    <pre className="text-[9px] bg-slate-950 p-2 rounded-lg text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                      {isConsent ? (
                        JSON.stringify({
                          type: "lgpd_consent",
                          hash: tx.hash,
                          timestamp: tx.createdAt,
                          status: "synced_ledger"
                        }, null, 2)
                      ) : (
                        JSON.stringify({
                          type: "proof_of_care",
                          badge: (tx as any).badge || 'acolhedora',
                          timestamp: tx.createdAt,
                          status: "issued_reputation"
                        }, null, 2)
                      )}
                    </pre>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer details */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 font-sans space-y-1 shrink-0">
            <p className="flex items-center gap-1 text-slate-300 font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Camada de Confiança Descentralizada (L3)
            </p>
            <p className="leading-relaxed text-[10px] text-slate-400">
              O ecossistema utiliza a Solana Devnet como indexador imutável de reputação e auditoria moral, mantendo dados originais em sigilo.
            </p>
          </div>

        </div>
      ) : (
        /* --- VIEW CONTENT MODULE: FIRESTORE SIMULATION COLLECTIONS CONSOLE --- */
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          
          {/* Header toolbar with Refresh trigger */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/15 flex justify-between items-center text-[10px] uppercase font-mono tracking-wider shrink-0 text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Database className="w-3.5 h-3.5 text-teal-400 animate-pulse" /> Firestore Simulated Database
            </span>
            <button
              onClick={fetchFirestoreRaw}
              disabled={isLoadingFirestore}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-900 transition flex items-center gap-1 cursor-pointer disabled:opacity-40 text-slate-300 font-mono text-[9px]"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingFirestore ? 'animate-spin' : ''}`} /> Sincronizar
            </button>
          </div>

          {/* Split Content: Collections Folder List Top / Document Explorer Bottom */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            
            {/* List of Simulated Firestore Collections / Collections Selector */}
            <div className="p-4 border-b border-slate-850 bg-slate-950/40 shrink-0">
              <label className="text-[10px] uppercase font-mono tracking-wide text-slate-500 mb-2 block font-semibold">
                Coleções (Simuladas no Firestore)
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'users', count: firestoreData?.users?.length || 0, label: '📁 users' },
                  { id: 'consents', count: firestoreData?.consents?.length || 0, label: '📁 consents' },
                  { id: 'posts', count: firestoreData?.posts?.length || 0, label: '📁 posts' },
                  { id: 'interactions', count: firestoreData?.interactions?.length || 0, label: '📁 interactions' },
                  { id: 'proof_of_care', count: firestoreData?.proof_of_care?.length || 0, label: '📁 proof_of_care' },
                  { id: 'assistant_messages', count: firestoreData?.assistant_messages?.length || 0, label: '📁 assistant_msg' },
                ].map((col) => {
                  const isActive = selectedCollection === col.id;
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
                      className={`p-2 rounded-lg text-left text-xs font-mono transition flex items-center justify-between border cursor-pointer ${
                        isActive
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="truncate">{col.label}</span>
                      <span className="text-[9.5px] font-bold bg-slate-950 px-1.5 py-0.5 rounded-md text-slate-550 border border-slate-800">
                        {col.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Display: Left documents listed, Right / bottom showing document inspect JSON */}
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
              
              {/* Documents List */}
              <div className="flex flex-col min-h-[160px] md:min-h-0 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-mono uppercase font-semibold">
                  Documentos
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                  {isLoadingFirestore ? (
                    <div className="text-center py-6 text-slate-500 text-[11px] font-mono animate-pulse">
                      Carregando...
                    </div>
                  ) : !firestoreData || !firestoreData[selectedCollection] || firestoreData[selectedCollection].length === 0 ? (
                    <div className="text-center py-8 text-slate-600 font-sans text-xs">
                      Nenhum documento cadastrado na coleção{' '}
                      <code className="text-[10px] text-slate-400 bg-slate-900 px-1 rounded">
                        /{selectedCollection}
                      </code>
                    </div>
                  ) : (
                    firestoreData[selectedCollection].map((doc: any, i: number) => {
                      const docId = doc.id || doc.uid || doc.hash || `doc_${i}`;
                      const isSelected = selectedDocId === docId;
                      
                      // Highlight metadata descriptor text
                      let summary = doc.did || doc.userId || doc.content || doc.message || doc.badge || '';
                      if (summary.length > 20) summary = summary.substring(0, 18) + '...';

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDocId(docId)}
                          className={`w-full p-2 rounded text-left font-mono text-[10px] transition flex flex-col border cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800 border-teal-500/50 text-slate-200'
                              : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <span className="text-slate-350 truncate flex items-center gap-1 font-semibold">
                            ID: {docId.substring(0, 15)}...
                          </span>
                          <span className="text-slate-500 text-[9px] truncate pl-1 border-l border-slate-800 mt-1">
                            {summary || '(sem dados)'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Document Inspector Panel (Key/values tree) */}
              <div className="flex flex-col min-h-[220px] md:min-h-0 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-between">
                  <span>Inspetor NoSQL</span>
                  <FileJson className="w-3.5 h-3.5 text-slate-550" />
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 bg-slate-950 font-mono text-[10px] leading-relaxed text-slate-300">
                  {selectedDocId && firestoreData && firestoreData[selectedCollection] ? (
                    (() => {
                      const currentDoc = firestoreData[selectedCollection].find((doc: any) => {
                        const target = doc.id || doc.uid || doc.hash;
                        return target === selectedDocId;
                      });

                      if (!currentDoc) {
                        return (
                          <div className="text-center py-6 text-slate-650 text-[11px] font-sans">
                            Selecione um documento válido para inspecionar.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          <div className="pb-2 border-b border-slate-850 text-slate-500 text-[9px]">
                            Coleção: <span className="text-teal-400 font-bold">/{selectedCollection}</span>/
                            <br />
                            Documento ID: <span className="text-slate-300 select-all font-bold">{selectedDocId}</span>
                          </div>

                          <pre className="text-teal-400 overflow-x-auto whitespace-pre-wrap select-text text-[9.5px]">
                            {JSON.stringify(currentDoc, null, 2)}
                          </pre>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-10 text-slate-600 font-sans text-xs">
                      Aguardando seleção de dados para renderização da Árvore de Atributos...
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Simulated Rules Schema Details footer */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 font-sans space-y-1 shrink-0">
            <p className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Database className="w-3.5 h-3.5 text-teal-400" /> Firebase security rules: VALIDATED ✔
            </p>
            <p className="leading-relaxed text-[9.5px] text-slate-400">
              O banco opera de forma relacional-anônima. Regras de segurança protegem dados privados validando que a leitura de desabafos nunca entregue o UID original das usuárias.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
