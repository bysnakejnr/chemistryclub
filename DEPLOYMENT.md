# Vercel Deployment Guide

## Quick Start

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Environment Setup

### Step 4: Set Environment Variables
In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add: `VITE_NOTION_TOKEN` 
3. Value: `your-actual-notion-token`
4. Select: **Production** and **Preview** environments

**Note**: The `vercel.json` file uses `@vercel-env-var` as a placeholder. Vercel automatically replaces this with the actual environment variable value during deployment.

2. **Update CORS Origins**
   The serverless function automatically handles CORS for production

## Project Structure for Vercel

```
chem-club-site/
├── api/
│   └── notion.js          # Serverless function
├── dist/                  # Built frontend
├── vercel.json             # Vercel configuration
└── package.json            # Updated with deployment scripts
```

## Deployment Commands

```bash
# Build and deploy
npm run deploy

# Or step by step
npm run vercel-build
vercel --prod
```

## URLs After Deployment

- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

## Troubleshooting

### Common Issues

1. **Build fails**
   - Check TypeScript errors: `npm run build`
   - Verify all imports are correct

2. **API returns 401**
   - Check Vercel environment variables
   - Ensure Notion token is valid

3. **CORS errors**
   - Verify API routes are working
   - Check frontend is using correct API base URL

### Debug Commands

```bash
# Local testing
npm run dev

# Production build test
npm run build
npm run preview

# Check Vercel logs
vercel logs
```

## Rollback

```bash
# Deploy previous version
vercel --prod --prebuilt
```
