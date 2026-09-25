const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
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
  // Canonical is built from req.path so query strings (?utm=..., ?x=1) never
  // create duplicate URLs; trailing slashes are stripped except on the root.
  var canonicalPath = req.path.length > 1 ? req.path.replace(/\/+$/, '') : req.path;
  res.locals.canonicalUrl = SITE_URL + (canonicalPath || '/');
  // Only set if not already set by a route
  if (typeof res.locals.metaDescription === 'undefined') res.locals.metaDescription = '';
  next();
});

// --- Routes ---
app.get('/', (req, res) => {
  var latestPosts = [];
  var tutorialCount = 0;
  try {
    const { getAllPosts } = require('./lib/blog');
    latestPosts = getAllPosts().slice(0, 3);
  } catch (e) { console.error('latestPosts loader failed:', e); }
  try {
    tutorialCount = require('./lib/tutorials').getAllTutorials().length;
  } catch (e) { console.error('tutorials loader failed:', e); }
  res.render('index', {
    title: 'TronKits – Electronics Calculators, OpenSCAD & Raspberry Pi Tutorials',
    metaDescription: 'Free electronics calculators, an OpenSCAD box generator and beginner tutorials for Raspberry Pi and basic electronics. Runs in your browser, no login.',
    latestPosts,
    tutorialCount
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About George Clay & TronKits | TronKits',
    metaDescription: 'Who builds TronKits: George Clay, a tinkerer running free electronics calculators and OpenSCAD tools from a Raspberry Pi. How the tools work and how AI is used.'
  });
});


// Passphrase API (existing route file)


// Blog (Markdown-powered) routes
// NOTE: create this file: /routes/blog.js
const blogRoutes = require('./routes/blog');
app.use('/blog', blogRoutes);

// Tutorials (Markdown-powered, content/tutorials/*.md)
app.use('/tutorials', require('./routes/tutorials'));

