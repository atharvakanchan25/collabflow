# CollabHub

A real-time team chat app — think Slack, but built from scratch. You get workspaces, channels, direct messages, threads, emoji reactions, file uploads, and live presence indicators. Everything updates in real time without refreshing the page.

---

## What it looks like

When you open the app you land on a login screen. After signing in you see a three-column layout — a narrow workspace switcher on the far left, a sidebar with channels and DMs in the middle, and the chat area taking up the rest of the screen. Clicking a channel loads its messages. Hovering a message shows action buttons to react, reply in a thread, edit, or delete. The thread panel slides in from the right. Typing indicators appear at the bottom of the input when someone else is typing. Online/away/DND/offline status dots show up next to avatars.

---

## Tech stack

**Backend**
- Java 21 + Spring Boot 3.2
- PostgreSQL — main database, all data lives here
- Flyway — handles database migrations automatically on startup
- Redis — session storage and caching
- Kafka + Zookeeper — message broker, decouples sending a message from broadcasting it to connected clients
- MinIO — S3-compatible object storage for file uploads
- Spring WebSocket + STOMP — the real-time layer
- JWT (access token 24h + refresh token 7d) — auth
- Lombok — cuts down boilerplate in Java

**Frontend**
- React 19 + TypeScript
- Vite — dev server and bundler
- Tailwind CSS v4 — styling
- Zustand — global state (auth, workspaces, channels, messages, presence)
- @stomp/stompjs + SockJS — WebSocket client
- Axios — HTTP client with automatic token refresh on 401
- React Router v7 — routing
- date-fns — timestamp formatting
- lucide-react — icons

**Infrastructure**
- Docker Compose — spins up Postgres, Redis, Kafka, Zookeeper, and MinIO with one command

---

## Project structure

```
collabhub/
├── backend/
│   └── src/main/java/com/collabhub/
│       ├── config/          # Security, WebSocket, Kafka, Redis, MinIO config
│       ├── controller/      # REST endpoints
│       ├── service/         # Business logic
│       ├── model/
│       │   ├── entity/      # JPA entities
│       │   ├── dto/         # Request/response objects
│       │   └── event/       # Kafka event payloads
│       ├── repository/      # Spring Data JPA repos
│       ├── security/        # JWT filter, token provider
│       └── websocket/       # Kafka consumer → WebSocket broadcaster
├── frontend/
│   └── src/
│       ├── pages/           # LoginPage, RegisterPage, MainLayout, NotFoundPage
│       ├── components/
│       │   ├── chat/        # ChatArea, MessageBubble, MessageInput, ThreadPanel
│       │   ├── layout/      # Sidebar, WorkspaceSwitcher
│       │   ├── modals/      # CreateChannel, CreateWorkspace, OpenDm
│       │   └── ui/          # Button, Input, Modal, Avatar, Notifications, UserProfile
│       ├── store/           # authStore, chatStore (Zustand)
│       ├── hooks/           # useWebSocket
│       ├── api.ts           # All API calls in one place
│       └── types.ts         # Shared TypeScript types
└── docker-compose.yml
```

---

## Database schema

Nine tables total:

- `users` — accounts with username, email, hashed password, avatar, status
- `workspaces` — top-level organizations with a unique slug
- `workspace_members` — who belongs to which workspace and their role
- `channels` — public or private channels inside a workspace
- `channel_members` — who's in which channel
- `conversations` — DM sessions between two users inside a workspace
- `conversation_participants` — the two users in a DM
- `messages` — unified table for both channel messages and DMs, supports threads via `parent_id`
- `attachments` — files attached to messages, stored in MinIO
- `reactions` — emoji reactions on messages, one per user per emoji per message
- `notifications` — in-app notifications with a JSONB payload

Full-text search index on message content using PostgreSQL's `gin` + `tsvector`.

---

## How messages flow

1. User types a message and hits Enter
2. Frontend POSTs to `/api/channels/{id}/messages`
3. Backend saves it to Postgres, then publishes a `MessageEvent` to a Kafka topic
4. A Kafka consumer picks it up and broadcasts it over WebSocket to `/topic/channels/{id}`
5. Every client subscribed to that topic receives it and appends it to the UI instantly

