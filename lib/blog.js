// /lib/blog.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
let marked; // loaded lazily (ESM-safe)
const sanitizeHtml = require('sanitize-html');

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

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
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'pre', 'code'
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading'],
      code: ['class']
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
    }
  });
}

function getAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const fullPath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);

    const slug = safeSlug(data.slug || path.basename(file, '.md'));
    const date = parseDate(data.date) || new Date(0);

    // For list page
    const excerpt =
      (data.excerpt && String(data.excerpt)) ||
      String(content).replace(/\s+/g, ' ').trim().slice(0, 220) + '…';

    return {
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
  return posts
    .filter(p => !p.draft)
    .sort((a, b) => b.date - a.date);
}

async function getPostBySlug(slug) {
  const all = getAllPosts();
  const meta = all.find(p => p.slug === slug);
  if (!meta) return null;

  const fullPath = path.join(BLOG_DIR, meta.file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

  const html = await renderMarkdownToHtml(content);

  return {
    ...meta,
    html,
    title: data.title || meta.title,
    description: data.description || meta.description || ''
  };
}

module.exports = { getAllPosts, getPostBySlug };
