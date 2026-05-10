// Applies layout + tags to every markdown file directly in this folder.
// Parses the event date from the filename pattern: YYYY-MM-DD_<slug>.md
const FILENAME_RE = /^(\d{4})-(\d{2})-(\d{2})/;

module.exports = {
  layout: "layouts/event.njk",
  tags: ["events", "europe"],
  pageType: "europe",
  region: "Europe",
  eleventyComputed: {
    eventDate: (data) => {
      const m = data.page.fileSlug.match(FILENAME_RE);
      if (!m) return data.page.date;
      const [, y, mo, d] = m;
      return new Date(`${y}-${mo}-${d}T00:00:00Z`);
    },
    permalink: (data) => {
      const m = data.page.fileSlug.match(FILENAME_RE);
      if (!m) return false;
      const slug = data.page.fileSlug;
      return `/europe/${slug}/index.html`;
    }
  }
};
