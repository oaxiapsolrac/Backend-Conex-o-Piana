/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  uid: string;
  did: string; // Formatting: PIANA-XXXXXXXX
  createdAt: string;
  pseudonym?: string;
  childDiagnosis?: string;
  childAge?: string;
  bio?: string;
  location?: string;
}

export interface Consent {
  id?: string;
  userId: string;
  hash: string; // SHA256(did + consent_type + timestamp)
  transactionId: string; // Solana transaction hash
  createdAt: string;
  status: 'synced' | 'pending';
}

export interface Post {
  id: string;
  userId: string;
  authorDid: string;
  content: string;
  createdAt: string;
  authorPseudonym?: string;
}

export interface Interaction {
  id: string;
  postId: string;
  senderId: string;
  senderDid: string;
  receiverId: string;
  message: string;
  createdAt: string;
  ai_context?: string;
  senderPseudonym?: string;
  proof_of_care?: {
    issued: boolean;
    badge: 'acolhedora' | 'narradora' | 'pioneira' | 'empatica' | 'guardia';
    solanaTx: string;
  } | null;
}

export interface ProofOfCare {
  id: string;
  userId: string;
  badge: 'acolhedora' | 'narradora' | 'pioneira' | 'empatica' | 'guardia';
  solanaTx: string;
  createdAt: string;
  status: 'synced' | 'pending';
}

export interface AssistantMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
