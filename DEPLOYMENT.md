# Deployment Guide for Vercel

## Prerequisites

Before deploying to Vercel, ensure you have:
1. A Vercel account (sign up at https://vercel.com)
2. All required API keys and credentials
3. Your database set up and migrated

## Step 1: Fix Local Issues First

1. **Create your .env file** (copy from env.example):
   ```bash
   cp env.example .env
   ```

2. **Fill in all environment variables** in your .env file:
   - DATABASE_URL (from Neon)
   - ANTHROPIC_API_KEY
   - FREESTYLE_API_KEY
   - All Stack Auth keys

3. **Set up your database**:
   ```bash
   npm run db:push
   ```

4. **Test locally**:
   ```bash
   npm run dev
   ```

## Step 2: Prepare for Deployment

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Fix database setup and viewport issues"
   git push origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add environment variables** when prompted or use:
   ```bash
   vercel env add
   ```

### Option B: Using Vercel Dashboard

1. **Go to** https://vercel.com/new

2. **Import your GitHub repository**

3. **Configure environment variables** in the Vercel dashboard:
   
   Click on "Environment Variables" and add:
   
   ```
   DATABASE_URL                              = your_neon_database_url
   ANTHROPIC_API_KEY                         = your_anthropic_key
   FREESTYLE_API_KEY                         = your_freestyle_key
   FREESTYLE_API_URL                         = https://api.freestyle.sh
   FREESTYLE_FIRECRACKER                     = false
   STACK_PROJECT_ID                          = your_stack_project_id
   STACK_PUBLISHABLE_CLIENT_KEY              = your_stack_publishable_key
   STACK_SECRET_SERVER_KEY                   = your_stack_secret_key
   NEXT_PUBLIC_STACK_PROJECT_ID              = your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY  = your_stack_publishable_key
   ```

4. **Deploy** - Click "Deploy"

## Step 4: Post-Deployment

1. **Check deployment logs** for any errors

2. **Test your deployed app** at your-app.vercel.app

3. **Configure custom domain** (optional):
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

## Step 5: Set up Production Database

If you haven't already, ensure your production database has the tables:

1. **Run migrations on production**:
   - You can use the Vercel dashboard to run a one-time command
   - Or connect to your database directly and run the schema

## Troubleshooting

### Common Issues:

1. **"relation does not exist" errors**:
   - Your database tables aren't created
   - Run `npm run db:push` with your production DATABASE_URL

2. **"User not found" errors**:
   - Stack Auth is not properly configured
   - Verify all Stack Auth environment variables are set correctly

3. **Build failures**:
   - Check all environment variables are set
   - Review build logs for specific errors

### Environment Variables Checklist:

- [ ] DATABASE_URL
- [ ] ANTHROPIC_API_KEY
- [ ] FREESTYLE_API_KEY
- [ ] FREESTYLE_API_URL
- [ ] STACK_PROJECT_ID
- [ ] STACK_PUBLISHABLE_CLIENT_KEY
- [ ] STACK_SECRET_SERVER_KEY
- [ ] NEXT_PUBLIC_STACK_PROJECT_ID
- [ ] NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY

## Security Notes

- Never commit your .env file to Git
- Use different API keys for production vs development
- Enable Vercel's environment variable encryption
- Regularly rotate your API keys 