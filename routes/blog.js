// /routes/blog.js
const express = require('express');
const router = express.Router();

const { getAllPosts, getPostBySlug } = require('../lib/blog');

router.get('/', (req, res) => {
  const posts = getAllPosts();
  res.render('blog/index', {
    title: 'Blog – Electronics, Maker & Dev Field Notes | TronKits',
    metaDescription: 'TronKits field notes: practical write-ups on resistor color codes, Ohm\'s law, CSV files, passphrases and building with AI. Free to read, no login.',
    posts
  });
});

router.get('/:slug', async (req, res) => {
  const post = await getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).render('404', {
      title: 'Post Not Found – TronKits',
      metaDescription: 'That blog post does not exist on TronKits. Browse the field notes on the blog or try the free electronics calculators.'
    });
  }

  res.render('blog/post', {
    title: `${post.title} - Tronkits`,
    metaDescription: post.description || post.excerpt,
    ogType: 'article',
    post
  });
});


module.exports = router;