// Static pages, shared by /sitemap.xml and /llms.txt. `view` is the template
// whose mtime becomes <lastmod>; `llms` puts the page in that llms.txt
// section with `title`/`desc` as its entry.
const STATIC_PAGES = [
  { loc: '/', view: 'index.ejs', changefreq: 'weekly', priority: 1.0 },
  { loc: '/blog', view: 'blog/index.ejs', changefreq: 'weekly', priority: 0.7 },
  { loc: '/tutorials', view: 'tutorials/index.ejs', changefreq: 'monthly', priority: 0.7 },
  { loc: '/about', view: 'about.ejs', changefreq: 'yearly', priority: 0.4 },
  { loc: '/contact', view: 'contact.ejs', changefreq: 'yearly', priority: 0.3 },
  { loc: '/scad', view: 'scad.ejs', changefreq: 'monthly', priority: 0.4,
    llms: 'Tools', title: 'OpenSCAD Box Generator', desc: 'Parametric box with a two-part lid, square or rounded corners; copy the OpenSCAD code or render an STL on the server.' },
  { loc: '/utility', view: 'utility.ejs', changefreq: 'monthly', priority: 0.5,
    llms: 'Tools', title: 'Toolbox', desc: 'Index of every TronKits calculator and utility.' },
  { loc: '/ohms-law', view: 'ohms-law.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: "Ohm's Law Calculator", desc: 'Enter any two of voltage, current, resistance and power to get the other two.' },
  { loc: '/resistor', view: 'resistor.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: 'Resistor Color Code Calculator', desc: '4, 5 and 6-band decoder with tolerance and tempco, plus value-to-bands reverse lookup.' },
  { loc: '/555', view: '555.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: '555 Timer Calculator', desc: 'Astable mode: solve R1, R2, C or frequency from the other three, with duty cycle and high/low times.' },
  { loc: '/voltage-divider', view: 'voltage-divider.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: 'Voltage Divider Calculator', desc: 'Solve Vin, Vout, R1 or R2, optionally with a load resistor; currents and power per resistor.' },
  { loc: '/led-resistor', view: 'led-resistor.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: 'LED Series Resistor Calculator', desc: 'Series resistor for 1 to N LEDs, power rating, E12/E24 rounding and typical Vf by color.' },
  { loc: '/passphrases', view: 'passphrases.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: 'Passphrase Generator', desc: 'Adjective-noun-verb-adverb passphrases with digits and symbols, minimum or exact length, 1 to 50 at a time.' },
  { loc: '/csv-viewer', view: 'csv-viewer.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: 'CSV Viewer', desc: 'Open a CSV in the browser, sort, search, keep columns, clean, and export CSV or Excel; nothing uploaded.' },
  { loc: '/csv2app', view: 'csv2app.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: 'CSV2App', desc: 'Turn a CSV into a searchable, filterable mini app with column profiles and a record view; nothing uploaded.' },
  { loc: '/logo-generator', view: 'logo-generator.ejs', changefreq: 'monthly', priority: 0.6,
    llms: 'Tools', title: 'Placeholder Logo Generator', desc: 'Wordmark plus geometric shape, exported as an SVG with outlined text or a PNG.' },
  { loc: '/project-tracker', view: 'project-tracker.ejs', changefreq: 'monthly', priority: 0.5,
    llms: 'Tools', title: 'Project Tracker', desc: 'Single-page tracker for projects, bugs, features, tasks and notes, saved to a JSON file or browser storage.' }
];

// sitemap.xml (includes static pages + blog slugs)
app.get('/sitemap.xml', (req, res) => {
  try {
    const urls = STATIC_PAGES.map(u => ({ loc: u.loc, view: u.view, changefreq: u.changefreq, priority: u.priority }));

    urls.forEach(u => {
      try {
        u.lastmod = fs.statSync(path.join(__dirname, 'views', u.view)).mtime.toISOString().slice(0, 10);
      } catch (_) { /* no lastmod for this URL */ }
    });

    // Try to add blog posts automatically (if the loader exists)
    try {
      const { getAllPosts } = require('./lib/blog');
      const posts = (typeof getAllPosts === 'function') ? getAllPosts() : [];
      posts.forEach(p => {
        const lastmod = (p.date && p.date.getTime() > 0) ? p.date.toISOString().slice(0, 10) : undefined;
        urls.push({ loc: `/blog/${p.slug}`, lastmod, changefreq: 'monthly', priority: 0.6 });
      });
    } catch (_) {
      // ignore — blog loader not present yet
    }

    // Tutorials, same treatment as blog posts
    try {
      const { getAllTutorials } = require('./lib/tutorials');
      getAllTutorials().forEach(t => {
        const lastmod = (t.date && t.date.getTime() > 0) ? t.date.toISOString().slice(0, 10) : undefined;
        urls.push({ loc: `/tutorials/${t.slug}`, lastmod, changefreq: 'monthly', priority: 0.6 });
      });
    } catch (_) { /* no tutorials */ }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => {
        const full = SITE_URL + u.loc;
        return `  <url>` +
          `<loc>${full}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
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

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for
// LLMs, built from STATIC_PAGES plus the blog and tutorial loaders.
app.get('/llms.txt', (req, res) => {
  try {
    const line = (title, loc, desc) => `- [${title}](${SITE_URL}${loc})` + (desc ? `: ${String(desc).replace(/\s+/g, ' ').trim()}` : '');
    const out = [
      '# TronKits',
      '',
      '> TronKits is a free workbench site by George Clay: electronics calculators (resistor color code, 555 timer, voltage divider, LED resistor, Ohm\'s law), an OpenSCAD box generator, small browser-based data and dev utilities, beginner tutorials for OpenSCAD and Raspberry Pi, and field notes on electronics and building with AI. No login; most tools run entirely in the browser.',
      '',
      `About the author and how the tools handle data: ${SITE_URL}/about`,
      '',
      '## Tools',
      ''
    ];
    STATIC_PAGES.filter(p => p.llms === 'Tools').forEach(p => out.push(line(p.title, p.loc, p.desc)));

    out.push('', '## Tutorials', '');
    out.push(line('All tutorials', '/tutorials', 'Index of step-by-step tutorials.'));
    try {
      require('./lib/tutorials').getAllTutorials().forEach(t => out.push(line(t.title, `/tutorials/${t.slug}`, t.description)));
    } catch (e) { console.error('llms.txt tutorials:', e); }

    out.push('', '## Blog', '');
    out.push(line('All field notes', '/blog', 'Index of blog posts.'));
    try {
      require('./lib/blog').getAllPosts().forEach(p => out.push(line(p.title, `/blog/${p.slug}`, p.description)));
    } catch (e) { console.error('llms.txt blog:', e); }

    res.type('text/plain; charset=utf-8').send(out.join('\n') + '\n');
  } catch (err) {
    console.error('llms.txt error:', err);
    res.status(500).type('text/plain').send('Error generating llms.txt');
  }
});

// Shared by the GET and both POST outcomes of /contact
const CONTACT_DESCRIPTION = 'Contact TronKits with a bug report, a tool idea or a question about a tutorial. Send a short message and George will get back to you. No account needed.';

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact – TronKits',
    metaDescription: CONTACT_DESCRIPTION,
    success: null,
    error: null
  });
});

  // NEW: Passphrase UI page (optional)


  
app.get('/csv-viewer', (req, res) => {
  res.render('csv-viewer', {
    title: 'CSV Viewer Online – Sort, Filter & Download CSV Files | TronKits',
    metaDescription: 'Free online CSV viewer. Open CSV files in your browser, then sort, search, filter columns and download the filtered rows. No Excel, no uploads, no login.'
  });
});

app.get('/csv2app', (req, res) => {
  res.render('csv2app', {
    title: 'CSV2App – Turn a CSV File Into a Searchable Web App | TronKits',
    metaDescription: 'Free CSV to app converter. Load a CSV in your browser and get a searchable mini app with filters, column profiles and a record view. No uploads, no login.'
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
        title: 'Contact – TronKits',
        metaDescription: CONTACT_DESCRIPTION,
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
      title: 'Contact – TronKits',
      metaDescription: CONTACT_DESCRIPTION,
      success: 'Thanks! Your message has been saved.',
      error: null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render('contact', {
      title: 'Contact – TronKits',
      metaDescription: CONTACT_DESCRIPTION,
      error: 'Sorry—something went wrong saving your message.',
      success: null
    });
  }
});

app.get('/scad', (req, res) => {
  res.render('scad', {
    title: 'OpenSCAD Box Generator – Parametric Box to STL | TronKits',
    metaDescription: 'Free parametric OpenSCAD box generator. Set width, length, height, wall thickness and corner style, copy the OpenSCAD code or download an STL. No login.'
  });
});

app.get('/resistor', (req, res) => {
  res.render('resistor', {
    title: 'Resistor Color Code Calculator – 4, 5 & 6 Band | TronKits',
    metaDescription: 'Free resistor color code calculator. Pick band colors for 4, 5 or 6-band resistors and get resistance, tolerance and temperature coefficient instantly. Reverse lookup from a value to bands included.'
  });
});

app.get('/555', (req, res) => {
  res.render('555', {
    title: '555 Timer Calculator – Astable Frequency & Duty Cycle | TronKits',
    metaDescription: 'Free 555 timer calculator for astable mode. Enter any three of R1, R2, C and frequency to solve the fourth, plus duty cycle and timing. Runs in your browser.'
  });
});

  app.get('/voltage-divider', (req, res) => {
    res.render('voltage-divider', {
      title: 'Voltage Divider Calculator – With Load Resistor | TronKits',
      metaDescription: 'Free voltage divider calculator. Enter any three of Vin, Vout, R1 and R2 to solve the fourth, with an optional load resistor. Runs in your browser, no login.'
    });
  });
  
  app.get('/led-resistor', (req, res) => {
    res.render('led-resistor', {
      title: 'LED Series Resistor Calculator – E-Series Values | TronKits',
      metaDescription: 'Free LED resistor calculator. Enter supply voltage, forward voltage, current and LED count to get the series resistor, power rating and E12/E24 value rounded up.'
    });
  });
  
    // NEW: Passphrase UI page (optional)
  app.get('/passphrases', (req, res) => {
    res.render('passphrases', {
      title: 'Passphrase Generator – Memorable, Secure Passphrases | TronKits',
      metaDescription: 'Free passphrase generator. Create memorable adjective-noun-verb-adverb passphrases with digits and symbols mixed in. Nothing is stored or logged, and no login.'
    });
  });
  
// NEW: Passphrase API under /api
app.use('/api', passphraseRoutes);

// 7who business-card scanner API (7who.com frontend; nginx proxies /api/ -> /api/7who/)
app.use('/api/7who', require('./routes/7who-scan'));
  
app.get('/utility', (req, res) => {
  res.render('utility', {
    title: 'Free Online Tools – Electronics Calculators & Dev Utilities | TronKits',
    metaDescription: 'Free online tools for makers: resistor, 555 timer, voltage divider, LED resistor and Ohm\'s law calculators, plus CSV, passphrase and logo utilities. No login.'
  });
});

app.get('/logo-generator', (req, res) => {
  res.render('logo-generator', {
    title: 'Placeholder Logo Generator – Quick SVG Marks | TronKits',
    metaDescription: 'Free placeholder logo generator. Type a wordmark, pick a geometric shape and download a clean SVG with outlined letters, in your browser. No login, no uploads.',
    ogImage: '/images/og-logo-generator.png'
  });
});

app.get('/project-tracker', (req, res) => {
  res.render('project-tracker', {
    title: 'Project Tracker – Local, File-Based Task Tracker | TronKits',
    metaDescription: 'Free project tracker for bugs, features, tasks and notes. Runs in your browser and saves to local storage or a JSON file you can sync. No account, no login.'
  });
});

app.get('/ohms-law', (req, res) => {
  res.render('ohms-law', {
    title: "Ohm's Law Calculator – Voltage, Current, Resistance & Power | TronKits",
    metaDescription: "Free Ohm's law calculator. Enter any two of voltage, current, resistance or power and the other two are calculated instantly in your browser. No login needed."
  });
});

// --- OpenSCAD STL generation ---
// Each render runs OpenSCAD on the Pi, so cap how often one IP can ask.
// Same key setup as routes/7who-scan.js: Cloudflare's client-IP header first,
// then req.ip collapsed to its /56 for IPv6 by ipKeyGenerator.
const stlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,                // 10 renders per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  keyGenerator: (req) => req.headers['cf-connecting-ip'] || ipKeyGenerator(req.ip),
  message: 'Too many STL renders from this address. Try again in 15 minutes.'
});
const MAX_SCAD_BYTES = 64 * 1024;

// Rendered files are only needed long enough to download: delete .scad/.stl
// files older than 24 hours, at startup and then hourly.
const STL_MAX_AGE_MS = 24 * 60 * 60 * 1000;
function cleanupStlDir() {
  fs.readdir(STL_DIR, (err, files) => {
    if (err) {
      if (err.code !== 'ENOENT') console.error('STL cleanup: readdir failed:', err.message);
      return;
    }
    const cutoff = Date.now() - STL_MAX_AGE_MS;
    files.filter(f => /\.(scad|stl)$/i.test(f)).forEach(f => {
      const file = path.join(STL_DIR, f);
      fs.stat(file, (statErr, st) => {
        if (statErr || !st.isFile() || st.mtimeMs >= cutoff) return;
        fs.unlink(file, (unlinkErr) => {
          if (unlinkErr) console.error('STL cleanup: unlink failed:', f, unlinkErr.message);
        });
      });
    });
  });
}
cleanupStlDir();
setInterval(cleanupStlDir, 60 * 60 * 1000).unref();

app.post('/generate-stl', stlLimiter, (req, res) => {
  const scadCode = req.body.scad;
  if (!scadCode || typeof scadCode !== 'string') return res.status(400).send('Missing SCAD code');
  if (Buffer.byteLength(scadCode, 'utf8') > MAX_SCAD_BYTES) {
    return res.status(413).send('SCAD code is too large (64 KB maximum)');
  }

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
    // Both files are removed by cleanupStlDir() once they are 24 hours old
  });
});

// 404 — anything no route above matched
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found – TronKits',
    metaDescription: 'That page does not exist on TronKits. Try the free electronics calculators, the toolbox or the blog instead.'
  });
});



// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
