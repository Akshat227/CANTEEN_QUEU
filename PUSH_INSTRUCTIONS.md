# How to Push to GitHub

## Step 1: Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "Canteen Queue Project"
4. Expiration: Choose your preference
5. Scopes: Check **`repo`** (full control)
6. Click "Generate token"
7. **COPY THE TOKEN** - you won't see it again!

## Step 2: Push to GitHub

When you run `git push -u origin main`, you'll be prompted:
- **Username**: `Akshat227`
- **Password**: **Paste your Personal Access Token** (NOT your GitHub password)

## Alternative: Use Token in URL (one-time)

You can also include the token in the URL:

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/Akshat227/canteen-queue.git
git push -u origin main
```

Replace `YOUR_TOKEN` with your actual token.

## Alternative: Use SSH (Recommended for future)

If you have SSH keys set up:

```bash
git remote set-url origin git@github.com:Akshat227/canteen-queue.git
git push -u origin main
```

No authentication needed with SSH!





