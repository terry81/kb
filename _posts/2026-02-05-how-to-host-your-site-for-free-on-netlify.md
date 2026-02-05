---
layout: post
title: 'How to Host Your Site for Free on Netlify'
date: 2026-02-05 15:00:00.000000000 +02:00
type: post
parent_id: '0'
published: true
password: ''
status: publish
categories:
- Web Development
permalink: "/host-site-free-netlify/"
---

# How to Host Your Site for Free on Netlify

Netlify is a powerful platform for hosting static websites and modern web applications. It offers a generous free tier that includes continuous deployment, custom domains, HTTPS, serverless functions, and form handling. This guide walks you through deploying your site on Netlify and configuring automated deployments.

## Why Choose Netlify?

Netlify offers several advantages over traditional hosting:

- **Continuous deployment**: Automatic builds and deploys on every Git push
- **Global CDN**: Fast content delivery worldwide
- **Free SSL certificates**: Automatic HTTPS for all sites
- **Serverless functions**: Run backend code without managing servers
- **Form handling**: Process form submissions without a backend
- **Split testing**: A/B test different branches
- **Deploy previews**: Preview changes before merging pull requests

## Prerequisites

Before proceeding, ensure you have:

- A static website ready for deployment (HTML, Jekyll, Eleventy, Hugo, Next.js, etc.)
- A GitHub, GitLab, or Bitbucket account (recommended for continuous deployment)
- A Netlify account (free to create)

## Method 1: Deploy via Git Integration (Recommended)

This method provides automatic deployments whenever you push changes to your repository.

### Step 1: Push Your Site to a Git Repository

If your site isn't already in a Git repository:

```bash
cd your-site-directory
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<username>/<repository>.git
git push -u origin main
```

### Step 2: Create a Netlify Account

1. Go to [netlify.com](https://www.netlify.com/)
2. Click **Sign up**
3. Sign up with your GitHub, GitLab, or Bitbucket account for seamless integration

### Step 3: Connect Your Repository

1. From the Netlify dashboard, click **Add new site** → **Import an existing project**
2. Select your Git provider (GitHub, GitLab, or Bitbucket)
3. Authorize Netlify to access your repositories
4. Select the repository containing your site

### Step 4: Configure Build Settings

Netlify will attempt to detect your site's framework automatically. Verify or configure:

**For Jekyll sites:**
- Build command: `jekyll build`
- Publish directory: `_site`

**For Eleventy sites:**
- Build command: `npm run build` or `npx @11ty/eleventy`
- Publish directory: `_site`

**For Hugo sites:**
- Build command: `hugo`
- Publish directory: `public`

**For Next.js static export:**
- Build command: `npm run build`
- Publish directory: `out`

**For plain HTML sites:**
- Build command: (leave empty)
- Publish directory: `.` or the folder containing your HTML files

### Step 5: Deploy Your Site

Click **Deploy site**. Netlify will:

1. Clone your repository
2. Run the build command
3. Deploy the output to its global CDN

Your site will be available at a random subdomain like `random-name-123456.netlify.app`.

## Method 2: Deploy via Drag and Drop

For quick deployments without Git integration:

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your site folder onto the page
3. Your site will be deployed immediately

This method is useful for testing but doesn't provide continuous deployment.

## Method 3: Deploy via Netlify CLI

The Netlify CLI provides command-line control over your deployments.

### Install the CLI

```bash
npm install -g netlify-cli
```

### Authenticate

```bash
netlify login
```

### Initialize Your Site

```bash
cd your-site-directory
netlify init
```

Follow the prompts to connect to an existing site or create a new one.

### Deploy Manually

For a draft deployment (preview URL):

```bash
netlify deploy
```

For a production deployment:

```bash
netlify deploy --prod
```

### Deploy with Build

To run your build command before deploying:

```bash
netlify deploy --build --prod
```

## Configuring Your Site with netlify.toml

Create a `netlify.toml` file in your repository root for advanced configuration:

```toml
[build]
  command = "npm run build"
  publish = "_site"

[build.environment]
  NODE_VERSION = "20"

# Redirects
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301

# Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self'"

# Branch-specific settings
[context.production]
  command = "npm run build"

[context.deploy-preview]
  command = "npm run build:preview"

[context.branch-deploy]
  command = "npm run build:branch"
```

## Setting Up a Custom Domain

### Step 1: Add Your Domain in Netlify

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `example.com`)
4. Click **Verify** and then **Add domain**

### Step 2: Configure DNS

You have two options:

**Option A: Use Netlify DNS (Recommended)**

1. In Domain management, click **Options** → **Set up Netlify DNS**
2. Update your domain's nameservers at your registrar to:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`

**Option B: Use External DNS**

Add these DNS records at your registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | 75.2.60.5 |
| CNAME | www | `your-site.netlify.app` |

### Step 3: Enable HTTPS

Netlify provides free SSL certificates via Let's Encrypt:

1. Go to **Site settings** → **Domain management** → **HTTPS**
2. Click **Verify DNS configuration**
3. Once verified, click **Provision certificate**

