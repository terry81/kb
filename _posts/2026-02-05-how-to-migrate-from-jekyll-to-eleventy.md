---
layout: post
title: 'How to Migrate a Site from Jekyll to Eleventy (11ty)'
date: 2026-02-05 12:00:00.000000000 +02:00
type: post
parent_id: '0'
published: true
password: ''
status: publish
categories:
- Web Development
permalink: "/migrate-from-jekyll-to-eleventy/"
---

# How to Migrate a Site from Jekyll to Eleventy (11ty)

Jekyll has been a popular static site generator for years, especially for GitHub Pages. However, many developers are now migrating to Eleventy (11ty) for its speed, flexibility, and JavaScript-based ecosystem. In this guide, we'll walk you through the process of migrating your Jekyll site to Eleventy.

## Why Migrate from Jekyll to Eleventy?

Before we dive in, here are some reasons to consider the switch:

- **Faster build times**: Eleventy is significantly faster than Jekyll
- **No Ruby dependency**: Eleventy runs on Node.js, which is more common in modern web development
- **Template flexibility**: Use any template language (Nunjucks, Liquid, Markdown, etc.)
- **Simpler configuration**: Less magic, more control
- **Active development**: Eleventy has a vibrant community and frequent updates

## Step 1: Set Up Your New Eleventy Project

First, create a new directory and initialize your Eleventy project:

```bash
mkdir my-eleventy-site
cd my-eleventy-site
npm init -y
npm install --save-dev @11ty/eleventy
```

## Step 2: Understand the Directory Structure Differences

Jekyll and Eleventy have similar but different conventions:

| Jekyll | Eleventy | Purpose |
|--------|----------|---------|
| `_posts/` | `posts/` or `blog/` | Blog posts |
| `_layouts/` | `_includes/` | Layout templates |
| `_includes/` | `_includes/` | Partial templates |
| `_data/` | `_data/` | Data files |
| `_config.yml` | `.eleventy.js` | Configuration |
| `_site/` | `_site/` | Output directory |

## Step 3: Create the Eleventy Configuration

Create an `.eleventy.js` file to configure your site:

```javascript
module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");

  // If you're using Liquid templates (like Jekyll)
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: false
  });

  // Add a date filter similar to Jekyll's
  eleventyConfig.addFilter("date", function(date, format) {
    const d = new Date(date);
    if (format === "%Y-%m-%d") {
      return d.toISOString().split('T')[0];
    }
    if (format === "%B %d, %Y") {
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return d.toDateString();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk"
  };
};
```

## Step 4: Migrate Your Posts

Jekyll posts use the naming convention `YYYY-MM-DD-title.md`. Eleventy doesn't require this format, but you can keep it for organization.

### Create a Posts Directory

```bash
mkdir -p src/posts
```

### Copy Your Posts

Copy your Jekyll posts from `_posts/` to `src/posts/`:

```bash
cp -r _posts/* src/posts/
```

### Update Front Matter

Jekyll and Eleventy front matter is similar, but you may need to make adjustments:

**Jekyll front matter:**
```yaml
---
layout: post
title: "My Blog Post"
date: 2026-02-05 10:00:00 +0200
categories: jekyll update
---
```

**Eleventy front matter:**
```yaml
---
layout: post.njk
title: "My Blog Post"
date: 2026-02-05
tags: 
  - posts
  - jekyll
  - update
---
```

Key changes:
- Update `layout` to include the file extension (e.g., `post.njk`)
- Convert `categories` to `tags` (Eleventy uses tags for collections)
- Simplify the date format

### Create a Posts Data File

Create `src/posts/posts.json` to apply default settings to all posts:

```json
{
  "layout": "post.njk",
  "tags": "posts",
  "permalink": "/{{ page.fileSlug }}/"
}
```

## Step 5: Migrate Your Layouts

Jekyll layouts go in `_layouts/`, while Eleventy uses `_includes/` for both layouts and partials.

### Convert Layout Files

Copy your Jekyll layouts and convert them:

**Jekyll `_layouts/default.html`:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>{{ page.title }} | {{ site.title }}</title>
  {% include head.html %}
</head>
<body>
  {% include header.html %}
  <main>
    {{ content }}
  </main>
  {% include footer.html %}
</body>
</html>
```

**Eleventy `_includes/default.njk`:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }} | {{ site.title }}</title>
  {% include "head.njk" %}
</head>
<body>
  {% include "header.njk" %}
  <main>
    {{ content | safe }}
  </main>
  {% include "footer.njk" %}
</body>
</html>
```

Key differences:
- Use `{{ content | safe }}` instead of `{{ content }}` to render HTML
- Include paths need quotes: `{% include "file.njk" %}`
- Access front matter directly: `{{ title }}` instead of `{{ page.title }}`

### Convert Post Layout

