# Assist AI

An intelligent multi-agent customer support system built with AI-powered routing and specialized agents for handling orders, billing, and general support queries.

## 🚀 Features

- **Intelligent Routing**: AI-powered router automatically classifies user intent and routes queries to specialized agents
- **Multi-Agent System**: Three specialized agents:
  - **Support Agent**: General customer support, FAQs, and account assistance
  - **Order Agent**: Order management (create, status, cancel, return)
  - **Billing Agent**: Payment processing, refunds, and billing inquiries
- **Real-time Streaming**: Server-Sent Events (SSE) for real-time response streaming
- **Conversation Persistence**: All chats are stored in PostgreSQL with full history
- **Modern UI**: Beautiful React-based chat interface with dark/light theme support
- **Tool-based Actions**: Agents can execute real actions (create orders, process payments, etc.)

## 🏗️ Architecture

This is a monorepo built with Turborepo and pnpm workspaces, containing:

- **API Backend** (`apps/api`): Hono-based REST API with AI agents
- **Chat Frontend** (`apps/chat`): React + Vite chat interface
- **Shared Packages**: Reusable UI components, TypeScript configs, and ESLint configs

### Agent Flow

1. User sends a message → Frontend streams to API
2. Router Agent classifies intent (SUPPORT/ORDER/BILLING)
3. Appropriate specialized agent handles the query
4. Agent can use tools to perform actions (database operations)
5. Response streams back to user in real-time

## 🛠️ Tech Stack

### Backend
- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) with OpenAI GPT-4o-mini
- **Runtime**: Node.js with TypeScript

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with dark mode)
- **HTTP Client**: Axios
- **Markdown**: React Markdown for message rendering

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Type Safety**: TypeScript throughout

## 📋 Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9.0.0
- **PostgreSQL** database
- **AI Gateway API Key**

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assist-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` file in `apps/api/`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/assist_ai"
   AI_GATEWAY_API_KEY="your-ai-gateway-api-key"
   ```

   Create `.env.local` file in `apps/chat/` (optional, defaults to `http://localhost:4000`):
   ```env
   VITE_API_URL="http://localhost:4000"
   ```

4. **Set up the database**
   ```bash
   cd apps/api
   pnpm prisma:generate
   pnpm prisma:migrate
   pnpm seed  # Optional: seed with sample data
   ```

## 🚦 Running the Project

### Development Mode

Run both API and frontend in development mode:

```bash
# From root directory
pnpm dev
```

Or run individually:

```bash
# API only (runs on http://localhost:4000)
pnpm --filter api dev

# Frontend only (runs on http://localhost:5173)
pnpm --filter chat dev
```

### Production Build

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm --filter api build
pnpm --filter chat build
```

### Start Production Server

```bash
# API
cd apps/api
pnpm start

# Frontend (after build)
cd apps/chat
pnpm preview
```

## 📁 Project Structure

```
assist-ai/
├── apps/
│   ├── api/                    # Backend API server
│   │   ├── src/
│   │   │   ├── agents/         # AI agents (router, support, order, billing)
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   ├── tools/          # Agent tools (functions agents can call)
│   │   │   ├── middleware/     # Rate limiting, etc.
│   │   │   └── config/         # Database configuration
│   │   ├── prisma/             # Database schema and migrations
│   │   └── package.json
│   │
│   └── chat/                   # Frontend chat application
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── services/       # API clients and SSE streaming
│       │   └── config/         # Frontend configuration
│       └── package.json
│   
│
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── typescript-config/      # Shared TypeScript configs
│   └── eslint-config/          # Shared ESLint configs
│
├── package.json                # Root package.json
├── turbo.json                  # Turborepo configuration
└── pnpm-workspace.yaml         # pnpm workspace configuration
```

## 🔌 API Endpoints

### Chat

- `POST /api/chat/messages` - Send a message and get streaming response
  ```json
  {
    "message": "Check my order status",
    "name": "John Doe",
    "id": "chat-id" // optional, omit for new chat
  }
  ```

- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/conversations/:id` - Get specific conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Agents

- `GET /api/agents` - List all available agents and their capabilities
- `GET /api/agents/:type/capabilities` - Get capabilities for specific agent type

### Health

- `GET /health` - Health check endpoint

## 🗄️ Database Schema

The system uses PostgreSQL with the following main models:

- **Chat**: Conversation sessions
- **Message**: Individual messages (USER/AGENT roles)
- **Order**: Order management with status tracking
- **Payment**: Payment records linked to orders
- **AgentAction**: Logs of agent tool executions

View the full schema in `apps/api/prisma/schema.prisma`.

### Database Management

```bash
cd apps/api

# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Seed database
pnpm seed
```

## 🧪 Development

### Adding a New Agent

1. Create agent file in `apps/api/src/agents/`
2. Create tools in `apps/api/src/tools/`
3. Add agent to router in `apps/api/src/controllers/chat.ts`
4. Update `apps/api/src/routes/agents.ts` with capabilities

### Adding a New Tool

1. Define tool in appropriate `apps/api/src/tools/*.ts` file
2. Add tool to agent's tools array
3. Implement service function in `apps/api/src/services/`

## 📝 Environment Variables

### API (`apps/api/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AI_GATEWAY_API_KEY` | AI Gateway API key for AI models | Yes |

### Frontend (`apps/chat/.env.local`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | `http://localhost:4000` |