HTTPS is automatically enabled and renewed.

## Configuring Build Hooks

Build hooks allow you to trigger deployments from external services.

### Create a Build Hook

1. Go to **Site settings** → **Build & deploy** → **Build hooks**
2. Click **Add build hook**
3. Name your hook (e.g., "CMS Update")
4. Select the branch to build
5. Copy the generated URL

### Trigger a Build

```bash
curl -X POST -d {} https://api.netlify.com/build_hooks/your-hook-id
```

Use build hooks to:

- Trigger builds from a headless CMS
- Schedule builds with cron jobs
- Integrate with other services via webhooks

## Setting Up Deploy Notifications

Configure notifications for deployment events:

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Click **Add notification**
3. Choose a notification type:
   - Email
   - Slack
   - Webhook
   - GitHub commit status

Example webhook notification for successful deploys:

```json
{
  "id": "deploy-id",
  "site_id": "site-id",
  "build_id": "build-id",
  "state": "ready",
  "name": "your-site",
  "url": "https://your-site.netlify.app",
  "ssl_url": "https://your-site.netlify.app",
  "admin_url": "https://app.netlify.com/sites/your-site",
  "deploy_url": "https://deploy-id--your-site.netlify.app",
  "published_at": "2026-02-05T15:00:00.000Z"
}
```

## Using Netlify Functions

Netlify Functions allow you to run serverless backend code.

### Create a Function

Create `netlify/functions/hello.js`:

```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Functions!" })
  };
};
```

### Access Your Function

Your function is available at:

```
https://your-site.netlify.app/.netlify/functions/hello
```

### Configure Functions Directory

In `netlify.toml`:

```toml
[functions]
  directory = "netlify/functions"
```

## Handling Forms

Netlify can process form submissions without a backend.

### Add a Form to Your Site

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact">
  <p>
    <label>Name: <input type="text" name="name" required></label>
  </p>
  <p>
    <label>Email: <input type="email" name="email" required></label>
  </p>
  <p>
    <label>Message: <textarea name="message" required></textarea></label>
  </p>
  <p>
    <button type="submit">Send</button>
  </p>
</form>
```

### View Submissions

Form submissions are available in the Netlify dashboard under **Forms**.

### Add Spam Protection

Enable reCAPTCHA or honeypot fields:

```html
<form name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact">
  <p class="hidden">
    <label>Don't fill this out: <input name="bot-field"></label>
  </p>
  <!-- rest of form -->
</form>
```

## Environment Variables

Store sensitive data securely using environment variables.

### Add Variables in Netlify

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Enter the key and value
4. Choose the scope (all deploys, production, or deploy previews)

### Access in Build

Environment variables are available during build:

```javascript
// In your build script
const apiKey = process.env.API_KEY;
```

### Access in Functions

```javascript
exports.handler = async (event, context) => {
  const apiKey = process.env.API_KEY;
  // Use apiKey securely
};
```

## Deploy Previews for Pull Requests

Netlify automatically creates deploy previews for pull requests:

1. Open a pull request on your repository
2. Netlify builds the branch and creates a unique preview URL
3. The preview URL is posted as a comment on the pull request
4. Review changes before merging

Configure in `netlify.toml`:

```toml
[context.deploy-preview]
  command = "npm run build:preview"

[context.deploy-preview.environment]
  PREVIEW_MODE = "true"
```

## Netlify Free Tier Limits

The free tier includes generous limits:

| Feature | Limit |
|---------|-------|
| Bandwidth | 100 GB/month |
| Build minutes | 300 minutes/month |
| Sites | Unlimited |
| Team members | 1 |
| Serverless functions | 125,000 requests/month |
| Form submissions | 100/month |
| Identity (auth) | 1,000 users |

## Troubleshooting Common Issues

### Build Fails

Check the build logs in the Netlify dashboard:

1. Go to **Deploys**
2. Click on the failed deploy
3. Review the build log for errors

Common issues:

- Missing dependencies in `package.json`
- Incorrect Node.js version (specify in `netlify.toml`)
- Build command typos

### 404 Errors on Page Refresh (SPAs)

For single-page applications, add a redirect rule:

In `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Or create a `_redirects` file:

```
/*    /index.html   200
```

### Assets Not Loading

Ensure your publish directory is correct and all assets are included in the build output.

### Custom Domain Not Working

- Verify DNS records have propagated
- Check that the domain is verified in Netlify
- Ensure HTTPS certificate is provisioned

## Conclusion

Netlify provides a robust, free hosting solution for static sites and modern web applications. Its seamless Git integration, automatic deployments, and built-in features like functions and forms make it an excellent choice for developers.

Key takeaways:

1. Connect your Git repository for continuous deployment
2. Configure build settings in `netlify.toml`
3. Set up a custom domain with free SSL
4. Use build hooks for external triggers
5. Leverage serverless functions for backend logic
6. Enable form handling without a backend

For assistance with Netlify deployments or complex configurations, contact us at [assist@knowledgebasement.com](mailto:assist@knowledgebasement.com). We offer consulting services for a small fee to help you get your site deployed and running smoothly.
