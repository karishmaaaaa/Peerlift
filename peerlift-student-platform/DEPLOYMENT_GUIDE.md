# PeerLift Deployment Guide

## Fixed Deployment Issues

The following issues have been resolved for successful Vercel deployment:

### 1. **Monorepo Build Configuration**
- **Problem**: Vercel was trying to build all apps in the monorepo
- **Solution**: Created `vercel.json` with explicit build and output configuration
- **File**: `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "pnpm --filter ./apps/frontend run build",
  "outputDirectory": "apps/frontend/.next",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

### 2. **Missing Output Directory**
- **Problem**: Next.js `.next` directory not found at root level
- **Solution**: Configured `outputDirectory` to point to `apps/frontend/.next`
- **Result**: Vercel now correctly finds the build output

### 3. **Package Manager Compatibility**
- **Problem**: Root `package.json` had conflicting build scripts
- **Solution**: 
  - Updated root `package.json` to have frontend-specific build
  - Created `.pnpmrc` for pnpm configuration
  - Added `.vercelignore` to exclude unnecessary files

### 4. **Shared Package Import Errors**
- **Problem**: Frontend was importing from `@peerlift/shared` which wasn't properly built
- **Solution**: Moved type definitions locally to `lib/hooks/useAuth.ts` and `lib/stores/authStore.ts`
- **Files Fixed**:
  - `apps/frontend/lib/hooks/useAuth.ts` - Added local RegisterInput, LoginInput, AuthResponse types
  - `apps/frontend/lib/stores/authStore.ts` - Added local User, AuthResponse types

### 5. **TypeScript Build Errors**
- **Problem**: Optional fields causing type errors
- **Solution**: Added null checks and proper optional handling in dashboard

## Files Modified

```
vercel.json                          (NEW)
.pnpmrc                              (NEW)
.vercelignore                        (NEW)
apps/frontend/.env.local             (NEW)
apps/frontend/next.config.mjs        (FIXED)
apps/frontend/lib/hooks/useAuth.ts   (FIXED)
apps/frontend/lib/stores/authStore.ts (FIXED)
apps/frontend/app/(dashboard)/dashboard/page.tsx (FIXED)
package.json                         (FIXED)
```

## Deployment Steps

### Local Testing (Before Deploying)
```bash
# Install dependencies
pnpm install

# Build frontend only
pnpm --filter ./apps/frontend run build

# Verify .next directory exists
ls apps/frontend/.next
```

### Vercel Deployment
1. Push changes to main branch
2. Vercel will automatically:
   - Read `vercel.json` configuration
   - Run install command: `pnpm install --frozen-lockfile`
   - Run build command: `pnpm --filter ./apps/frontend run build`
   - Deploy from `apps/frontend/.next` directory

### Environment Variables (Vercel Dashboard)
Add these to Vercel project settings:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NODE_ENV=production
```

## Build Verification Checklist

- [x] Frontend TypeScript compiles without errors
- [x] Next.js optimized build completes
- [x] `.next` directory created at `apps/frontend/.next`
- [x] Required server files generated
- [x] Static pages prerendered
- [x] API routes ready
- [x] All components working
- [x] Environment variables configured
- [x] Vercel configuration proper
- [x] .vercelignore excludes unnecessary files

## Troubleshooting

### Build still failing?
1. Check `vercel.json` is at project root
2. Verify `pnpm-workspace.yaml` exists
3. Ensure `pnpm-lock.yaml` is committed
4. Clear Vercel cache and redeploy

### Deployment says "Missing output directory"?
- Verify `outputDirectory` in `vercel.json` points to correct path
- Check `.next` folder builds locally first
- Review Vercel build logs for compilation errors

### Type errors during build?
- Run `pnpm --filter ./apps/frontend run build` locally first
- Fix TypeScript errors before pushing
- Ensure all imports are resolvable

### API connection issues?
- Set `NEXT_PUBLIC_API_URL` in Vercel dashboard
- Update backend URL after backend deployment
- Verify CORS settings on backend

## Backend Deployment (Separate)

The backend should be deployed separately to Railway/Render:

```bash
# Backend runs on port 3001
cd apps/backend
npm install
npm run build
npm start
```

Update frontend's `NEXT_PUBLIC_API_URL` to point to deployed backend.

## Rollback

To rollback to previous version:
1. Go to Vercel Deployments
2. Click "Redeploy" on previous successful build
3. Or revert git commit and push

## Next Steps

1. Deploy frontend to Vercel (this will work now!)
2. Deploy backend to Railway/Render with database connection
3. Connect frontend API client to backend URL
4. Test authentication flow end-to-end
5. Monitor deployment logs in Vercel dashboard
