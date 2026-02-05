const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

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

  // Date filters
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  eleventyConfig.addFilter("dateToRfc2822", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toRFC2822();
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLLL dd, yyyy");
  });

  eleventyConfig.addFilter("shortDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLL dd, yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("year", () => {
    return new Date().getFullYear();
  });

  // Strip HTML filter
  eleventyConfig.addFilter("stripHtml", (content) => {
    if (!content) return "";
    return content.replace(/<[^>]*>/g, "");
  });

  // Truncate filter
  eleventyConfig.addFilter("truncate", (str, len) => {
    if (!str) return "";
    if (str.length <= len) return str;
    return str.substring(0, len) + "...";
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

  // Get unique categories from posts
  eleventyConfig.addFilter("getCategories", (posts) => {
    const categories = new Set();
    posts.forEach(post => {
      if (post.data.categories) {
        if (Array.isArray(post.data.categories)) {
          post.data.categories.forEach(cat => categories.add(cat));
        } else {
          categories.add(post.data.categories);
        }
      }
    });
    return Array.from(categories).sort();
  });

  // Limit filter
  eleventyConfig.addFilter("limit", (arr, limit) => {
    return arr.slice(0, limit);
  });

  // Posts collection (sorted by date descending)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/*.html")
      .concat(collectionApi.getFilteredByGlob("_posts/*.md"))
      .sort((a, b) => b.date - a.date);
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
