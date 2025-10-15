# Vercel Deployment Guide

## Files Added for Vercel Deployment

### 1. `vercel.json`

- Configures Vercel to use Node.js runtime
- Routes all requests to server.js
- Sets production environment
- Sets function timeout to 30 seconds

### 2. `.vercelignore`

- Excludes unnecessary files from deployment
- Keeps uploads folder structure but ignores actual uploaded files

### 3. Updated `package.json`

- Added `start` script for production
- Added `build` and `vercel-build` scripts

## Environment Variables

Before deploying, make sure to set these environment variables in your Vercel dashboard:

```
ACCESS_TOKEN_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string
ANTHROPIC_API_KEY=your_anthropic_api_key
NODE_ENV=production
PORT=3001
```

## Deployment Steps

1. **Install Vercel CLI (if not already installed):**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**

   ```bash
   vercel
   ```

4. **Follow the prompts:**

   - Link to existing project or create new one
   - Select your framework preset (choose "Other")
   - Configure build settings (defaults should work)

5. **Set Environment Variables:**

   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all required environment variables

6. **For production deployment:**
   ```bash
   vercel --prod
   ```

## Important Notes

### Database Considerations

- Make sure your MongoDB allows connections from Vercel's IP ranges
- Consider using MongoDB Atlas for cloud deployment
- Update your MongoDB connection string to use the production database

### File Uploads

- Vercel has limitations on file uploads in serverless functions
- Consider using cloud storage (AWS S3, Cloudinary, etc.) for file uploads in production
- Current uploads folder will not persist between deployments

### Socket.IO Considerations

- Socket.IO might need additional configuration for serverless deployment
- Consider using Vercel's WebSocket support or external Socket.IO service

### CORS Configuration

- Update CORS settings to include your Vercel domain
- Remove wildcard (\*) origins in production

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify JWT authentication works
- [ ] Check database connectivity
- [ ] Test file upload functionality
- [ ] Verify Socket.IO connections
- [ ] Test AI image analysis feature
- [ ] Check API documentation accessibility

## Custom Domain (Optional)

To add a custom domain:

1. Go to your Vercel project dashboard
2. Navigate to "Domains" tab
3. Add your custom domain
4. Configure DNS settings as instructed

Your backend will be available at: `https://your-project-name.vercel.app`
