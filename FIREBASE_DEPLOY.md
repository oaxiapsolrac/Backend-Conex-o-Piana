# Guia de Deploy no Firebase - Conexão Piana 🚀

Este guia detalha como preparar e hospedar a aplicação full-stack **Conexão Piana** (Express + Vite + React) no ecossistema Firebase e Google Cloud.

Como o projeto possui uma infraestrutura híbrida (frontend em React com rotas dinâmicas e backend em Express com integrações Solana e IA Groq), a melhor abordagem de arquitetura é o **Firebase Hosting integrado ao Google Cloud Run**. Isso permite que seus arquivos estáticos (CSS, JS, Imagens) sejam servidos instantaneamente via CDN global do Firebase, enquanto todas as chamadas de API (`/api/*`) são processadas pelo seu servidor Node/Express em Cloud Run.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina local:
1. **Node.js** (versão 18 ou superior).
2. **Firebase CLI** instalado globalmente:
   ```bash
   npm install -g firebase-tools
   ```
3. **Google Cloud SDK** (opcional, para deploys diretos de container): [Instalar gcloud CLI](https://cloud.google.com/sdk/docs/install)
4. Uma conta ativa no **[Firebase Console](https://console.firebase.google.com/)** com um projeto criado e o plano **Blaze (Pay-As-You-Go)** ativado (necessário para integrações e Cloud Run).

---

## 🛠️ Arquivos Configuradores Criados

Preparamos a estrutura do seu projeto com os seguintes arquivos cruciais de deploy:
1. **`firebase.json`**: Configura o Firebase Hosting, definindo que arquivos estáticos em `dist` sejam servidos diretamente e rotas que comecem com `/api/**` sejam encaminhadas de forma transparente para o back-end hospedado no Cloud Run.
2. **`.firebaserc`**: Mapeia o projeto padrão do Firebase para deploy fácil.
3. **`Dockerfile`**: Executa uma compilação de múltiplos estágios (multi-stage build) hiper-otimizada. Ele compila o frontend e agrupa o servidor Express em um único arquivo leve de produção (`dist/server.cjs`), instalando apenas as dependências necessárias para reduzir custos e acelerar a inicialização.

---

## 🚀 Método Recomendado: Firebase Hosting + Cloud Run (Full-Stack)

Siga os passos abaixo no terminal do seu projeto local para realizar o deploy:

### Passo 1: Autenticar no Firebase e Google Cloud
No terminal, faça login em suas contas:
```bash
firebase login
gcloud auth login
```

### Passo 2: Associar ao seu Projeto Firebase
Abra o arquivo `.firebaserc` e substitua `"INSIRA-O-ID-DO-SEU-PROJETO-AQUI"` com o ID real do seu projeto Firebase (por exemplo: `conexao-piana-12345`).

Se preferir, utilize o comando para escolher interativamente:
```bash
firebase use --add
```

### Passo 3: Deploy do Backend no Cloud Run
Compile e suba a imagem docker da sua aplicação diretamente para o Google Artifact Registry/Cloud Run executando:
```bash
gcloud run deploy conexao-piana \
  --source . \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --port 3000
```
*Guarde a URL gerada pelo Cloud Run ao fim do processo (ex: `https://conexao-piana-xxxx-ue.a.run.app`).*

### Passo 4: Configurar as Variáveis de Ambiente no Cloud Run
Para que sua blockchain Solana e inteligência artificial funcionem em produção, configure as variáveis de ambiente necessárias no painel do Cloud Run ou via terminal:
```bash
gcloud run services update conexao-piana \
  --set-env-vars="SOLANA_PRIVATE_KEY=seu_valor_aqui,SOLANA_NETWORK=devnet,GROQ_API_KEY=sua_chave_groq_aqui" \
  --region us-east1
```

### Passo 5: Atualizar o arquivo `firebase.json` (se necessário)
Verifique se a região no arquivo `firebase.json` bate com a região que você escolheu no deploy do Cloud Run (neste exemplo, usamos `us-east1`, mude no arquivo de `us-central1` se preferir). O serviceId deve ser `conexao-piana`.

### Passo 6: Compilação Local e Deploy do Frontend
Antes de enviar os arquivos estáticos para o CDN do Firebase, precisamos compilar os arquivos locais:
```bash
npm run build
```
Agora, envie a configuração do Hosting e a pasta estática `dist/` para o Firebase:
```bash
firebase deploy --only hosting
```

A partir deste momento, o Firebase fornecerá um domínio gratuito seguro `https://seu-projeto.web.app` contendo seu front-end integrado perfeitamente ao seu back-end de alta performance rodando no Cloud Run!

---

## 🌐 Opção Alternativa 1: Firebase App Hosting (Mais Novo)

Se você não quer gerenciar Dockerfiles ou Cloud Run, o Firebase lançou o **Firebase App Hosting**, que detecta automaticamente aplicações baseadas em Vite/Express e gerencia o deploy completo integrado ao seu repositório GitHub.

1. Acesse o **[Firebase Console](https://console.firebase.google.com/)**.
2. Vá para **App Hosting** no menu lateral esquerdo e clique em **Começar**.
3. Conecte seu repositório GitHub à plataforma.
4. Escolha o branch principal de deploy (ex: `main`).
5. O Firebase App Hosting lerá as configurações de build do `package.json` e fará o deploy automático a cada novo commit.

---

## 💻 Desenvolvimento Local

Para rodar todo o ambiente localmente simulando exatamente as rotas de produção, você pode usar:
```bash
npm install
npm run dev
```
Isso iniciará o servidor usando `tsx` em desenvolvimento rápido com suporte automático ao hot reload do frontend e do servidor Express.
