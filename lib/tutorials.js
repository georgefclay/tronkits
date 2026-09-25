// /lib/tutorials.js — content/tutorials/*.md (see lib/markdownCollection.js)
const { createCollection } = require('./markdownCollection');

const tutorials = createCollection('tutorials');

function getAllTutorials() {
  return tutorials.getAll();
}

async function getTutorialBySlug(slug) {
  return tutorials.getBySlug(slug);
}

module.exports = { getAllTutorials, getTutorialBySlug };
