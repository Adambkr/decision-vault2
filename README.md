<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Decision Vault

A decision logging and review application built with React, Vite, and Supabase.

## Prerequisites

- Node.js
- A Supabase project (free at [supabase.com](https://supabase.com))

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   Find these in your Supabase dashboard under **Project Settings → API**.

3. Set up the Supabase database:
   - Open the Supabase SQL Editor
   - Copy the contents of `supabase-setup.sql`
   - Run the query

4. Enable Google OAuth (optional, for sign-in):
   - In Supabase Dashboard, go to **Authentication → Providers → Google**
   - Enable the provider
   - Add your site's URL to **Redirect URLs** (e.g., `http://localhost:3000/auth` for local dev)

5. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Netlify

1. Push your code to GitHub
2. Connect your repo to [Netlify](https://netlify.com)
3. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in Netlify's build settings
4. Update your Supabase **Redirect URLs** to include your deployed domain (e.g., `https://decision-vault.netlify.app/auth`)
