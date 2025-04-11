const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Home - Tronkits' });
});

app.get('/tutorials', (req, res) => {
    res.render('tutorials', { title: 'Tutorials - Tronkits' });
  });
  
  app.get('/blog', (req, res) => {
    res.render('blog', { title: 'Blog - Tronkits' });
  });
  
  app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Me - Tronkits' });
  });

  app.get('/scad', (req, res) => {
    res.render('scad', { title: 'OpenSCAD Box Generator - Tronkits' });
  });

app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/stl_output', express.static(path.join(__dirname, 'stl_output')));

app.post('/generate-stl', (req, res) => {
    const scadCode = req.body.scad;
    if (!scadCode) return res.status(400).send('Missing SCAD code');

    const id = uuidv4();
    const scadFile = path.join(__dirname, 'public\\stl_output', `${id}.scad`);
    const stlFile = path.join(__dirname, 'public\\stl_output', `${id}.stl`);
    //console.log(scadFile);
    fs.writeFileSync(scadFile, scadCode);

    const command = `openscad -o "${stlFile}" "${scadFile}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr);
            return res.status(500).send('Failed to generate STL');
        }

        res.json({ url: `/stl_output/${id}.stl` });

        //fs.unlink(scadFile, () => {}); // /delete files
        //fs.unlink(stlFile, () => {});
    });
});

  // Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
