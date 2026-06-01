/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

process.on('uncaughtException', (err) => {
  console.error('ERRO FATAL NÃO TRATADO:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('PROMESSA REJEITADA NÃO TRATADA:', reason);
  process.exit(1);
});

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import cors from 'cors'; // <-- Importação do CORS adicionada aqui
import { dbStore } from './src/backend-db.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// --- CONFIGURAÇÃO DE CORS (Liberando o acesso para o Firebase) ---
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://conexao-piana.web.app' // <-- Seu frontend Firebase autorizado!
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// -----------------------------------------------------------------

app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '', 
});
console.log('[Conexão Piana] IA inicializada: llama-3.1-8b-instant');
console.log('[Conexão Piana] Solana Network:', process.env.SOLANA_NETWORK || 'devnet');
console.log('[Conexão Piana] Servidor pronto para demo.');

// Helper for SHA256 hashing
function generateSHA256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

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

import { Connection, Keypair, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

async function sendToSolanaMemoProgram(payload: object): Promise<string> {
  const privateKeyStr = process.env.SOLANA_PRIVATE_KEY;
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

  if (!privateKeyStr) {
    throw new Error('Chave não configurada.');
  }

  try {
    let secretKey: Uint8Array;
    
    if (privateKeyStr.trim().startsWith('[')) {
      secretKey = Uint8Array.from(JSON.parse(privateKeyStr));
    } else {
      secretKey = bs58.decode(privateKeyStr.trim());
    }

    const connection = new Connection(rpcUrl, 'confirmed');
    const feePayer = Keypair.fromSecretKey(secretKey);

    const memoProgramId = new PublicKey(process.env.SOLANA_MEMO_PROGRAM_ID || "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: feePayer.publicKey, isSigner: true, isWritable: true }],
      programId: memoProgramId,
      data: Buffer.from(JSON.stringify(payload), "utf-8"),
    });

    const transaction = new Transaction().add(memoInstruction);
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer.publicKey;

    const signature = await connection.sendTransaction(transaction, [feePayer]);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;

  } catch (error: any) {
    console.error("Erro na integração com a Solana:", error);
    throw new Error('Falha ao comunicar com a Solana Devnet.');
  }
}
// --- API ENDPOINTS ---

