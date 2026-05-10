// One place to configure where the site is hosted. Update these two values
// once you've created your GitHub repo, then commit + push.
//
// Two common shapes:
//   1) Repo named "<your-user>.github.io"  → site is served at the root.
//        ORIGIN       = "https://<your-user>.github.io"
//        PATH_PREFIX  = "/"
//   2) Repo named anything else (e.g. "tech-events")  → site is served at /<repo>/
//        ORIGIN       = "https://<your-user>.github.io"
//        PATH_PREFIX  = "/<repo>/"   (must start AND end with "/")

const ORIGIN = "https://gezgingun.github.io";
const PATH_PREFIX = "/TechEventTracker/";

module.exports = {
  origin: ORIGIN,
  pathPrefix: PATH_PREFIX
};
