const site = require("./_data/site.js");

function absUrl(path) {
  const p = path.startsWith("/") ? path : "/" + path;
  return site.origin + site.pathPrefix.replace(/\/$/, "") + p;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("absUrl", absUrl);

  // Human-readable date for event listings, e.g. "Jun 3, 2026"
  eleventyConfig.addFilter("eventDate", (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    })
  );

  // Sort events ascending by date, then drop anything before today (UTC).
  eleventyConfig.addFilter("upcomingByDate", (collection) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return [...collection]
      .filter((item) => {
        // Use the event's curated date (set by the data files) when present.
        const dt = item.data.eventDate ? new Date(item.data.eventDate) : new Date(item.date);
        return dt >= today;
      })
      .sort((a, b) => {
        const da = new Date(a.data.eventDate || a.date);
        const db = new Date(b.data.eventDate || b.date);
        return da - db;
      });
  });

  return {
    dir: { input: ".", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: site.pathPrefix
  };
};
