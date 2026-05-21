Conexão Piana

Tecnologia que acolhe. Comunidade que transforma.

A Conexão Piana é uma plataforma social Web3 criada para oferecer acolhimento emocional, apoio comunitário e confiança digital para mães de crianças atípicas.

O projeto nasce da necessidade de construir um ambiente seguro, humano e não tóxico, onde mães possam compartilhar experiências, receber apoio e encontrar pertencimento sem pressão social, competição ou exploração emocional.

Diferente das redes sociais tradicionais, a Conexão Piana utiliza blockchain como infraestrutura ética de confiança — e não como ferramenta especulativa.

⸻

Propósito

A Conexão Piana foi criada para combater:

* isolamento emocional;
* sobrecarga materna;
* desinformação;
* insegurança digital;
* relações tóxicas em ambientes online.

A plataforma prioriza:

* acolhimento;
* segurança emocional;
* empatia;
* pertencimento;
* confiança verificável.

⸻

Diferencial do Projeto

A Conexão Piana utiliza tecnologia Web3 de maneira invisível e humanizada.

A blockchain é usada para:

* registro auditável de consentimento LGPD;
* reputação comunitária verificável;
* transparência;
* confiança digital.

A blockchain NÃO é utilizada para:

* especulação;
* NFTs comerciais;
* marketplace;
* tokens financeiros;
* economia da atenção.

⸻

Filosofia do Produto

A plataforma foi desenhada com uma proposta antifinanceira e anti-toxicidade.

Por isso, NÃO existem:

* curtidas;
* rankings;
* seguidores;
* métricas de popularidade;
* algoritmos de viralização.

O foco da plataforma é o cuidado humano.

⸻

Público-Alvo

A Conexão Piana é voltada principalmente para:

* mães de crianças autistas;
* mães de crianças neurodivergentes;
* mães em situação de sobrecarga emocional;
* mulheres que buscam apoio comunitário seguro.

⸻

Tecnologias Utilizadas

Frontend

* React.js
* Tailwind CSS
* PWA

Backend

* Firebase
* Arquitetura Serverless

Banco de Dados

* Firebase Firestore

Blockchain

* Solana
* Solana Memo Program

Inteligência Artificial

* Groq API
* Prompt Engineering supervisionado

⸻

Funcionalidades do MVP

Cadastro Simplificado

* onboarding acolhedor;
* autenticação simplificada;
* geração automática de DID pseudônimo.

⸻

Consentimento LGPD Auditável

A plataforma registra consentimentos de forma auditável utilizando blockchain.

⸻

Feed Comunitário

Um ambiente social sem competição emocional.

⸻

Assistente de Acolhimento

IA responsável voltada para:

* acolhimento;
* orientação;
* suporte contextual.

⸻

Proof of Care

Sistema de reputação positiva baseado em interações acolhedoras e verificáveis.

⸻

Experiência Web3 Invisível

A usuária NÃO precisa:

* instalar wallet;
* entender blockchain;
* utilizar criptomoedas;
* gerenciar chaves privadas.

Toda complexidade técnica é abstraída pela plataforma.

⸻

Objetivos de Desenvolvimento Sustentável (ODS)

O projeto se conecta aos seguintes ODS da ONU:

* ODS 3 — Saúde e Bem-Estar
* ODS 5 — Igualdade de Gênero
* ODS 10 — Redução das Desigualdades

⸻

Visão

Acreditamos que tecnologia deve servir pessoas — especialmente em momentos de vulnerabilidade emocional.

A Conexão Piana propõe uma nova forma de construir redes sociais:

* mais humanas;
* mais seguras;
* mais responsáveis;
* mais acolhedoras.

⸻

HackaNation 2026

Projeto desenvolvido para o HackaNation 2026, hackathon oficial do , com foco em:

* blockchain;
* impacto social;
* inteligência artificial;
* tecnologias abertas.

⸻

Conexão Piana
🚀 Como testar a Conexão Piana localmente
Pré-requisitos:
Ter o Node.js instalado no computador.
Ter uma conta no Google AI Studio (para a chave do Gemini).
Ter uma carteira Phantom configurada para a rede Devnet (para gerar uma chave Solana de teste).
Passo 1: Clonar o repositório
Abra o terminal e faça o download do código do GitHub:
Bash

git clone https://github.com/SEU_USUARIO/Conex-o-Piana-Web3.git
cd Conex-o-Piana-Web3

Passo 2: Instalar as dependências
Dentro da pasta do projeto, instale todas as bibliotecas necessárias (React, Express, Solana Web3, etc):
Bash

npm install

Passo 3: Configurar as Variáveis de Ambiente (O Mais Importante!)
Como os dados sensíveis não vão para o GitHub, você precisa de criar o seu próprio ficheiro de configuração.
Na raiz do projeto, crie um ficheiro chamado exatamente .env (com o ponto no início).
Cole o seguinte código lá dentro e preencha com as suas próprias chaves:
Snippet de código

# 1. Crie uma nova conta na sua Phantom Wallet, vá às configurações de segurança,
# exporte a "Chave Privada" (Private Key) e cole aqui dentro das aspas.
# Pode ser no formato texto (Base58) ou um Array de números [1,2,3...].
SOLANA_PRIVATE_KEY="COLE_AQUI_A_SUA_CHAVE_PRIVADA_DE_TESTE"

# 2. A URL da rede de testes da Solana (pode manter esta)
SOLANA_RPC_URL="https://api.devnet.solana.com"

# 3. Gere uma chave gratuita em: https://aistudio.google.com/
GEMINI_API_KEY="COLE_AQUI_A_SUA_CHAVE_DO_GEMINI"

# 4. A URL local do seu servidor
APP_URL="http://localhost:3000"


Nota: Certifique-se de que a carteira Solana que está a usar tem saldo na Devnet. Pode pedir "SOL de mentira" gratuitamente num Faucet da Solana (ex: faucet.solana.com).

Passo 4: Iniciar o Servidor

Com o ficheiro .env configurado, inicie a aplicação:
Bash

npm run dev

Passo 5: Testar a Aplicação

Abra o seu navegador e aceda a: http://localhost:3000
Para testar a Web3: Vá à aba "Transparência Web3", clique em "Apoiar" num post e aguarde. Se o ambiente estiver correto, o status mudará para "Sincronizado" e aparecerá um Hash de transação válido na rede Solana Devnet!
