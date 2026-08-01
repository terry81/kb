const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const postGlobs = ["_posts/*.html", "_posts/*.md"];

function cleanText(content = "") {
  return String(content)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(content = "", length = 160) {
  const text = cleanText(content);
  const maxLength = Number(length) || 160;

  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryName(category) {
  return category && typeof category === "object" ? category.name : category;
}

function isPublished(post) {
  return post.data.published !== false && post.data.status !== "draft" && post.data.status !== "private";
}

function getPosts(collectionApi) {
  return postGlobs
    .flatMap((glob) => collectionApi.getFilteredByGlob(glob))
    .filter(isPublished)
    .sort((a, b) => b.date - a.date);
}

function toDateTime(dateObj) {
  if (!dateObj) return null;

  const dateTime = dateObj instanceof Date
    ? DateTime.fromJSDate(dateObj, { zone: "utc" })
    : DateTime.fromISO(String(dateObj), { zone: "utc" });

  return dateTime.isValid ? dateTime : null;
}

module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);

  // Ignore files
  eleventyConfig.ignores.add("_site/**");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("supabase/**");

  // Passthrough copy - static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("kb.jpeg");
  eleventyConfig.addPassthroughCopy("b.jpg");
  eleventyConfig.addPassthroughCopy("ads.txt");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy(".nojekyll");

  // Date filters
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    const dateTime = toDateTime(dateObj);
    return dateTime ? dateTime.toISO({ suppressMilliseconds: true }) : "";
  });

  eleventyConfig.addFilter("dateToRfc2822", (dateObj) => {
    const dateTime = toDateTime(dateObj);
    return dateTime ? dateTime.toRFC2822() : "";
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const dateTime = toDateTime(dateObj);
    return dateTime ? dateTime.toFormat("LLLL dd, yyyy") : "";
  });

  eleventyConfig.addFilter("shortDate", (dateObj) => {
    const dateTime = toDateTime(dateObj);
    return dateTime ? dateTime.toFormat("LLL dd, yyyy") : "";
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    const dateTime = toDateTime(dateObj);
    return dateTime ? dateTime.toFormat("yyyy-LL-dd") : "";
  });

  eleventyConfig.addFilter("year", () => {
    return new Date().getFullYear();
  });

  // Strip HTML filter
  eleventyConfig.addFilter("stripHtml", cleanText);

  // Truncate filter
  eleventyConfig.addFilter("truncate", (str, len) => {
    return truncateText(str, len);
  });

  // Clean excerpt filter
  eleventyConfig.addFilter("excerpt", (content, len = 155) => {
    return truncateText(content, len);
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = cleanText(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  });

  // URL encode filter
  eleventyConfig.addFilter("urlencode", (str) => {
    if (!str) return "";
    return encodeURIComponent(str);
  });

  // Slug from URL filter
  eleventyConfig.addFilter("slugFromUrl", (url) => {
    if (!url) return "";
    return url.replace(/\//g, "").replace(".html", "");
  });

  // SEO and taxonomy filters
  eleventyConfig.addFilter("slugify", slugify);

  eleventyConfig.addFilter("toArray", toArray);

  eleventyConfig.addFilter("categoryUrl", (category) => {
    const slug = slugify(categoryName(category));
    return slug ? `/topics/${slug}/` : "/topics/";
  });

  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    try {
      return new URL(url || "/", base).toString();
    } catch (error) {
      return url || "";
    }
  });

  eleventyConfig.addFilter("json", (value) => {
    return JSON.stringify(value ?? "").replace(/</g, "\\u003c");
  });

  eleventyConfig.addFilter("startsWith", (value, prefix) => {
    return String(value || "").startsWith(prefix);
  });

  // Get unique categories from posts
  eleventyConfig.addFilter("getCategories", (posts) => {
    const categories = new Set();
    posts.forEach(post => {
      toArray(post.data.categories).forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  });

  eleventyConfig.addFilter("postsByCategory", (posts, category) => {
    const targetSlug = slugify(categoryName(category));

    return (posts || []).filter(post => {
      return toArray(post.data.categories).some(cat => slugify(cat) === targetSlug);
    });
  });

  eleventyConfig.addFilter("relatedPosts", (posts, currentUrl, categories, limit = 3) => {
    const currentCategories = toArray(categories).map(slugify);
    const scoredPosts = (posts || [])
      .filter(post => post.url !== currentUrl)
      .map(post => {
        const score = toArray(post.data.categories)
          .map(slugify)
          .filter(category => currentCategories.includes(category)).length;

        return { post, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.post.date - a.post.date)
      .map(item => item.post);

    const fallbackPosts = (posts || [])
      .filter(post => post.url !== currentUrl && !scoredPosts.includes(post));

    return scoredPosts.concat(fallbackPosts).slice(0, Number(limit) || 3);
  });

  eleventyConfig.addFilter("sitemapItems", (items) => {
    const excludedUrls = new Set(["/404.html", "/feed.xml", "/sitemap.xml"]);

    return (items || [])
      .filter(item => item.url)
      .filter(item => !item.data.noindex)
      .filter(item => item.data.permalink !== false)
      .filter(item => !excludedUrls.has(item.url))
      .filter(item => !item.url.startsWith("/populate_search_index"))
      .filter(item => !String(item.inputPath || "").endsWith("/topic.njk"))
      .sort((a, b) => a.url.localeCompare(b.url));
  });

  // Limit filter
  eleventyConfig.addFilter("limit", (arr, limit) => {
    return (arr || []).slice(0, limit);
  });

  // Posts collection (sorted by date descending)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return getPosts(collectionApi);
  });

  // Category collection for SEO-friendly topic landing pages
  eleventyConfig.addCollection("categories", function(collectionApi) {
    const categories = new Map();

    getPosts(collectionApi).forEach(post => {
      toArray(post.data.categories).forEach(category => {
        const slug = slugify(category);
        if (!slug) return;

        if (!categories.has(slug)) {
          categories.set(slug, { name: category, slug, count: 0 });
        }

        categories.get(slug).count += 1;
      });
    });

    return Array.from(categories.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  // Set Liquid options for Jekyll compatibility
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: false
  });

  // Watch targets
  eleventyConfig.addWatchTarget("./assets/");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["html", "md", "njk", "liquid"],
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
    passthroughFileCopy: true
  };
};
