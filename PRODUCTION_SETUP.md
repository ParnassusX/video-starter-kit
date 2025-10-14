# Production Setup Guide

This guide will help you set up the production-ready features of the AI Video Studio application.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys for AI providers (fal.ai, Replicate, Bytedance)

## 1. Environment Configuration

Copy the `.env.example` file to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/video_studio"

# Authentication
NEXTAUTH_URL="http://localhost:3000"  # Change to your production URL
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Encryption for API keys
ENCRYPTION_KEY="your-encryption-key-here"  # Generate with: openssl rand -base64 32

# AI Provider API Keys
FAL_KEY=""
REPLICATE_API_TOKEN=""

# File Upload (optional)
UPLOADTHING_TOKEN=""

# KV Storage (optional)
KV_URL=""
KV_REST_API_READ_ONLY_TOKEN=""
KV_REST_API_TOKEN=""
KV_REST_API_URL=""
```

## 2. Database Setup

1. **Install PostgreSQL** if you don't have it already
2. **Create a database**:
   ```sql
   CREATE DATABASE video_studio;
   ```

3. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```

4. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

5. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

## 3. AI Provider Setup

### fal.ai

1. Sign up at [fal.ai](https://fal.ai)
2. Get your API key from the [dashboard](https://fal.ai/dashboard/keys)
3. Add it to your `.env.local` file:
   ```env
   FAL_KEY="your-fal-api-key"
   ```

### Replicate

1. Sign up at [Replicate](https://replicate.com)
2. Get your API token from [account settings](https://replicate.com/account)
3. Add it to your `.env.local` file:
   ```env
   REPLICATE_API_TOKEN="your-replicate-token"
   ```

### Bytedance

1. Sign up for Bytedance API access
2. Get your API key
3. Add it to your `.env.local` file

## 4. OAuth Provider Setup (Optional)

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add the authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

### GitHub

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local` file

## 5. Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## 6. Production Deployment

### Database

1. Set up a production PostgreSQL database
2. Update the `DATABASE_URL` in your production environment
3. Run migrations: `npm run db:migrate`

### Environment Variables

1. Update `NEXTAUTH_URL` to your production domain
2. Set a secure `NEXTAUTH_SECRET`
3. Configure all API keys and secrets

### Build and Deploy

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## 7. User Management

Once the application is running:

1. **Sign up** for a new account or sign in with an OAuth provider
2. **Configure API keys** in your profile settings
3. **Check your usage** and subscription status
4. **Upgrade your plan** if needed (implementation dependent)

## 8. Monitoring and Maintenance

- Monitor database usage and performance
- Check API usage and costs
- Regular backups of the database
- Update API keys as needed

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check that PostgreSQL is running
- Ensure the database exists

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your domain
- Check that `NEXTAUTH_SECRET` is set
- Ensure OAuth providers are configured correctly

### API Key Issues

- Verify API keys are correct and have sufficient permissions
- Check that encryption keys are set consistently
- Ensure API keys are properly saved in user profiles

## Security Considerations

- Never commit `.env.local` files to version control
- Use strong, unique secrets
- Regularly rotate API keys
- Implement proper backup strategies
- Monitor for unusual usage patterns

## Next Steps

- Set up monitoring and alerting
- Configure backup and recovery procedures
- Implement additional security measures as needed
- Scale database and application resources based on usage