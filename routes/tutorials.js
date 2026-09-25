// /routes/tutorials.js
const express = require('express');
const router = express.Router();

const { getAllTutorials, getTutorialBySlug } = require('../lib/tutorials');

router.get('/', (req, res) => {
  res.render('tutorials/index', {
    title: 'Tutorials – OpenSCAD, Raspberry Pi & Beginner Electronics | TronKits',
    metaDescription: 'Free step-by-step tutorials: build a parametric box and a rounded box in OpenSCAD, and host a Node site on a Raspberry Pi behind Nginx.',
    tutorials: getAllTutorials()
  });
});

router.get('/:slug', async (req, res) => {
  const tutorial = await getTutorialBySlug(req.params.slug);
  if (!tutorial) {
    return res.status(404).render('404', {
      title: 'Tutorial Not Found – TronKits',
      metaDescription: 'That tutorial does not exist on TronKits. Browse the OpenSCAD and Raspberry Pi tutorials or try the free electronics calculators.'
    });
  }

  res.render('tutorials/show', {
    title: `${tutorial.title} – Tutorial | TronKits`,
    metaDescription: tutorial.description || tutorial.excerpt,
    ogType: 'article',
    tutorial
  });
});

module.exports = router;
