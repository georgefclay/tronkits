const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// NEW: Passphrase API router (Option 2: Node/Express calling Python)
const passphraseRoutes = require('./routes/passphrases');

const app = express();

// Routers

// --- App config ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
// Static assets (CSS/JS/images)
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Trust proxy (needed when behind Nginx / reverse proxy)
app.set('trust proxy', true);

// STL download folder (must match where /generate-stl writes output)
const STL_DIR = path.join(__dirname, process.env.STL_PATH || 'stl_output');
app.use('/stl_output', express.static(STL_DIR));

// ------------------------------
// Page logging (NDJSON)
// ------------------------------
const dataDir = path.join(__dirname, 'data');
const logFilePath = path.join(dataDir, 'page_hits.log');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

app.use((req, res, next) => {
  const hit = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.originalUrl
  };

  fs.appendFile(logFilePath, JSON.stringify(hit) + '\n', (err) => {
    if (err) console.error('Error appending to log file:', err.message);
  });

  next();
});

// Global SEO locals (prevents "req is not defined" in EJS)
const SITE_URL = (process.env.SITE_URL || 'https://tronkits.com').replace(/\/+$/, '');
app.use((req, res, next) => {
  res.locals.siteUrl = SITE_URL;
  res.locals.canonicalUrl = SITE_URL + req.originalUrl;
  // Only set if not already set by a route
  if (typeof res.locals.metaDescription === 'undefined') res.locals.metaDescription = '';
  next();
});

// --- Routes ---
app.get('/', (req, res) => {
  res.render('index', { title: 'Home - Tronkits' });
});

app.get('/tutorials', (req, res) => {
  res.render('tutorials', { title: 'Tutorials - Tronkits' });
});

// Passphrase API (existing route file)


// Blog (Markdown-powered) routes
// NOTE: create this file: /routes/blog.js
const blogRoutes = require('./routes/blog');
app.use('/blog', blogRoutes);

// sitemap.xml (includes static pages + blog slugs)
app.get('/sitemap.xml', (req, res) => {
  try {
    // Base URLs you want indexed
    const urls = [
      { loc: '/', changefreq: 'weekly', priority: 1.0 },
      { loc: '/blog', changefreq: 'weekly', priority: 0.7 },
      { loc: '/tutorials', changefreq: 'monthly', priority: 0.7 },
      { loc: '/contact', changefreq: 'yearly', priority: 0.3 },
      { loc: '/scad', changefreq: 'monthly', priority: 0.4 },
      { loc: '/utility', changefreq: 'monthly', priority: 0.5 },
      { loc: '/ohms-law', changefreq: 'monthly', priority: 0.6 },
      { loc: '/resistor', changefreq: 'monthly', priority: 0.6 },
      { loc: '/555', changefreq: 'monthly', priority: 0.6 },
      { loc: '/voltage-divider', changefreq: 'monthly', priority: 0.6 },
      { loc: '/led-resistor', changefreq: 'monthly', priority: 0.6 },
      { loc: '/passphrases', changefreq: 'monthly', priority: 0.6 },
      { loc: '/csv-viewer', changefreq: 'monthly', priority: 0.6 },
      { loc: '/project-tracker', changefreq: 'monthly', priority: 0.5 }
    ];

    // Try to add blog posts automatically (if the loader exists)
    try {
      const { getAllPosts } = require('./lib/blog');
      const posts = (typeof getAllPosts === 'function') ? getAllPosts() : [];
      posts.forEach(p => {
        urls.push({ loc: `/blog/${p.slug}`, changefreq: 'monthly', priority: 0.6 });
      });
    } catch (_) {
      // ignore — blog loader not present yet
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => {
        const full = SITE_URL + u.loc;
        return `  <url>` +
          `<loc>${full}</loc>` +
          (u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : '') +
          (typeof u.priority === 'number' ? `<priority>${u.priority.toFixed(1)}</priority>` : '') +
          `</url>`;
      }).join('\n') +
      `\n</urlset>\n`;

    res.type('application/xml').send(xml);
  } catch (err) {
    console.error('sitemap.xml error:', err);
    res.status(500).type('text/plain').send('Error generating sitemap');
  }
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Me - Tronkits',
    success: null,
    error: null
  });
});

  // NEW: Passphrase UI page (optional)


  