app.post('/api/auth/session', (req, res) => {
  try {
    const { uid, simulatedCreatedAt } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    let user = dbStore.getUser(uid);

    if (!user) {
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      const did = `PIANA-${randomHex}`;
      const createdAt = simulatedCreatedAt || new Date().toISOString();
      
      user = dbStore.createUser(uid, did, createdAt);
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/profile', (req, res) => {
  try {
    const { userId, pseudonym, childDiagnosis, childAge, bio, location } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const updatedUser = dbStore.updateUserProfile(userId, {
      pseudonym,
      childDiagnosis,
      childAge,
      bio,
      location,
    });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/by-did/:did', (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(400).json({ error: 'O parâmetro DID é obrigatório' });
    }
    const users = dbStore.getUsers();
    const foundUser = users.find(u => u.did === did);
    if (!foundUser) {
      return res.status(404).json({ error: 'Esta mãe não foi encontrada ou seus dados foram excluídos.' });
    }
    const badges = dbStore.getProofOfCareForUser(foundUser.uid);
    res.json({
      uid: foundUser.uid,
      did: foundUser.did,
      createdAt: foundUser.createdAt,
      pseudonym: foundUser.pseudonym,
      childDiagnosis: foundUser.childDiagnosis,
      childAge: foundUser.childAge,
      bio: foundUser.bio,
      location: foundUser.location,
      badges: badges
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const handleForget = (userIdArg: string | undefined, res: express.Response) => {
  if (!userIdArg) {
    return res.status(400).json({ error: 'userId is required' });
  }
  dbStore.deleteUserData(userIdArg);
  return res.json({ success: true, message: 'Todos os dados foram apagados permanentemente!' });
};

app.delete('/api/auth/forget/:userId', (req, res) => {
  try {
    handleForget(req.params.userId, res);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/forget/:userId', (req, res) => {
  try {
    handleForget(req.params.userId, res);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/forget', (req, res) => {
  try {
    const userId = req.body.userId || req.body.uid;
    handleForget(userId, res);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/demo/reset', (req, res) => {
  dbStore.clear();
  res.json({ status: 'ok', message: 'Database reset successfully' });
});

app.get('/api/demo/blockchain-state', (req, res) => {
  const consents = dbStore.getConsents();
  const proofOfCare = dbStore.getProofOfCare();
  res.json({ consents, proofOfCare });
});

app.get('/api/demo/firestore-raw', (req, res) => {
  try {
    res.json({
      users: dbStore.getUsers(),
      consents: dbStore.getConsents(),
      posts: dbStore.getPosts(),
      interactions: dbStore.getInteractions(),
      proof_of_care: dbStore.getProofOfCare(),
      assistant_messages: dbStore.getAllAssistantMessages()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/consents', async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = dbStore.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const consentType = type || 'lgpd_consent';
    const timestamp = new Date().toISOString();
    const rawString = user.did + consentType + timestamp;
    const hash = generateSHA256(rawString);

    const payload = {
      type: consentType,
      did: user.did,
      hash: hash,
      timestamp: timestamp
    };

    let transactionId = '';
    let status: 'synced' | 'pending' = 'synced';
    let errorMessage = '';

    try {
      if (req.body.simulateError) {
        throw new Error('Simulated Solana network interruption.');
      }
      transactionId = await sendToSolanaMemoProgram(payload);
    } catch (solanaError: any) {
      status = 'pending';
      transactionId = `pending_sync_${crypto.randomBytes(8).toString('hex')}`;
      errorMessage = 'Registro blockchain temporariamente indisponível. Seu consentimento foi salvo com segurança.';
    }

    const consentRecord = dbStore.addConsent({
      userId,
      hash,
      transactionId,
      createdAt: timestamp,
      status
    });

    res.json({
      success: true,
      consent: consentRecord,
      payload,
      message: errorMessage || 'Consentimento registrado on-chain com sucesso na Solana Devnet!'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', (req, res) => {
  try {
    const posts = dbStore.getPosts();
    const enriched = posts.map(post => {
      const userObj = dbStore.getUser(post.userId);
      return {
        ...post,
        authorPseudonym: userObj?.pseudonym || undefined
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { userId, content, simulateError } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' });
    }

    if (containsProfanity(content)) {
      return res.status(400).json({ error: 'Sua publicação contém palavras inadequadas ou ofensivas.' });
    }

    const user = dbStore.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const post = dbStore.addPost({
      id: crypto.randomUUID(),
      userId,
      authorDid: user.did,
      content,
      createdAt: new Date().toISOString()
    });

    const userPosts = dbStore.getPosts().filter(p => p.userId === userId);
    let narratoraBadge = null;

    if (userPosts.length === 1) {
      const timestamp = new Date().toISOString();
      const rawPayload = {
        type: 'proof_of_care',
        did: user.did,
        badge: 'narradora',
        timestamp: timestamp
      };

      let solanaTx = '';
      let status: 'synced' | 'pending' = 'synced';

      try {
        if (simulateError) {
          throw new Error('Simulated Solana Narrator proof failure.');
        }
        solanaTx = await sendToSolanaMemoProgram(rawPayload);
      } catch (solanaError: any) {
        status = 'pending';
        solanaTx = `pending_poc_${crypto.randomBytes(8).toString('hex')}`;
      }

      narratoraBadge = dbStore.addProofOfCare({
        id: crypto.randomUUID(),
        userId,
        badge: 'narradora',
        solanaTx,
        createdAt: timestamp,
        status
      });
    }

    res.json({ 
      post: {
        ...post,
        authorPseudonym: user.pseudonym || undefined
      }, 
      narratoraBadge 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/interactions', async (req, res) => {
  try {
    const { postId, senderId, message, bypassAgeCheck } = req.body;
    if (!postId || !senderId || !message) {
      return res.status(400).json({ error: 'postId, senderId and message are required' });
    }

    if (containsProfanity(message)) {
      return res.status(400).json({ error: 'A sua mensagem contém termos inadequados.' });
    }

    const sender = dbStore.getUser(senderId);
    if (!sender) {
      return res.status(404).json({ error: 'Sender user not found' });
    }

    const posts = dbStore.getPosts();
    const post = posts.find((p) => p.id === postId);
    const receiverId = post ? post.userId : '';

    let aiContext = 'Interações acolhedoras fortalecem redes de apoio emocional.';
    try {
      if (process.env.GROQ_API_KEY) {
        const response = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: `Analise brevemente o texto de apoio enviado: "${message}". Gere um parágrafo acolhedor, empático e curto (máximo de 150 caracteres). Responda apenas com a análise direta, sem aspas.`
            }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
        });

        if (response.choices[0]?.message?.content) {
          aiContext = response.choices[0].message.content.trim();
        }
      }
    } catch (aiError: any) {
      console.error('Groq call failed during interaction analyzing:', aiError.message);
    }

    const now = new Date();
    const createdTime = new Date(sender.createdAt);
    const diffMinutes = (now.getTime() - createdTime.getTime()) / (1000 * 60);
    const isAccountOldEnough = diffMinutes >= 10 || bypassAgeCheck === true;

    const hasEnoughCharacters = message.trim().length > 15;
    const hasNoRemovedPosts = true; 

    const userBadges = dbStore.getProofOfCareForUser(senderId);
    const hasNoRecentAcolhedoraBadge = !userBadges.some((b) => {
      if (b.badge !== 'acolhedora') return false;
      const badgeTime = new Date(b.createdAt);
      const diffHours = (now.getTime() - badgeTime.getTime()) / (1000 * 60 * 60);
      return diffHours < 24;
    });

    const isPoCEligible = isAccountOldEnough && hasEnoughCharacters && hasNoRemovedPosts && hasNoRecentAcolhedoraBadge;

    const userInteractions = dbStore.getInteractions().filter((i) => i.senderId === senderId);
    const uniqueReceiversSupported = new Set(userInteractions.map((i) => i.receiverId));
    const hasEpaticaBadge = userBadges.some((b) => b.badge === 'empatica');
    const shouldAwardEpatica = !hasEpaticaBadge && uniqueReceiversSupported.size >= 3;

    let proofOfCarePayload = null;
    let empaticaBadgePayload = null;

    if (isPoCEligible) {
      const timestamp = new Date().toISOString();
      const rawPayload = {
        type: 'proof_of_care',
        did: sender.did,
        badge: 'acolhedora',
        timestamp: timestamp
      };

      let solanaTx = '';
      let status: 'synced' | 'pending' = 'synced';

      try {
        if (req.body.simulateError) {
          throw new Error('Simulated Solana Proof of Care failure.');
        }
        solanaTx = await sendToSolanaMemoProgram(rawPayload);
      } catch (solanaError: any) {
        status = 'pending';
        solanaTx = `pending_poc_${crypto.randomBytes(8).toString('hex')}`;
      }

      dbStore.addProofOfCare({
        id: crypto.randomUUID(),
        userId: senderId,
        badge: 'acolhedora',
        solanaTx,
        createdAt: timestamp,
        status
      });

      proofOfCarePayload = {
        issued: true,
        badge: 'acolhedora' as const,
        solanaTx
      };
    }

    if (shouldAwardEpatica) {
      const timestamp = new Date().toISOString();
      const rawPayload = {
        type: 'proof_of_care',
        did: sender.did,
        badge: 'empatica',
        timestamp: timestamp
      };

      let solanaTx = '';
      let status: 'synced' | 'pending' = 'synced';

      try {
        if (req.body.simulateError) {
          throw new Error('Simulated Solana Empática badge failure.');
        }
        solanaTx = await sendToSolanaMemoProgram(rawPayload);
      } catch (solanaError: any) {
        status = 'pending';
        solanaTx = `pending_poc_${crypto.randomBytes(8).toString('hex')}`;
      }

      dbStore.addProofOfCare({
        id: crypto.randomUUID(),
        userId: senderId,
        badge: 'empatica',
        solanaTx,
        createdAt: timestamp,
        status
      });

      empaticaBadgePayload = {
        issued: true,
        badge: 'empatica' as const,
        solanaTx
      };
    }

    const interactionObj = dbStore.addInteraction({
      id: crypto.randomUUID(),
      postId,
      senderId,
      senderDid: sender.did,
      receiverId,
      message,
      createdAt: new Date().toISOString(),
      ai_context: aiContext,
      proof_of_care: proofOfCarePayload
    });

    res.json({
      interactionId: interactionObj.id,
      saved: true,
      ai_context: aiContext,
      proof_of_care: proofOfCarePayload,
      empatica_badge: empaticaBadgePayload,
      rulesValidated: {
        accountAgeMinutes: Math.round(diffMinutes * 10) / 10,
        accountAgeValid: isAccountOldEnough,
        characterLength: message.trim().length,
        characterLengthValid: hasEnoughCharacters,
        noRemovedPosts: hasNoRemovedPosts,
        noRecentBadge: hasNoRecentAcolhedoraBadge,
        fullyEligible: isPoCEligible,
        empaticaEligible: shouldAwardEpatica,
        uniqueReceiversSupported: uniqueReceiversSupported.size
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assistant', async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    dbStore.addAssistantMessage({
      id: crypto.randomUUID(),
      userId,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString()
    });

    const history = dbStore.getAssistantMessagesForUser(userId);
    const lastConversations = history.slice(-4);

    const systemInstruction = `Você é uma assistente acolhedora de suporte emocional da plataforma Conexão Piana, o seu nome é Piana.
Seu papel exclusivo é acolher emocionalmente mães de crianças atípicas (como autismo, TDAH, síndromes raras, etc.) em sua jornada solitária e cansativa.

Regras de Conduta e Ética:
1. NUNCA realize diagnósticos clínicos, médicos ou psicológicos de qualquer condição.
2. NUNCA substitua de forma alguma o acompanhamento de profissionais de saúde, médicos ou psicólogos acadêmicos.
3. SEMPRE incentive o apoio humano comunitário e o acompanhamento profissional quando necessário.
4. Responda em português de maneira gentil, amigável, pacífica e sem jargões frios ou científicos. Escreva respostas curtas, focadas em empatia e palavras de acolhimento mútuo.

PROTOCOL DE CRISE EMOCIONAL:
Se detectar qualquer indício de sofrimento emocional intenso, desespero agudo ou ideação de autolesão/morte:
- Responda de forma extremamente acolhedora, sensível e sem julgamentos.
- Recomende enfaticamente ajuda profissional especializada.
- Ofereça explicitamente o canal de atendimento e contato do CVV (Centro de Valorização da Vida - Telefone 188).`;

    let aiReply = "Sinto muito por estar se sentindo assim. Lembre-se de que você é uma mãe incrível e não está sozinha. Como rede de apoio, estamos aqui para te escutar.";

    try {
      if (process.env.GROQ_API_KEY) {
        const messages: any[] = [
          { role: 'system', content: systemInstruction },
          ...lastConversations.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ];

        const response = await groq.chat.completions.create({
          messages: messages,
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
        });

        if (response.choices[0]?.message?.content) {
          aiReply = response.choices[0].message.content.trim();
        }
      }
    } catch (aiError: any) {
      console.error('Groq call failed during assistant chat:', aiError.message);
    }

    const assistantMessage = dbStore.addAssistantMessage({
      id: crypto.randomUUID(),
      userId,
      role: 'assistant',
      content: aiReply,
      createdAt: new Date().toISOString()
    });

    const allUserMessages = dbStore.getAssistantMessagesForUser(userId);
    let pioneiraBadge = null;

    if (allUserMessages.length === 2) {
      const user = dbStore.getUser(userId);
      if (user) {
        const timestamp = new Date().toISOString();
        const rawPayload = {
          type: 'proof_of_care',
          did: user.did,
          badge: 'pioneira',
          timestamp: timestamp
        };

        let solanaTx = '';
        let status: 'synced' | 'pending' = 'synced';

        try {
          if (req.body.simulateError) {
            throw new Error('Simulated Solana Pioneira badge failure.');
          }
          solanaTx = await sendToSolanaMemoProgram(rawPayload);
        } catch (solanaError: any) {
          status = 'pending';
          solanaTx = `pending_poc_${crypto.randomBytes(8).toString('hex')}`;
        }

        pioneiraBadge = dbStore.addProofOfCare({
          id: crypto.randomUUID(),
          userId,
          badge: 'pioneira',
          solanaTx,
          createdAt: timestamp,
          status
        });
      }
    }

    res.json({
      ...assistantMessage,
      pioneira_badge: pioneiraBadge
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assistant/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = dbStore.getAssistantMessagesForUser(userId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:postId/interactions', (req, res) => {
  try {
    const { postId } = req.params;
    const interactions = dbStore.getInteractionsForPost(postId);
    const enriched = interactions.map(interaction => {
      const userObj = dbStore.getUser(interaction.senderId);
      return {
        ...interaction,
        senderPseudonym: userObj?.pseudonym || undefined
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proofs/validate-on-chain', async (req, res) => {
  try {
    const { userId, simulateError } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = dbStore.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userBadges = dbStore.getProofOfCareForUser(userId);
    const hasGuardiaBadge = userBadges.some((b) => b.badge === 'guardia');

    if (hasGuardiaBadge) {
      return res.json({ success: false, message: 'Você já possui a medalha Guardiã da Transparência', badge: null });
    }

    const userConsents = dbStore.getConsentsForUser(userId);
    if (userConsents.length === 0) {
      return res.json({ success: false, message: 'Nenhum consentimento para validar', badge: null });
    }

    const timestamp = new Date().toISOString();
    const rawPayload = {
      type: 'proof_of_care',
      did: user.did,
      badge: 'guardia',
      timestamp: timestamp
    };

    let solanaTx = '';
    let status: 'synced' | 'pending' = 'synced';

    try {
      if (simulateError) {
        throw new Error('Simulated Solana Guardia badge failure.');
      }
      solanaTx = await sendToSolanaMemoProgram(rawPayload);
    } catch (solanaError: any) {
      status = 'pending';
      solanaTx = `pending_poc_${crypto.randomBytes(8).toString('hex')}`;
    }

    const guardiaBadge = dbStore.addProofOfCare({
      id: crypto.randomUUID(),
      userId,
      badge: 'guardia',
      solanaTx,
      createdAt: timestamp,
      status
    });

    res.json({
      success: true,
      message: 'Medalha Guardiã da Transparência concedida com sucesso!',
      badge: guardiaBadge,
      validatedSignatures: userConsents.length
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
async function startServer() {
  app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT} 🚀`);
  });
}

startServer();