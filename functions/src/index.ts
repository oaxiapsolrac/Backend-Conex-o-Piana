import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
// Permite que o seu frontend comunique com esta API sem bloqueios
app.use(cors({ origin: true })); 
app.use(express.json());

// =========================================================================
// ⬇️ COPIE E COLE AQUI TODAS AS ROTAS DO SEU server.ts ANTIGO ⬇️
// (Ex: app.post('/api/consent', ...), app.post('/api/chat', ...), etc.)
// =========================================================================



// =========================================================================
// ⚠️ ATENÇÃO: NÃO copie a linha "app.listen(3000, ...)" do seu server.ts antigo!
// A última linha deste ficheiro DEVE ser obrigatoriamente a linha abaixo:
// =========================================================================
export const api = functions.https.onRequest(app);