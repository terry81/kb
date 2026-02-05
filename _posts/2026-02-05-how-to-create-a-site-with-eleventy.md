---
layout: post
title: 'How to Create a Site with Eleventy (11ty)'
date: 2026-02-05 10:00:00.000000000 +02:00
type: post
parent_id: '0'
published: true
password: ''
status: publish
categories:
- Web Development
permalink: "/create-site-with-eleventy/"
---

# How to Create a Site with Eleventy (11ty)

Eleventy (11ty) is a simple, fast, and flexible static site generator built with JavaScript. Unlike other static site generators, Eleventy doesn't force you to use a specific templating language or framework. It supports multiple template languages including HTML, Markdown, Nunjucks, Liquid, and more. In this guide, we'll walk you through creating your first site with Eleventy.

## Prerequisites

Before you begin, make sure you have Node.js installed on your machine. You can verify this by running:

```bash
node --version
npm --version
```

You'll need Node.js version 14 or higher.

## Step 1: Create a New Project

First, create a new directory for your project and initialize it with npm:

```bash
mkdir my-eleventy-site
cd my-eleventy-site
npm init -y
```

## Step 2: Install Eleventy

Install Eleventy as a development dependency:

```bash
npm install --save-dev @11ty/eleventy
```

## Step 3: Create Your First Template

Create an `index.md` file in your project root:

```markdown
# Welcome to My Eleventy Site

This is my first page built with Eleventy!
```

## Step 4: Run Eleventy

You can now run Eleventy to build your site:

```bash
npx @11ty/eleventy
```

This will create a `_site` folder containing your generated static files.

To run a local development server with hot reloading:

```bash
npx @11ty/eleventy --serve
```

Your site will be available at `http://localhost:8080`.

## Step 5: Add npm Scripts

For convenience, add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "eleventy",
    "start": "eleventy --serve"
  }
}
```

Now you can use `npm start` for development and `npm run build` for production builds.

## Step 6: Create a Layout

Layouts help you maintain consistent structure across pages. Create a `_includes` folder and add a layout file:

```bash
mkdir _includes
```

Create `_includes/base.njk`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
</head>
<body>
    <header>
        <nav>
            <a href="/">Home</a>
            <a href="/about/">About</a>
        </nav>
    </header>
    <main>
        {{ content | safe }}
    </main>
    <footer>
        <p>&copy; 2026 My Eleventy Site</p>
    </footer>
</body>
</html>
```

## Step 7: Use the Layout

Update your `index.md` to use the layout:

```markdown
---
layout: base.njk
title: Home
---

# Welcome to My Eleventy Site

This is my first page built with Eleventy!
```

## Step 8: Create a Configuration File

Create an `.eleventy.js` file in your project root to customize Eleventy:

```javascript
module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");

  // Set custom directories
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
```

## Step 9: Add Styles

Create a `css` folder and add a stylesheet:

```bash
mkdir css
```

Create `css/style.css`:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

header {
  margin-bottom: 2rem;
}

nav a {
  margin-right: 1rem;
}

main {
  min-height: 60vh;
}

footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #ccc;
}
```

Update your layout to include the stylesheet:

```html
<link rel="stylesheet" href="/css/style.css">
```

## Step 10: Create a Blog Collection

Eleventy makes it easy to create collections for blog posts. Create a `posts` folder:

```bash
mkdir posts
```

Create your first blog post at `posts/my-first-post.md`:

```markdown
---
layout: base.njk
title: My First Post
date: 2026-02-05
tags: posts
---

# My First Blog Post

This is my first blog post using Eleventy!
```

To display posts on your homepage, update `index.md`:

```markdown
---
layout: base.njk
title: Home
---

# Welcome to My Blog

{% for post in collections.posts reversed %}
  <article>
    <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
    <time>{{ post.date | date: "%Y-%m-%d" }}</time>
  </article>
{% endfor %}
```

## Deploying Your Site

Eleventy generates static files in the `_site` folder. You can deploy these files to any static hosting service:

- **GitHub Pages**: Push your `_site` folder to a `gh-pages` branch
- **Netlify**: Connect your repository and set the build command to `npm run build`
- **Vercel**: Similar to Netlify, just connect your repo
- **Cloudflare Pages**: Connect your repository and configure the build settings

## Conclusion

You've now created a basic Eleventy site with layouts, styles, and a blog collection. Eleventy's flexibility allows you to expand this foundation with additional features like:

- Data files for global site data
- Custom filters and shortcodes
- Multiple template languages
- Pagination for large collections
- RSS feeds

Eleventy's simplicity and speed make it an excellent choice for blogs, documentation sites, and portfolios. Check out the [official Eleventy documentation](https://www.11ty.dev/docs/) to explore more features and capabilities.
