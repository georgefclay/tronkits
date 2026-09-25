// /lib/markdownCollection.js
// Reusable loader for a folder of Markdown files with YAML front matter
// (content/blog, content/tutorials, ...). Each collection gets the same
// behaviour: drafts hidden, newest first, plain-text excerpts, and
// sanitized HTML with the file's mtime as `updated`.
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
let marked; // loaded lazily (ESM-safe)
const sanitizeHtml = require('sanitize-html');

function safeSlug(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\- ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/\-+/g, '-');
}

function parseDate(value) {
  // supports "2026-01-08" etc.
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

async function renderMarkdownToHtml(md) {
  if (!marked) {
    const mod = await import('marked');
    marked = mod.marked;
  }

  const raw = marked.parse(md);
  return sanitizeHtml(raw, {
    // Tables/figures and a `class` on div/span/table let content keep the
    // odd bit of raw HTML markdown can't express.
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption'
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading'],
      code: ['class'],
      div: ['class'],
      span: ['class'],
      table: ['class']
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
    }
  });
}

// Strip markdown syntax so the auto-excerpt reads as plain text
function plainText(content) {
  return String(content)
    .replace(/```[\s\S]*?```/g, ' ')           // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')       // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')     // links -> text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')           // headings
    .replace(/^\s{0,3}>\s?/gm, '')                // blockquotes
    .replace(/\*\*|\*|`/g, '')                    // bold / italic / inline code
    .replace(/(^|\s)_+|_+(?=\s|[.,;:!?)]|$)/gm, '$1'); // _emphasis_ (keeps snake_case)
}

// dirName is relative to content/, e.g. 'blog' or 'tutorials'
function createCollection(dirName) {
  const DIR = path.join(process.cwd(), 'content', dirName);

  function getAll() {
    if (!fs.existsSync(DIR)) return [];

    const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
    const items = files.map(file => {
      const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
      const { data, content } = matter(raw);

      const slug = safeSlug(data.slug || path.basename(file, '.md'));
      const date = parseDate(data.date) || new Date(0);
      const excerpt =
        (data.excerpt && String(data.excerpt)) ||
        plainText(content).replace(/\s+/g, ' ').trim().slice(0, 220) + '…';

      return {
        // Every front-matter field is passed through (category, difficulty,
        // steps, ...); the normalised fields below win on conflicts.
        ...data,
        slug,
        title: data.title || slug,
        description: data.description || data.excerpt || '',
        excerpt,
        date,
        tags: Array.isArray(data.tags) ? data.tags : [],
        draft: !!data.draft,
        file
      };
    });

    // newest first, hide drafts by default
    return items
      .filter(p => !p.draft)
      .sort((a, b) => b.date - a.date);
  }

  async function getBySlug(slug) {
    const meta = getAll().find(p => p.slug === slug);
    if (!meta) return null;

    const fullPath = path.join(DIR, meta.file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);

    const html = await renderMarkdownToHtml(content);

    return {
      ...meta,
      html,
      updated: fs.statSync(fullPath).mtime,
      title: data.title || meta.title,
      description: data.description || meta.description || ''
    };
  }

  return { getAll, getBySlug };
}

module.exports = { createCollection };
