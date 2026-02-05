---
layout: post
title: 'How to Host Your Site for Free on GitHub Pages'
date: 2026-02-05 14:00:00.000000000 +02:00
type: post
parent_id: '0'
published: true
password: ''
status: publish
categories:
- Web Development
permalink: "/host-site-free-github-pages/"
---

# How to Host Your Site for Free on GitHub Pages

GitHub Pages provides free hosting for static websites directly from a GitHub repository. Whether you're running a personal blog, project documentation, or a portfolio site, GitHub Pages offers a reliable and cost-effective solution with automatic deployments via GitHub Actions.

This guide covers setting up GitHub Pages, configuring custom domains, and creating deployment workflows for both Jekyll and other static site generators.

## Prerequisites

Before proceeding, ensure you have the following:

- A GitHub account
- Git installed on your local machine
- A static website ready for deployment (HTML, Jekyll, Eleventy, Hugo, etc.)

## Step 1: Create a GitHub Repository

Create a new repository on GitHub to host your site.

### For a User/Organization Site

Create a repository named `<username>.github.io`, where `<username>` is your GitHub username. This repository will be accessible at `https://<username>.github.io`.

### For a Project Site

Create a repository with any name. The site will be accessible at `https://<username>.github.io/<repository-name>/`.

```bash
# Clone your new repository
git clone https://github.com/<username>/<repository-name>.git
cd <repository-name>
```

## Step 2: Add Your Site Files

Add your static site files to the repository:

```bash
# Add all files
git add .

# Commit the changes
git commit -m "Initial site setup"

# Push to GitHub
git push origin main
```

## Step 3: Enable GitHub Pages

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Pages**
3. Under **Source**, select one of the following:
   - **Deploy from a branch**: Select `main` (or `gh-pages`) and the folder (`/root` or `/docs`)
   - **GitHub Actions**: For custom build workflows

For static HTML sites, selecting the `main` branch is sufficient. For sites requiring a build step, GitHub Actions is recommended.

## Step 4: Configure GitHub Actions for Automated Deployment

GitHub Actions enables automated builds and deployments whenever you push changes to your repository.

### For Jekyll Sites

Jekyll is natively supported by GitHub Pages. However, for more control or to use unsupported plugins, create a custom workflow.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Jekyll Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Build with Jekyll
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### For Eleventy Sites

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Eleventy Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '_site'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### For Hugo Sites

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Hugo Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build site
        run: hugo --minify

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'public'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### For Plain HTML/CSS Sites

For sites that don't require a build step:

```yaml
name: Deploy Static Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Step 5: Configure GitHub Pages to Use Actions

After creating your workflow:

1. Go to **Settings** → **Pages**
2. Under **Build and deployment**, select **GitHub Actions** as the source
3. Push your workflow file to trigger the first deployment

## Step 6: Set Up a Custom Domain (Optional)

To use your own domain instead of `<username>.github.io`:

### Configure DNS Settings

Add the following DNS records with your domain registrar:

**For apex domain (example.com):**

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

**For subdomain (www.example.com):**

| Type | Name | Value |
|------|------|-------|
| CNAME | www | `<username>.github.io` |

### Add CNAME File

Create a `CNAME` file in your repository root containing your domain:

```
example.com
```

### Enable Custom Domain in GitHub

1. Go to **Settings** → **Pages**
2. Enter your custom domain under **Custom domain**
3. Enable **Enforce HTTPS** (recommended)

## Step 7: Create Pre-commit and Pre-push Hooks (Optional)

Git hooks automate tasks before commits or pushes, such as running tests or linting.

### Pre-commit Hook for Linting

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Run linting before commit
echo "Running pre-commit checks..."

# For Jekyll sites
if [ -f "Gemfile" ]; then
  bundle exec jekyll doctor
  if [ $? -ne 0 ]; then
    echo "Jekyll doctor failed. Please fix errors before committing."
    exit 1
  fi
fi

# For Node.js sites (Eleventy, etc.)
if [ -f "package.json" ]; then
  npm run lint 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix errors before committing."
    exit 1
  fi
fi

echo "Pre-commit checks passed."
exit 0
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

### Pre-push Hook for Build Verification

Create `.git/hooks/pre-push`:

```bash
#!/bin/sh

echo "Running pre-push checks..."

# For Jekyll sites
if [ -f "Gemfile" ]; then
  bundle exec jekyll build
  if [ $? -ne 0 ]; then
    echo "Jekyll build failed. Please fix errors before pushing."
    exit 1
  fi
fi

# For Node.js sites
if [ -f "package.json" ]; then
  npm run build
  if [ $? -ne 0 ]; then
    echo "Build failed. Please fix errors before pushing."
    exit 1
  fi
fi

echo "Pre-push checks passed."
exit 0
```

Make it executable:

```bash
chmod +x .git/hooks/pre-push
```

### Using Husky for Managed Git Hooks

For Node.js projects, [Husky](https://typicode.github.io/husky/) provides a more maintainable approach to Git hooks.

Install Husky:

```bash
npm install --save-dev husky
npx husky init
```

Create a pre-commit hook:

```bash
echo "npm run lint" > .husky/pre-commit
```

Create a pre-push hook:

```bash
echo "npm run build" > .husky/pre-push
```

Husky hooks are stored in the repository and shared across the team.

## Step 8: Verify Your Deployment

After pushing your changes:

1. Go to the **Actions** tab in your repository
2. Monitor the workflow execution
3. Once complete, visit your site at the configured URL

## Troubleshooting Common Issues

### Build Fails with Permission Errors

Ensure your workflow has the correct permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Custom Domain Not Working

- Verify DNS records have propagated (use `dig example.com`)
- Ensure the CNAME file contains only your domain
- Wait up to 24 hours for DNS propagation

### 404 Errors on Subpages

For single-page applications, create a `404.html` that redirects to your index:

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=/">
  <script>window.location.href = "/";</script>
</head>
<body>
  Redirecting...
</body>
</html>
```

### Assets Not Loading

Ensure your base URL is configured correctly:

- Jekyll: Set `baseurl` in `_config.yml`
- Eleventy: Configure `pathPrefix` in `.eleventy.js`
- Hugo: Set `baseURL` in `config.toml`

## GitHub Pages Limitations

Be aware of these limitations:

- **Repository size**: 1 GB recommended maximum
- **Site size**: 1 GB maximum
- **Bandwidth**: 100 GB per month soft limit
- **Builds**: 10 builds per hour soft limit
- **No server-side code**: Static files only

## Conclusion

GitHub Pages provides an excellent free hosting solution for static websites. Combined with GitHub Actions, you can automate your entire deployment pipeline with minimal configuration.

Key takeaways:

1. Create a repository and enable GitHub Pages
2. Configure GitHub Actions for automated builds
3. Set up a custom domain for a professional appearance
4. Use Git hooks to catch errors before deployment
5. Monitor your deployments through the Actions tab

For complex deployments or if you encounter issues, contact us at [assist@knowledgebasement.com](mailto:assist@knowledgebasement.com). We offer consulting services for a small fee to help you get your site up and running.