This means the HTTP request returns fast and the fan-out to all connected clients happens asynchronously through Kafka.

---

## Running it locally

You need Docker Desktop, Java 21, Maven, and Node 18+ installed.

**Step 1 — start the infrastructure**

```bash
docker-compose up -d
```

This starts Postgres on 5432, Redis on 6379, Kafka on 9092, and MinIO on 9000. Wait about 15 seconds for everything to be healthy.

**Step 2 — start the backend**

```bash
cd backend
mvn spring-boot:run
```

Flyway runs the migration automatically and creates all the tables. The API is available at `http://localhost:8080`. You'll see `Started CollabHubApplication` in the logs when it's ready.

**Step 3 — start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` and `/ws` to the backend so you don't have to deal with CORS.

---

## Environment variables

The backend reads these from environment variables with sensible defaults for local dev. In production you'd override them:

| Variable | Default | What it is |
|---|---|---|
| `DB_HOST` | localhost | Postgres host |
| `DB_PORT` | 5432 | Postgres port |
| `DB_NAME` | collabhub | Database name |
| `DB_USER` | collabhub | Database user |
| `DB_PASS` | collabhub | Database password |
| `REDIS_HOST` | localhost | Redis host |
| `KAFKA_BROKERS` | localhost:9092 | Kafka bootstrap servers |
| `MINIO_ENDPOINT` | http://localhost:9000 | MinIO URL |
| `MINIO_ACCESS_KEY` | minioadmin | MinIO access key |
| `MINIO_SECRET_KEY` | minioadmin | MinIO secret key |
| `JWT_SECRET` | change-this-secret-in-production-min-256-bits | JWT signing key |

---

## API overview

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/users/me` | Get your own profile |
| PATCH | `/api/users/me` | Update display name / avatar |
| GET | `/api/workspaces` | List your workspaces |
| POST | `/api/workspaces` | Create a workspace |
| GET | `/api/workspaces/{id}/channels` | List channels in a workspace |
| POST | `/api/workspaces/{id}/channels` | Create a channel |
| POST | `/api/workspaces/{id}/members/{userId}` | Invite someone to a workspace |
| GET | `/api/channels/{id}/messages` | Paginated message history |
| POST | `/api/channels/{id}/messages` | Send a message |
| PATCH | `/api/messages/{id}` | Edit a message |
| DELETE | `/api/messages/{id}` | Delete a message |
| POST | `/api/messages/{id}/reactions/{emoji}` | Toggle a reaction |
| GET | `/api/messages/{id}/replies` | Get thread replies |
| GET | `/api/workspaces/{id}/conversations` | List your DMs |
| POST | `/api/workspaces/{id}/conversations` | Open a DM with someone |
| POST | `/api/files/messages/{messageId}` | Upload a file attachment |
| GET | `/api/notifications` | Your notifications |
| POST | `/api/notifications/read-all` | Mark all as read |

---

## WebSocket topics

Connect to `/ws` with a `Authorization: Bearer <token>` header.

| Topic | Direction | What it carries |
|---|---|---|
| `/topic/channels/{id}` | subscribe | New, edited, deleted messages in a channel |
| `/topic/channels/{id}/typing` | subscribe | Typing indicators |
| `/topic/conversations/{id}` | subscribe | DM messages |
| `/topic/conversations/{id}/typing` | subscribe | Typing indicators in DMs |
| `/topic/presence` | subscribe | User status changes |
| `/user/queue/notifications` | subscribe | Your personal notifications |
| `/app/typing` | publish | Send a typing event |
| `/app/presence` | publish | Update your status |

---

## Useful URLs when running locally

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- MinIO console (file storage): http://localhost:9001 — login with `minioadmin / minioadmin`
- Health check: http://localhost:8080/actuator/health
- Prometheus metrics: http://localhost:8080/actuator/prometheus

---

## Stopping everything

```bash
docker-compose down
```

To also wipe all stored data (database, files):

```bash
docker-compose down -v
```
