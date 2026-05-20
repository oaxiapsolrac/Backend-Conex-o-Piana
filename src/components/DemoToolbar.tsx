/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, Radio, HardDrive, ShieldAlert, Award, Clock } from 'lucide-react';

interface DemoToolbarProps {
  bypassAgeCheck: boolean;
  setBypassAgeCheck: (val: boolean) => void;
  simulateSolanaError: boolean;
  setSimulateSolanaError: (val: boolean) => void;
  onReset: () => void;
  userCreatedTime: string;
}

export default function DemoToolbar({
  bypassAgeCheck,
  setBypassAgeCheck,
  simulateSolanaError,
  setSimulateSolanaError,
  onReset,
  userCreatedTime,
}: DemoToolbarProps) {
  const accountAgeMinutes = Math.round(
    ((new Date().getTime() - new Date(userCreatedTime).getTime()) / (1000 * 60)) * 10
  ) / 10;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2.5 px-4 text-xs font-mono select-none flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-sans font-medium text-slate-200">Painel de Demonstração HackaNation 2026</span>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Cadastro: {accountAgeMinutes} min atrás</span>
          {accountAgeMinutes < 10 && !bypassAgeCheck ? (
            <span className="text-amber-500 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Regra 10 min ativa
            </span>
          ) : (
            <span className="text-emerald-500 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <Award className="w-3 h-3" /> Elegível a Badges
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Toggle Age Check Bypass */}
        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition">
          <input
            type="checkbox"
            checked={bypassAgeCheck}
            onChange={(e) => setBypassAgeCheck(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
          />
          <span className="font-sans text-slate-300 flex items-center gap-1">
            Burlar Regra 10 Min
          </span>
        </label>

        {/* Toggle Solana Network Failure */}
        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition">
          <input
            type="checkbox"
            checked={simulateSolanaError}
            onChange={(e) => setSimulateSolanaError(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-red-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
          />
          <span className="font-sans text-slate-300 flex items-center gap-1">
            Simular Falha Solana
          </span>
        </label>

        <span className="text-slate-700">|</span>

        {/* Database Clean Reset button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 px-2.5 py-1 rounded transition disabled:opacity-50"
          title="Apagar todos os dados e resetar coleções"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="font-sans font-medium">Resetar MVP</span>
        </button>
      </div>
    </div>
  );
}
