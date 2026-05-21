/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Trash2, ShieldAlert, Save, Info, User, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';

interface MaternalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onProfileUpdated: (newUser: UserType) => void;
  onAccountDeleted: () => void;
}

export default function MaternalProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
  onAccountDeleted,
}: MaternalProfileModalProps) {
  const [pseudonym, setPseudonym] = useState(user.pseudonym || '');
  const [childDiagnosis, setChildDiagnosis] = useState(user.childDiagnosis || '');
  const [childAge, setChildAge] = useState(user.childAge || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setPseudonym(user.pseudonym || '');
      setChildDiagnosis(user.childDiagnosis || '');
      setChildAge(user.childAge || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setShowDeleteConfirm(false); // Reset confirmation on user change
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const resp = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          pseudonym,
          childDiagnosis,
          childAge,
          bio,
          location,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || 'Erro ao salvar o perfil.');
      }
      onProfileUpdated(data);
      setSuccess('Perfil maternal atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Houve um erro ao atualizar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Prioritize POST to bypass standard iframe sandbox limitations targeting DELETE requests
      const resp = await fetch('/api/auth/forget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || 'Erro ao processar expurgo de dados.');
      }
      onAccountDeleted();
    } catch (err: any) {
      console.warn('POST purge failed, trying fallback DELETE request:', err);
      try {
        const resp2 = await fetch(`/api/auth/forget/${user.uid}`, {
          method: 'DELETE',
        });
        const data2 = await resp2.json();
        if (!resp2.ok || data2.error) {
          throw new Error(data2.error || 'Erro no fallback de exclusão.');
        }
        onAccountDeleted();
      } catch (err2: any) {
        setError(err2.message || 'Houve um erro ao processar o Direito ao Esquecimento sob regulação da LGPD.');
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="profile-modal-container">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-lg border border-stone-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-50 to-stone-100 px-6 py-4 border-b border-stone-150 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-piana-primary/10 flex items-center justify-center text-piana-primary">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-stone-900 font-sans tracking-tight">
                  Perfil da Mãe (Identidade Unificada)
                </h3>
                <p className="text-[10px] font-mono text-stone-400 font-medium">DID: {user.did}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium animate-pulse">
                {success}
              </div>
            )}

            <div className="space-y-3.5">
              {/* Pseudonym */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Pseudônimo de Mãe (Anonimato Preservado)
                </label>
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder={`Mãe ${user.did.substring(0, 5)}...`}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/50 hover:bg-white focus:bg-white focus:border-piana-primary focus:outline-none transition font-sans font-medium text-stone-800"
                />
                <p className="text-[9px] text-stone-400 mt-0.5 leading-normal">
                  Nome público exibido aos outros relatos na comunidade para proteger sua privacidade real.
                </p>
              </div>

              {/* Daughter/Son Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Diagnóstico / Condição Atípica
                  </label>
                  <input
                    type="text"
                    value={childDiagnosis}
                    onChange={(e) => setChildDiagnosis(e.target.value)}
                    placeholder="Ex: TEA (Autismo), Síndrome de Down, TDAH..."
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/50 hover:bg-white focus:bg-white focus:border-piana-primary focus:outline-none transition font-sans font-medium text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Idade da criança
                  </label>
                  <input
                    type="text"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    placeholder="Ex: 5 anos, recém nascido..."
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/50 hover:bg-white focus:bg-white focus:border-piana-primary focus:outline-none transition font-sans font-medium text-stone-800"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Estado / Cidade
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Curitiba - PR, São Paulo - SP..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/50 hover:bg-white focus:bg-white focus:border-piana-primary focus:outline-none transition font-sans font-medium text-stone-800"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Breve Bio / Sua História Atípica
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Divida um pouco de quem você é e sua jornada amorosa..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/50 hover:bg-white focus:bg-white focus:border-piana-primary focus:outline-none transition font-sans font-medium text-stone-800 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Buttons Row */}
            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 rounded-xl transition font-sans font-bold cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs bg-piana-primary hover:bg-piana-primary-hover active:bg-piana-primary/95 text-white rounded-xl transition font-sans font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </div>
          </form>

          {/* Right to be Forgotten LGPD Safe Section */}
          <div className="bg-stone-50 px-6 py-5 border-t border-stone-150 rounded-b-2xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-rose-950 font-sans tracking-tight">
                  Direito de Reclamação & Esquecimento (Art. 16 LGPD)
                </h4>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Sua privacidade e soberania absoluta sobre os dados são prioridades. Se desejar revogar sua permissão, você pode expurgar completamente seu cadastro, apagando permanentemente todos os registros, postagens e interações.
                </p>
              </div>
            </div>

            <div>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100/80 active:bg-rose-150 text-rose-700 hover:text-rose-800 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? 'Apagando todos os dados...' : 'Apagar todos os dados desta conta permanentemente'}
                </button>
              ) : (
                <div className="p-4 bg-rose-100/30 border border-rose-200 rounded-xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-600 font-extrabold text-xs mt-0.5">⚠️</span>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-rose-950 font-sans tracking-tight">Confirmar exclusão definitiva e irrevogável?</p>
                      <p className="text-[10px] text-rose-800 leading-normal">
                        Sob o Artigo 16 da LGPD, todos os seus dados inclusive: relatos públicos no feed, mensagens de acolhimento, históricos do chat com a Piana AI e DID serão apagados permanentemente de nossos servidores de demonstração. Esta ação não poderá ser desfeita.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-1.5 text-center text-stone-600 hover:bg-stone-100 border border-stone-200 text-xs font-extrabold rounded-xl transition cursor-pointer"
                    >
                      Manter dados
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 py-1.5 text-center text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-xs font-extrabold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? 'Apagando...' : 'Excluir definitivamente'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
