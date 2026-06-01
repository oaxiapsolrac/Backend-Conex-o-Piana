/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { User, Consent, Post, Interaction, ProofOfCare, AssistantMessage } from './types.js';

const DB_FILE = path.join(process.cwd(), 'piana-db.json');

interface Schema {
  users: User[];
  consents: Consent[];
  posts: Post[];
  interactions: Interaction[];
  proof_of_care: ProofOfCare[];
  assistant_messages: AssistantMessage[];
}

const defaultSchema: Schema = {
  users: [],
  consents: [],
  posts: [],
  interactions: [],
  proof_of_care: [],
  assistant_messages: [],
};

export class BackendDB {
  private schema: Schema = { ...defaultSchema };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(raw);
        // Ensure all keys exist
        this.schema.users = this.schema.users || [];
        this.schema.consents = this.schema.consents || [];
        this.schema.posts = this.schema.posts || [];
        this.schema.interactions = this.schema.interactions || [];
        this.schema.proof_of_care = this.schema.proof_of_care || [];
        this.schema.assistant_messages = this.schema.assistant_messages || [];
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, using in-memory backup:', e);
      this.schema = { ...defaultSchema };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database to file:', e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.schema.users;
  }

  getUser(uid: string): User | undefined {
    return this.schema.users.find((u) => u.uid === uid);
  }

  createUser(uid: string, did: string, createdAt: string): User {
    const existing = this.getUser(uid);
    if (existing) return existing;

    const newUser: User = { uid, did, createdAt };
    this.schema.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserProfile(uid: string, fields: Partial<Omit<User, 'uid' | 'did' | 'createdAt'>>): User | undefined {
    const user = this.getUser(uid);
    if (!user) return undefined;
    
    if (fields.pseudonym !== undefined) user.pseudonym = fields.pseudonym;
    if (fields.childDiagnosis !== undefined) user.childDiagnosis = fields.childDiagnosis;
    if (fields.childAge !== undefined) user.childAge = fields.childAge;
    if (fields.bio !== undefined) user.bio = fields.bio;
    if (fields.location !== undefined) user.location = fields.location;
    
    this.save();
    return user;
  }

  deleteUserData(uid: string) {
    // 1. Delete user record
    this.schema.users = this.schema.users.filter((u) => u.uid !== uid);
    
    // 2. Delete user consents
    this.schema.consents = this.schema.consents.filter((c) => c.userId !== uid);
    
    // 3. Delete user posts
    this.schema.posts = this.schema.posts.filter((p) => p.userId !== uid);
    
    // 4. Delete user interactions where they are the sender
    this.schema.interactions = this.schema.interactions.filter((i) => i.senderId !== uid);
    
    // 5. Delete proofs of care of user
    this.schema.proof_of_care = this.schema.proof_of_care.filter((p) => p.userId !== uid);
    
    // 6. Delete assistant messages
    this.schema.assistant_messages = this.schema.assistant_messages.filter((m) => m.userId !== uid);
    
    this.save();
  }

  // Consents
  getConsents(): Consent[] {
    return this.schema.consents;
  }

  getConsentsForUser(userId: string): Consent[] {
    return this.schema.consents.filter((c) => c.userId === userId);
  }

  addConsent(consent: Consent): Consent {
    this.schema.consents.push(consent);
    this.save();
    return consent;
  }

  updateConsentStatus(hash: string, status: 'synced' | 'pending', txId: string) {
    const consent = this.schema.consents.find(c => c.hash === hash);
    if (consent) {
      consent.status = status;
      consent.transactionId = txId;
      this.save();
    }
  }

  // Posts
  getPosts(): Post[] {
    // Sort newly created posts first
    return [...this.schema.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addPost(post: Post): Post {
    this.schema.posts.push(post);
    this.save();
    return post;
  }

  // Interactions
  getInteractions(): Interaction[] {
    return this.schema.interactions;
  }

  getInteractionsForPost(postId: string): Interaction[] {
    return this.schema.interactions.filter((i) => i.postId === postId);
  }

  addInteraction(interaction: Interaction): Interaction {
    this.schema.interactions.push(interaction);
    this.save();
    return interaction;
  }

  // Proof of Care
  getProofOfCare(): ProofOfCare[] {
    return this.schema.proof_of_care;
  }

  getProofOfCareForUser(userId: string): ProofOfCare[] {
    return this.schema.proof_of_care.filter((p) => p.userId === userId);
  }

  addProofOfCare(proof: ProofOfCare): ProofOfCare {
    this.schema.proof_of_care.push(proof);
    this.save();
    return proof;
  }

  // Assistant messages
  getAssistantMessagesForUser(userId: string): AssistantMessage[] {
    return this.schema.assistant_messages
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getAllAssistantMessages(): AssistantMessage[] {
    return this.schema.assistant_messages;
  }

  addAssistantMessage(msg: AssistantMessage): AssistantMessage {
    this.schema.assistant_messages.push(msg);
    this.save();
    return msg;
  }

  // Clear all (for demo resets if needed)
  clear() {
    this.schema = {
      users: [],
      consents: [],
      posts: [],
      interactions: [],
      proof_of_care: [],
      assistant_messages: [],
    };
    this.save();
  }
}

export const dbStore = new BackendDB();
