import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import kebabcase from "lodash.kebabcase";

const read = path => readFileSync(path, "utf8");
const rss = read("dist/rss.xml");
const sitemap = read("dist/sitemap-0.xml");
let posts = 0;
const tags = new Set();

// A snapshot of the 15 posts published before this upgrade. New posts are not
// constrained to the old frontmatter or OG conventions by this migration check.
const legacyPosts = JSON.parse(read("scripts/fixtures/legacy-posts.json"));
for (const { slug, tags: postTags } of legacyPosts) {
  const path = `/posts/${slug}`;
  const html = read(`dist${path}/index.html`);
  assert.ok(html.includes('lang="zh"'), `${path}: Chinese document language`);
  assert.ok(html.includes("data-pagefind-body"), `${path}: search indexing`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(
    decodeURI(canonical).replace(/\/$/, ""),
    `https://tach.cc${path}`
  );
  assert.ok(decodeURI(rss).includes(path), `${path}: RSS link`);
  assert.ok(decodeURI(sitemap).includes(path), `${path}: sitemap link`);
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.ok(og, `${path}: OG image`);
  const image = readFileSync(`dist${decodeURIComponent(new URL(og).pathname)}`);
  assert.equal(image.subarray(1, 4).toString(), "PNG");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  assert.equal((html.match(/property="og:type"/g) ?? []).length, 1);
  assert.ok(
    html.includes(
      "https://github.com/ch1lam/ch1lam.github.io/edit/master/src/content/blog/"
    )
  );
  for (const tag of postTags) tags.add(kebabcase(tag));
  posts++;
}
for (const tag of tags)
  assert.ok(
    existsSync(`dist/tags/${tag}/index.html`),
    `Legacy tag URL: ${tag}`
  );
assert.ok((rss.match(/<item>/g) ?? []).length >= posts);
assert.ok(read("dist/index.html").includes("你好👋，我是 Chilam"));
assert.ok(read("dist/about/index.html").includes("Tachikoma"));
assert.ok(existsSync("dist/pagefind/pagefind.js"));
assert.ok(JSON.parse(read("dist/pagefind/pagefind-entry.json")).languages.zh);

// Check every generated internal page/image link, including pagination and article assets.
const htmlFiles = readdirSync("dist", { recursive: true }).filter(p =>
  p.endsWith(".html")
);
const missing = new Set();
for (const file of htmlFiles) {
  const base = new URL(file.replace(/index\.html$/, ""), "https://tach.cc/");
  for (const [, raw] of read(join("dist", file)).matchAll(
    /(?:href|src)="([^"]+)"/g
  )) {
    if (/^(?:#|mailto:|tel:|data:|javascript:)/.test(raw)) continue;
    // The unchanged Hexo demonstration article contains unrendered LaTeX that
    // Markdown interprets as this relative link; it predates this migration.
    if (file === "posts/博客功能测试-旧框架-Hexo/index.html" && raw === "x-x_0")
      continue;
    const url = new URL(raw.replaceAll("&amp;", "&"), base);
    if (url.origin !== "https://tach.cc") continue;
    // These Vercel endpoints are provided by the hosting platform.
    if (url.pathname.startsWith("/_vercel/")) continue;
    const target = join("dist", decodeURIComponent(url.pathname));
    if (!existsSync(target) && !existsSync(join(target, "index.html")))
      missing.add(`${file}: ${raw}`);
  }
}
assert.deepEqual([...missing], [], "Broken internal links/assets");
process.stdout.write(
  `Verified ${posts} published posts, ${tags.size} legacy tags, RSS, sitemap, Chinese search index, OG images and links across ${htmlFiles.length} pages.\n`
);
