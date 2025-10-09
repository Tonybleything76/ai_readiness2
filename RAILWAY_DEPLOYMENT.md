# Railway Deployment Guide

## AI Readiness Assessment - Railway Deployment

This guide will help you deploy your AI Readiness Assessment application to Railway.

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI** (optional): `npm install -g @railway/cli`
3. **PostgreSQL Database**: Will be provisioned on Railway

---

## Quick Deploy (Web Dashboard)

### Step 1: Create New Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"** (or use CLI method below)
3. Connect your GitHub account and select your repository

### Step 2: Configure Build Settings

Railway will auto-detect your `railway.json` configuration, which includes:

```json
{
  "build": {
    "buildCommand": "npm install && vite build --outDir dist"
  },
  "deploy": {
    "startCommand": "node --loader tsx server/index.ts"
  }
}
```

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a `DATABASE_URL` environment variable

### Step 4: Set Environment Variables

Go to your service → **"Variables"** tab and add:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Railway will automatically link the PostgreSQL database URL.

### Step 5: Deploy Database Schema

After the PostgreSQL database is provisioned:

1. Go to the PostgreSQL service → **"Data"** tab
2. Or use Railway CLI to run migrations:

```bash
railway run npx drizzle-kit push
```

If you encounter data-loss warnings, use:
```bash
railway run npx drizzle-kit push --force
```

### Step 6: Generate Domain

1. Go to your service → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Your app will be live at `https://your-app.railway.app`

---

## Deploy via Railway CLI

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Initialize Project

```bash
railway init
```

Select **"Create new project"** and give it a name.

### Step 4: Link PostgreSQL Database

```bash
railway add --database postgresql
```

This will:
- Provision a PostgreSQL database
- Automatically set `DATABASE_URL` environment variable

### Step 5: Deploy

```bash
railway up
```

Railway will:
1. Build your Vite frontend (`npm run build`)
2. Install dependencies
3. Start your Express server
4. Serve your app

### Step 6: Run Database Migration

```bash
railway run npx drizzle-kit push
```

If you encounter warnings about data loss, force the push:
```bash
railway run npx drizzle-kit push --force
```

### Step 7: Open Your App

```bash
railway open
```

Or get the URL:

```bash
railway status
```

---

## Environment Variables

Required environment variables (auto-configured by Railway):

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `PORT` | Server port | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes (when DB added) |
| `NODE_ENV` | Environment (set to `production`) | ⚠️ Manual |

---

## How It Works

### Build Process

1. **Install dependencies**: `npm install`
2. **Build Vite frontend**: `vite build --outDir dist`
   - Outputs to `/dist` directory
   - Includes all static assets (HTML, CSS, JS)

### Runtime

1. **Start Express server**: `node --loader tsx server/index.ts`
2. **Serve API routes**: All `/api/*` requests handled by Express
3. **Serve static files**: Built Vite files served from `/dist`
4. **Client-side routing**: All other routes serve `index.html`

### Database

- PostgreSQL database provisioned automatically
- Schema synced using `npx drizzle-kit push`
- Connection via `DATABASE_URL` environment variable

---

## Verification Steps

After deployment:

1. **Check build logs**: Ensure Vite build completed successfully
2. **Test API**: Visit `https://your-app.railway.app/api/assessment?tier=free`
3. **Test frontend**: Visit `https://your-app.railway.app`
4. **Test assessment flow**:
   - Free assessment (25 questions)
   - Full assessment (90 questions)
   - Results page

---

## Troubleshooting

### Issue: Build Fails with Node Version Error

**Error**: `Vite requires Node.js version >=20.19.0`

**Solution**: Add environment variable:
```
NIXPACKS_NODE_VERSION=22
```

### Issue: 502 Bad Gateway

**Cause**: Server not binding to `0.0.0.0`

**Solution**: Server already configured to listen on `0.0.0.0`:
```typescript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue: Client-Side Routing Returns 404

**Cause**: Express not serving `index.html` for non-API routes

**Solution**: Already configured in `server/index.ts`:
```typescript
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});
```

### Issue: Database Connection Fails

**Cause**: `DATABASE_URL` not set or database not running

**Solution**:
1. Ensure PostgreSQL service is running in Railway dashboard
2. Check that `DATABASE_URL` is set: `railway variables`
3. Restart the service

### Issue: Static Assets Not Loading

**Cause**: Incorrect build output directory

**Solution**: Verify `railway.json` build command:
```json
"buildCommand": "npm install && vite build --outDir dist"
```

---

## Railway Features

### Auto-Deploy on Push

Railway automatically deploys when you push to your connected branch (usually `main`).

### Preview Environments

Enable PR deployments in **Settings** → **Previews** to get a unique URL for each pull request.

### Scaling

Railway auto-scales based on traffic. Configure in **Settings** → **Resources**.

### Monitoring

View logs and metrics in the Railway dashboard:
- **Deployments** tab: Build and deploy logs
- **Observability** tab: CPU, memory, and request metrics
- **Logs** tab: Real-time application logs

---

## Cost Estimates

Railway pricing (as of 2025):

- **Starter Plan**: $5/month
  - 512 MB RAM
  - 1 GB storage
  - Unlimited projects

- **Pro Plan**: Usage-based
  - Pay only for what you use
  - Scales automatically

- **PostgreSQL**: ~$0.30/GB/month for storage

**Estimated Monthly Cost**: $5-15 for typical usage

---

## Production Checklist

Before going live:

- ✅ PostgreSQL database added and schema deployed (`npx drizzle-kit push`)
- ✅ Environment variables configured
- ✅ Custom domain added (optional)
- ✅ SSL/HTTPS enabled (automatic on Railway)
- ✅ Database backups enabled (Railway automatic backups)
- ✅ Monitoring and alerts configured
- ✅ Test all assessment flows (free and full)
- ✅ Verify results storage and retrieval

---

## Support

- **Railway Docs**: [docs.railway.com](https://docs.railway.com)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Status**: [status.railway.app](https://status.railway.app)

---

## Quick Commands Reference

```bash
# Deploy
railway up

# View logs
railway logs

# Open app in browser
railway open

# Run database migration
railway run npx drizzle-kit push

# Check environment variables
railway variables

# Restart service
railway restart
```

---

Your AI Readiness Assessment app is now deployed on Railway! 🚀