**Eleventy `_includes/post.njk`:**
```html
---
layout: default.njk
---
<article>
  <header>
    <h1>{{ title }}</h1>
    <time datetime="{{ date | date: '%Y-%m-%d' }}">
      {{ date | date: '%B %d, %Y' }}
    </time>
  </header>
  <div class="post-content">
    {{ content | safe }}
  </div>
</article>
```

## Step 6: Migrate Site Variables

Jekyll uses `_config.yml` for site-wide variables. In Eleventy, use `_data/site.json`:

**Jekyll `_config.yml`:**
```yaml
title: My Awesome Blog
description: A blog about web development
url: https://example.com
author: John Doe
```

**Eleventy `src/_data/site.json`:**
```json
{
  "title": "My Awesome Blog",
  "description": "A blog about web development",
  "url": "https://example.com",
  "author": "John Doe"
}
```

Access these in templates with `{{ site.title }}`, `{{ site.author }}`, etc.

## Step 7: Handle Jekyll-Specific Liquid Tags

Some Jekyll Liquid tags don't exist in Eleventy and need to be replaced:

### post_url Tag

**Jekyll:**
```liquid
{% post_url 2026-02-05-my-post %}
```

**Eleventy:**
```liquid
/my-post/
```
Or use a collection filter to find the URL dynamically.

### highlight Tag

**Jekyll:**
```liquid
{% highlight javascript %}
const x = 1;
{% endhighlight %}
```

**Eleventy (use fenced code blocks):**
````markdown
```javascript
const x = 1;
```
````

To add syntax highlighting, install a plugin:

```bash
npm install --save-dev @11ty/eleventy-plugin-syntaxhighlight
```

Add to `.eleventy.js`:

```javascript
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  // ... rest of config
};
```

## Step 8: Create Collections for Posts

In Jekyll, posts in `_posts/` are automatically available. In Eleventy, use tags or custom collections.

### Using Tags (Recommended)

Add `tags: posts` to your post front matter, then access with:

```liquid
{% for post in collections.posts reversed %}
  <article>
    <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
    <time>{{ post.date | date: "%Y-%m-%d" }}</time>
  </article>
{% endfor %}
```

### Custom Collection

In `.eleventy.js`:

```javascript
eleventyConfig.addCollection("posts", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => {
    return b.date - a.date; // Sort by date descending
  });
});
```

## Step 9: Migrate Pagination

Jekyll and Eleventy handle pagination differently.

**Eleventy pagination in `src/blog.njk`:**
```yaml
---
layout: default.njk
title: Blog
pagination:
  data: collections.posts
  size: 10
  reverse: true
  alias: posts
permalink: "blog/{% if pagination.pageNumber > 0 %}page/{{ pagination.pageNumber + 1 }}/{% endif %}"
---

<h1>Blog</h1>

{% for post in posts %}
  <article>
    <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
  </article>
{% endfor %}

<nav>
  {% if pagination.href.previous %}
    <a href="{{ pagination.href.previous }}">Previous</a>
  {% endif %}
  {% if pagination.href.next %}
    <a href="{{ pagination.href.next }}">Next</a>
  {% endif %}
</nav>
```

## Step 10: Update npm Scripts

Add build scripts to `package.json`:

```json
{
  "scripts": {
    "build": "eleventy",
    "start": "eleventy --serve",
    "clean": "rm -rf _site"
  }
}
```

## Step 11: Test Your Migration

Run the development server to test:

```bash
npm start
```

Check for:
- Broken links
- Missing images
- Layout issues
- Date formatting problems
- Syntax highlighting

## Common Migration Issues and Solutions

### Issue: Dates Display as "Invalid Date"

Ensure dates in front matter are valid:

```yaml
# Good
date: 2026-02-05

# Also good
date: 2026-02-05T10:00:00

# Avoid complex formats
```

### Issue: Liquid Includes Not Working

Update include syntax to use quotes:

```liquid
# Jekyll
{% include header.html %}

# Eleventy
{% include "header.njk" %}
```

### Issue: Site Variables Not Available

Make sure you created `_data/site.json` and your input directory is configured correctly.

### Issue: Posts Not Showing

Ensure posts have `tags: posts` in front matter or configure a custom collection.

## Deployment

If you were using GitHub Pages with Jekyll, you'll need to update your deployment:

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

## Conclusion

Migrating from Jekyll to Eleventy requires some work, but the benefits are worth it:

- Faster builds
- Modern JavaScript ecosystem
- More flexibility
- Active community

The key steps are:
1. Set up your Eleventy project
2. Migrate posts and update front matter
3. Convert layouts to Nunjucks or keep using Liquid
4. Move site config to `_data/site.json`
5. Update Jekyll-specific Liquid tags
6. Configure collections
7. Test thoroughly

For more information, check out the [Eleventy documentation](https://www.11ty.dev/docs/) and the [Eleventy from Scratch course](https://learneleventyfromscratch.com/).
