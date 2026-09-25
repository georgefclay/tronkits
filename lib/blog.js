// /lib/blog.js — content/blog/*.md (see lib/markdownCollection.js)
const { createCollection } = require('./markdownCollection');

const blog = createCollection('blog');

function getAllPosts() {
  return blog.getAll();
}

async function getPostBySlug(slug) {
  return blog.getBySlug(slug);
}

module.exports = { getAllPosts, getPostBySlug };
