# Deployment Guide

## Prerequisites for Deployment

1. Your code should be pushed to a GitHub repository
2. You should have your environment variables ready:
   - `GOOGLE_API_KEY`
   - `MONGO_URI`

## Deploying to Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In the Vercel dashboard, go to your project
   - Navigate to "Settings" → "Environment Variables"
   - Add both variables:
     ```
     GOOGLE_API_KEY = your_google_ai_api_key_here
     MONGO_URI = your_mongodb_connection_string_here
     ```

3. **Deploy**
   - Vercel will automatically deploy your application
   - Your app will be available at `https://your-project-name.vercel.app`

## Alternative Deployment Options

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Railway
1. Connect GitHub repository
2. Railway will auto-detect Next.js
3. Add environment variables in Railway dashboard
4. Deploy automatically

## Post-Deployment Checklist

- [ ] Test image upload functionality
- [ ] Verify AI extraction is working
- [ ] Check database connectivity
- [ ] Test the complete flow: upload → extract → save → view
- [ ] Verify search functionality
- [ ] Test on mobile devices

## Troubleshooting

- **AI Extraction Fails**: Check your Google API key and quota
- **Database Errors**: Verify MongoDB connection string and network access
- **Build Fails**: Check for TypeScript errors and missing dependencies
- **Environment Variables**: Ensure all required variables are set in production

## Security Notes

- Never commit your `.env.local` file
- Use strong passwords for your MongoDB user
- Consider IP restrictions for production MongoDB access
- Regularly rotate your API keys
