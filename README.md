# Backend - Divisão de Contas

API backend para aplicação de divisão de contas entre amigos usando NestJS, MongoDB, Clean Architecture e JWT (API REST).

## Pré-requisitos

- Node.js **24** (definido em `.nvmrc`, `.node-version` e `package.json` → `engines`)
- MongoDB (local ou remoto)
- npm ou yarn

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente. Copie o arquivo `.env.example` para `.env` e ajuste os valores:
```bash
cp .env.example .env
```

3. Certifique-se de que o MongoDB está rodando. Se estiver usando MongoDB local:
```bash
# Windows (se instalado como serviço, já deve estar rodando)
# Linux/Mac
mongod
```

## Executando a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`
A documentação Swagger estará disponível em `http://localhost:3000/docs`

## Estrutura do Projeto

```
src/
├── domain/           # Entidades e regras de negócio
├── application/      # Casos de uso (services)
├── infrastructure/   # Implementações técnicas
└── presentation/     # Controllers, DTOs, guards
```

## Variáveis de Ambiente

- `MONGODB_URI` - URI de conexão do MongoDB (padrão: mongodb://localhost:27017/finances)
- `JWT_SECRET` - Chave secreta para JWT
- `SMTP_HOST` - Host do servidor SMTP para envio de emails
- `SMTP_PORT` - Porta do servidor SMTP
- `SMTP_USER` - Usuário do SMTP
- `SMTP_PASS` - Senha do SMTP
- `PORT` - Porta do servidor (padrão: 3000)

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `POST /auth/verify-email` - Verificar email com código
- `POST /auth/resend-verification-code` - Reenviar código de verificação

### Contas (Bills)
- `POST /bills` - Criar nova conta
- `POST /bills/join` - Entrar na conta via código
- `GET /bills/:billId` - Obter detalhes da conta
- `POST /bills/:billId/items` - Adicionar item
- `DELETE /bills/:billId/items/:itemId` - Remover item
- `POST /bills/:billId/consumptions` - Adicionar consumo
- `PUT /bills/:billId/consumptions` - Atualizar consumo
- `DELETE /bills/:billId/consumptions` - Remover consumo
- `POST /bills/:billId/participants` - Adicionar participante visitante
- `DELETE /bills/:billId/participants/:participantId` - Remover participante

## Documentação

Acesse `http://localhost:3000/docs` para ver a documentação completa da API no Swagger.
