# PeerLift Quick Start Guide

## 🚀 Get Running in 10 Minutes

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- MySQL database (local or PlanetScale)
- Groq API key (free tier available)

### Step 1: Clone & Install (2 min)
```bash
cd peerlift
pnpm install
```

### Step 2: Configure Environment (2 min)

**Backend** (`apps/backend/.env.local`):
```env
DATABASE_URL=mysql://root:password@localhost:3306/peerlift
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Step 3: Database Setup (3 min)
```bash
# From project root
pnpm db:push      # Create schema
pnpm db:seed      # Load demo data (20 demo users)
```

### Step 4: Start Development (1 min)
```bash
pnpm dev
```

**URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Prisma Studio: http://localhost:5555

### Step 5: Login with Demo User (2 min)
```
Email: student1@peerlift.com
Password: StudentPass123!
```

---

## 📊 What You Can Do Immediately

### As a Student
- ✓ View financial dashboard (net worth, spending)
- ✓ Add/edit transactions
- ✓ Create savings goals
- ✓ View AI financial insights
- ✓ Browse learning modules
- ✓ See leaderboard rankings

### As a Mentor
- ✓ View assigned mentees
- ✓ Schedule mentorship sessions
- ✓ Provide session feedback
- ✓ View mentee progress

### As an Admin
- ✓ View organization analytics
- ✓ Manage users and roles
- ✓ View audit logs
- ✓ Monitor system metrics

---

## 🗂️ Project Structure at a Glance

```
apps/frontend/        Next.js app (React)
  └─ app/            Pages & routes
  └─ lib/            API client, hooks, stores
  └─ components/     UI components (shadcn/ui)

apps/backend/        Express API server
  └─ src/
    └─ routes/       API endpoints
    └─ services/     Business logic
    └─ middleware/   Auth, errors, logging
  └─ prisma/         Database schema

packages/shared/      Shared code
  └─ types/          TypeScript interfaces
  └─ validators/     Zod schemas
```

---

## 🔑 Key APIs to Know

### Authentication
```bash
# Register
POST /api/auth/register
{email, password, firstName, lastName, role}

# Login
POST /api/auth/login
{email, password}

# Get profile
GET /api/auth/profile
```

### Financial
```bash
# Create transaction
POST /api/financial/transactions
{amount, category, description, date}

# Get transactions
GET /api/financial/transactions?skip=0&take=20

# Create savings goal
POST /api/financial/goals
{goalName, targetAmount, deadline}

# Get AI insights
GET /api/financial/insights
```

### Learning
```bash
# Get modules
GET /api/learning/modules

# Start module
POST /api/learning/progress/:moduleId/start

# Complete module
POST /api/learning/progress/:moduleId/complete
{score}

# Get leaderboard
GET /api/learning/leaderboard?limit=10
```

### Mentorship
```bash
# Create session
POST /api/mentorship/sessions
{mentorId, topic, sessionDate, notes}

# Get my sessions
GET /api/mentorship/sessions/student

# Complete session
POST /api/mentorship/sessions/:id/complete
{feedback, score}
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p

# If using Docker
docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -d mysql:8.0

# Update DATABASE_URL if needed
```

### Prisma Schema Mismatch
```bash
# Reset database (careful!)
pnpm db:reset

# Then seed
pnpm db:seed
```

### Frontend not connecting to API
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on port 3001
- Check CORS is enabled in backend

---

## 📈 Next Steps

### 1. Explore the Code
- Read `ARCHITECTURE.md` for system design
- Read `README.md` for full documentation
- Review `apps/backend/src/services/` for business logic examples

### 2. Add a Feature
Example: Add a monthly budget feature
1. Add schema to `prisma/schema.prisma`
2. Add service method in `FinancialService`
3. Add API route in `routes/financial.ts`
4. Create frontend component in `features/financial/`
5. Add Zustand store update in `authStore`

### 3. Deploy
- Frontend: Push to GitHub → Auto-deploy to Vercel
- Backend: Push to GitHub → Auto-deploy to Railway
- Database: Use PlanetScale connection string

### 4. Monitor
- Check Vercel analytics: https://vercel.com
- Check Railway logs: https://railway.app
- Check database: https://app.planetscale.com

---

## 📚 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Express**: https://expressjs.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **Groq**: https://console.groq.com/docs

---

## ❓ Common Questions

**Q: How do I change the database?**
A: Update `DATABASE_URL` in `.env.local` and run `pnpm db:push`

**Q: How do I add a new user role?**
A: Update the `role` enum in `prisma/schema.prisma`, add RBAC check in `middleware/auth.ts`

**Q: How do I deploy to production?**
A: Push to `main` branch → GitHub Actions → Auto-deploy to Vercel/Railway

**Q: How do I access the database directly?**
A: `pnpm db:studio` opens Prisma Studio UI

**Q: Can I use this for production?**
A: Yes! It's built with production-grade architecture. See README.md for security, performance, monitoring details.

---

## 🆘 Need Help?

- Check `README.md` for comprehensive documentation
- Check `ARCHITECTURE.md` for technical details
- Open an issue on GitHub
- Check logs: `pnpm logs` (if running in background)

---

**Happy coding! 🎉**