app.get('/csv-viewer', (req, res) => {
  res.render('csv-viewer', {
    title: 'CSV Viewer Online – Sort, Filter & Download CSV Files | TronKits',
    description: 'View CSV files instantly in your browser. Sort, search, filter columns, and download filtered results. No Excel, no uploads, no accounts.',
    canonicalUrl: 'https://tronkits.com/csv-viewer'
  });
});

app.get('/csv2app', (req, res) => {
  res.render('csv2app', {
    title: 'CSV2App Online – Insert, Update, Delete Data In CSV Files | TronKits',
    description: 'Create a CSV App instantly in your browser. Add, Remove, and delete records. No Excel, no uploads, no accounts.',
    canonicalUrl: 'https://tronkits.com/csv2app'
  });
});


app.get('/csv', (req, res) => {
  res.redirect(301, '/csv-viewer');
});



// Contact form storage (local JSON)
const CONTACT_FILE = path.join(__dirname, 'data', 'contact-submissions.json');

function ensureContactDataDir() {
  const dir = path.dirname(CONTACT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readSubmissions() {
  try {
    if (!fs.existsSync(CONTACT_FILE)) return [];
    const raw = fs.readFileSync(CONTACT_FILE, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // If file is corrupted, don’t crash the site—start a new list
    return [];
  }
}

function writeSubmissions(list) {
  const tmp = CONTACT_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
  fs.renameSync(tmp, CONTACT_FILE);
}

app.post('/contact', (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).render('contact', {
        title: 'Contact Me - Tronkits',
        error: 'Please fill out all fields.',
        success: null
      });
    }

    ensureContactDataDir();

    const submissions = readSubmissions();
    submissions.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      name,
      email,
      message,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || null
    });

    writeSubmissions(submissions);

    return res.render('contact', {
      title: 'Contact Me - Tronkits',
      success: 'Thanks! Your message has been saved.',
      error: null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render('contact', {
      title: 'Contact Me - Tronkits',
      error: 'Sorry—something went wrong saving your message.',
      success: null
    });
  }
});

app.get('/scad', (req, res) => {
  res.render('scad', { title: 'OpenSCAD Box Generator - Tronkits' });
});

app.get('/testpage', (req, res) => {
  res.render('testpage', { title: 'Test Page - Tronkits' });
});

app.get('/resistor', (req, res) => {
  res.render('resistor', { title: 'Resistor Calculator' });
});

app.get('/555', (req, res) => {
  res.render('555', { title: '555 Timer Calculator' });
});

  app.get('/voltage-divider', (req, res) => {
    res.render('voltage-divider', { title: 'Voltage Divider' });
  });
  
  app.get('/led-resistor', (req, res) => {
    res.render('led-resistor', { title: 'LED Resistor' });
  });
  
    // NEW: Passphrase UI page (optional)
  app.get('/passphrases', (req, res) => {
    res.render('passphrases', { title: 'Passphrase Generator - Tronkits' });
  });
  
// NEW: Passphrase API under /api
app.use('/api', passphraseRoutes);
  
app.get('/utility', (req, res) => {
  res.render('utility', { title: 'Utilities' });
});

app.get('/project-tracker', (req, res) => {
  res.render('project-tracker', { title: 'Project Tracker - Tronkits' });
});

app.get('/ohms-law', (req, res) => {
  res.render('ohms-law', { title: "Ohm's Law & Power Calculator - Tronkits" });
});

// --- OpenSCAD STL generation ---
app.post('/generate-stl', (req, res) => {
  const scadCode = req.body.scad;
  if (!scadCode) return res.status(400).send('Missing SCAD code');

  // Store path, varies between Windows and Linux
  const spath = process.env.STL_PATH;
  if (!spath) return res.status(500).send('STL_PATH is not set');

  const id = uuidv4();
  const scadFile = path.join(__dirname, spath, `${id}.scad`);
  const stlFile = path.join(__dirname, spath, `${id}.stl`);

  fs.writeFileSync(scadFile, scadCode);

  const command = `openscad -o "${stlFile}" "${scadFile}"`;

  exec(command, { timeout: 600000 }, (error, stdout, stderr) => {
    if (error) {
      console.log(stderr);
      return res.status(500).send('Failed to generate STL');
    }

    res.json({ url: `/stl_output/${id}.stl` });

    // Optional cleanup
    // fs.unlink(scadFile, () => {});
    // fs.unlink(stlFile, () => {});
  });
});

app.use((req, res) => {
  res.render('index', { title: 'Home - Tronkits' });
});



// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
