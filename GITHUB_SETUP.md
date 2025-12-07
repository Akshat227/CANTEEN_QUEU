# Publishing to GitHub

Your local repository is ready! Follow these steps to publish it to GitHub:

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `canteen-queue` (or any name you prefer)
3. Description: "College canteen food ordering system with real-time updates"
4. Set visibility to **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/canteen-queue.git

# Push to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/canteen-queue.git
git push -u origin main
```

## If you need to authenticate

- **HTTPS**: You'll be prompted for username and a Personal Access Token (not password)
  - Create token at: https://github.com/settings/tokens
  - Select scope: `repo` (full control of private repositories)
  
- **SSH**: Make sure your SSH key is added to GitHub
  - Check: https://github.com/settings/keys

## Update Git Identity (Optional)

If you want to use your actual GitHub email:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

Then amend the commit:
```bash
git commit --amend --reset-author --no-edit
```




