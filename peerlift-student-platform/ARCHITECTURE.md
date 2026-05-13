# PeerLift Architecture Deep Dive

## System Components

### 1. Frontend Layer (Next.js 16 + React 19)

**Purpose**: User-facing application for students, mentors, teachers, and administrators.

**Key Features**:
- Server-side rendering for better SEO
- Automatic code splitting per route
- Image optimization
- CSS-in-JS with Tailwind CSS 4.2

**Routes Structure**:
```
/                      → Landing page
/(auth)/login         → Student/Teacher login
/(auth)/register      → Registration & role selection
/(dashboard)/*        → Protected dashboard routes
```

**State Management** (Zustand):
- `authStore`: User auth, roles, permissions
- `financialStore`: Transactions, goals, summary
- `uiStore`: Dark mode, sidebar toggle, notifications

### 2. API Gateway (Express.js)

**Purpose**: RESTful API providing business logic and data access.

**Responsibilities**:
- Request routing and middleware chain
- Authentication (JWT validation)
- Authorization (RBAC checking)
- Input validation (Zod schemas)
- Error handling and transformation
- Logging and monitoring

**Middleware Chain**:
```
Request
  ↓
requestIdMiddleware (add tracing)
  ↓
corsMiddleware
  ↓
helmetMiddleware (security headers)
  ↓
jsonParser
  ↓
authMiddleware (JWT validation, optional)
  ↓
rbacMiddleware (role checking)
  ↓
Route Handler
  ↓
errorHandler (catches all errors)
  ↓
Response
```

### 3. Business Logic Layer (Services)

**Pattern**: Service → Repository → ORM

**Services Implemented**:
- **AuthService**: Authentication, token management
- **FinancialService**: Transactions, goals, analytics
- **AIService**: Groq integration, insight generation
- **LearningService**: Modules, progress tracking
- **MentorshipService**: Session scheduling, matching
- **AdminService**: Organization analytics

Each service handles:
- Business logic validation
- Data transformation
- Cross-service coordination
- Event emission (for WebSocket updates)

### 4. Data Access Layer (Prisma ORM)

**Purpose**: Type-safe database interaction with auto-migration.

**Key Features**:
- Automatic schema validation
- Query optimization hints
- N+1 query detection
- Auto-generated migrations

**Database Tables** (15):
1. **Organizations** - Tenant container
2. **Schools** - Sub-organizations
3. **Users** - With roles and relationships
4. **Transactions** - Financial records
5. **SavingsGoals** - Goal tracking
6. **FinancialInsights** - AI-generated insights
7. **LearningModules** - Course content
8. **UserProgress** - Module completion
9. **MentorshipSessions** - Sessions with feedback
10. **Notifications** - User notifications
11. **AuditLogs** - Compliance tracking
12. **SystemMetrics** - Monitoring
13. Additional join tables for relationships

### 5. Cache Layer (Redis via Upstash)

**Purpose**: Distributed, fast data store for high-frequency reads.

**Data Cached**:
- Leaderboards (Sorted Sets)
- User session data (30m TTL)
- Financial summaries (5m TTL)
- Module listings (10m TTL)
- Mentor statistics (1h TTL)

**Cache Invalidation**:
- Time-based TTL (primary)
- Event-based (Socket.io triggers)
- Manual (admin refresh)

### 6. Background Job Processor (BullMQ + Redis)

**Purpose**: Asynchronous task processing, decoupled from request cycle.

**Jobs**:
- AI insight generation (every hour per user)
- Weekly financial reports
- Notification sending
- Email reminders
- Analytics aggregation

**Features**:
- Retry logic (exponential backoff)
- Job scheduling
- Rate limiting
- Job persistence across restarts

### 7. Real-time Layer (Socket.io)

**Purpose**: Bi-directional communication for real-time updates.

**Events**:
- `notification:new` → New insight/goal/session
- `goal:achieved` → Milestone celebration
- `session:started` → Mentorship live notification
- `leaderboard:updated` → Rank changes

### 8. AI Integration (Groq)

**Purpose**: Financial analysis and personalized recommendations.

**Capabilities**:
- Spending pattern analysis
- Risk level detection
- Personalized recommendations
- Financial behavior coaching

**Architecture**:
```
User Action (Transaction Logged)
  ↓
BullMQ Job Created
  ↓
AIService Processes (via Groq)
  ↓
Result Stored in DB
  ↓
Socket.io Notification
  ↓
Frontend Updates in Real-time
```

---

## Request Flow Examples

### 1. User Registration Flow

```
Frontend (Register Page)
  ↓ POST /api/auth/register
    {email, password, firstName, lastName, role}

Backend (Auth Routes)
  ↓ Validate with Zod schema
  ↓ Check email uniqueness
  
AuthService
  ↓ Hash password with bcryptjs (cost=12)
  ↓ Create user record via Prisma
  ↓ Return user (no password)

Frontend
  ↓ Store tokens (access in memory, refresh in httpOnly)
  ↓ Redirect to dashboard
  ↓ Fetch user profile
```

### 2. Financial Insight Generation Flow

```
Frontend (User Adds Transaction)
  ↓ POST /api/financial/transactions

FinancialService
  ↓ Validate transaction
  ↓ Save to database
  ↓ Emit 'transaction:created' event
  ↓ Response to frontend
  ↓ Frontend updates optimistically

BullMQ (Background)
  ↓ Job: Generate AI Insight (if 10+ transactions)

AIService
  ↓ Fetch user's last 10 transactions
  ↓ Call Groq API (2-3 second wait)
  ↓ Parse response, calculate risk score
  ↓ Save insight to database

Socket.io
  ↓ Emit 'insight:new' event
  ↓ Frontend receives real-time update
  ↓ Show notification + new insight card
```

