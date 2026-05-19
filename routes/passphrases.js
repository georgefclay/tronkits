// routes/passphrases.js (SERVER-SIDE ONLY)

const express = require("express");
const rateLimit = require("express-rate-limit");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

// Rate limit the API endpoint
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,           // 30 requests/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});

function toInt(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toBool01(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const s = String(value).toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y";
}

// GET /api/passphrases?length=20&count=10&exact=1
router.get("/passphrases", limiter, (req, res) => {
  const length = Math.max(12, Math.min(128, toInt(req.query.length, 20)));
  const count = Math.max(1, Math.min(50, toInt(req.query.count, 10)));
  const exact = toBool01(req.query.exact, false) ? 1 : 0;

  const pythonExe = process.env.PYTHON_EXE || "python";

  // Adjust these paths if your folders differ
  const scriptPath = path.join(__dirname, "..", "python", "passphrase_generator.py");
  const dataDir = process.env.PASS_PHRASE_DATA_DIR
    ? path.resolve(process.env.PASS_PHRASE_DATA_DIR)
    : path.join(__dirname, "..", "python", "data"); // where your CSVs live

  const args = [
    scriptPath,
    "--length", String(length),
    "--count", String(count),
    "--exact", String(exact),
    "--data-dir", dataDir,
  ];

  const child = spawn(pythonExe, args, { stdio: ["ignore", "pipe", "pipe"] });

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (d) => (stdout += d.toString("utf8")));
  child.stderr.on("data", (d) => (stderr += d.toString("utf8")));

  child.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: "Password generator failed",
        details: stderr || stdout || `exit code ${code}`,
      });
    }

    try {
      const data = JSON.parse(stdout);

      if (data && data.error) {
        return res.status(400).json({ error: data.error });
      }

      return res.json(data);
    } catch (e) {
      return res.status(500).json({
        error: "Could not parse generator output as JSON",
        stdout,
        stderr,
      });
    }
  });
});

module.exports = router;
