// /routes/blog.js
const express = require('express');
const router = express.Router();

const { getAllPosts, getPostBySlug } = require('../lib/blog');

router.get('/', (req, res) => {
  const posts = getAllPosts();
  res.render('blog/index', {
    title: 'Blog - Tronkits',
    metaDescription: 'TronKits blog: practical tools, guides, and builds.',
    posts
  });
});

router.get('/:slug', async (req, res) => {
  const post = await getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).render('404', { title: 'Not Found - Tronkits' });
  }

  res.render('blog/post', {
    title: `${post.title} - Tronkits`,
    metaDescription: post.description || post.excerpt,
    post
  });
});


module.exports = router;