### 3. Mentorship Session Booking Flow

```
Frontend (Student Selects Mentor)
  ↓ POST /api/mentorship/sessions

MentorshipService
  ↓ Validate mentor availability
  ↓ Check student's current mentors (max 3)
  ↓ Create session record (status: SCHEDULED)
  ↓ Calculate match score
  ↓ Response to frontend

Notifications
  ↓ Create notification for mentor
  ↓ Create notification for student
  ↓ Emit Socket.io events

Backend Scheduled Job
  ↓ 1 day before session: reminder email
  ↓ On session time: escalate to urgent
  ↓ Post-session: request feedback

Socket.io
  ↓ Real-time updates to both mentor/student
  ↓ Celebration when session completed
```

---

## Security Architecture

### Authentication Flow

```
┌─ JWT Token Structure
│  ├─ Header: {alg: HS256, typ: JWT}
│  ├─ Payload: {userId, role, email, iat, exp}
│  └─ Signature: HMAC(header.payload, secret)

└─ Token Management
   ├─ Access Token: 15 minute TTL (memory)
   ├─ Refresh Token: 7 day TTL (httpOnly cookie)
   └─ Token Refresh: Automatic via interceptor
```

### Authorization (RBAC)

```
Request with JWT
  ↓
Decode & Verify Signature
  ↓
Check Token Expiration
  ↓
Extract User Role
  ↓
Check Route Permissions
  ├─ ADMIN: All operations
  ├─ NGO_COORDINATOR: Organization + school management
  ├─ TEACHER: Module creation, student tracking
  ├─ MENTOR: Session creation, student feedback
  └─ STUDENT: View own data, create transactions
  ↓
Allow or Deny
```

### Data Protection

```
- Database: Encrypted at rest (PlanetScale)
- Transit: HTTPS/TLS only
- Passwords: bcryptjs (cost=12) = 2^12 iterations
- Secrets: Never in code, env variables only
- SQL Injection: Prisma parameterized queries
- XSS: React auto-escapes, CSP headers
- CSRF: JWT (not cookies), not needed
```

---

## Performance Optimization Strategies

### Database Optimization

```
1. Indexing Strategy
   - Every foreign key indexed
   - Multi-column index on common filters
   - Separate index for sorting (date, score)

2. Query Optimization
   - Use Prisma select() for specific fields
   - Lazy load relations only when needed
   - Pagination on all list endpoints

3. Caching Strategy
   - Hot data (leaderboard) in Redis
   - Cold data in database
   - Cache invalidation on updates
```

### API Optimization

```
1. Response Compression
   - gzip for JSON responses
   - Only for >1KB responses

2. Request Batching
   - Client can POST multiple requests in array
   - Backend processes atomically

3. Pagination
   - Default 20 items
   - Max 100 items per request
   - Cursor-based for large datasets
```

### Frontend Optimization

```
1. Code Splitting
   - Per-route chunks (automatic Next.js)
   - Lazy load heavy components

2. Image Optimization
   - next/image component
   - WebP format for modern browsers
   - Responsive srcset

3. Caching
   - Static assets: 1 year
   - API responses: 5 minutes
   - User data: No cache (sensitive)
```

---

## Deployment Architecture

### Development Environment

```
Local Machine
├─ Node.js + pnpm
├─ Local MySQL (docker or manual)
├─ Redis (docker or Upstash dev instance)
├─ Frontend: http://localhost:3000
└─ Backend: http://localhost:3001
```

### Staging Environment

```
Vercel (Frontend)
├─ Preview deployments on PR
├─ Database: PlanetScale dev branch
└─ Same as production, isolated

Railway (Backend)
├─ Separate project
├─ Database: PlanetScale staging
└─ Manual approval to promote
```

### Production Environment

```
Vercel (Frontend)
├─ Automatic deploy on merge to main
├─ CDN for static assets
├─ Analytics built-in
└─ Auto-scaling

Railway/Render (Backend)
├─ Auto-scaling based on CPU/memory
├─ Load balancer included
├─ Health checks every 30s
└─ Auto-rollback on failed health check

PlanetScale (Database)
├─ Multi-region replication
├─ Daily backups retained 30 days
├─ Point-in-time recovery available
├─ Read replicas for scaling
└─ Automatic failover
```

---

## Future Architecture Evolution

### Phase 1 (Current) - Monolith
- Single Express server
- All features in one codebase
- Suitable for 10K users

### Phase 2 (50K users) - Services
- Auth service (microservice)
- Financial service (microservice)
- Learning service (microservice)
- API gateway (Kong/Nginx)

### Phase 3 (100K+ users) - Distributed
- Kubernetes orchestration
- Message queue (RabbitMQ/Kafka)
- Distributed tracing (Jaeger)
- Service mesh (Istio)
- GraphQL federation

---

## Technology Rationale Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Frontend | Next.js 16 | Server components, auto-splitting, SEO |
| Backend | Express | Lightweight, flexible, excellent ecosystem |
| Database | MySQL | ACID compliance, financial data safety |
| Cache | Redis | Sub-ms lookups for leaderboards |
| AI | Groq | 50+ tokens/sec, cost-effective |
| Jobs | BullMQ | Reliable, distributed, Redis-backed |
| Real-time | Socket.io | Bi-directional, fallback support |
| Auth | JWT | Stateless, scalable, mobile-friendly |
| ORM | Prisma | Type-safe, auto-migration, DX focused |

---

**Built for scalability, security, and developer experience.**
