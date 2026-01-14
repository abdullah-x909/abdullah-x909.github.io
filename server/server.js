const express = require('express');
const multer = require('multer');
const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(express.json());

// Configuration - set these as environment variables
const OWNER = process.env.GH_OWNER; // e.g. "abdullah-x909"
const REPO = process.env.GH_REPO;   // e.g. "abdullah-x909.github.io"
const BRANCH = process.env.GH_BRANCH || 'main';
const GH_TOKEN = process.env.GH_TOKEN; // Personal access token (keep secret)

// Basic validation
if (!OWNER || !REPO || !GH_TOKEN) {
  console.error('Missing environment variables. Set GH_OWNER, GH_REPO and GH_TOKEN.');
  process.exit(1);
}

const octokit = new Octokit({ auth: GH_TOKEN });

// Helper to create a path-safe timestamped directory and filename
function makePath(origName) {
  const now = new Date();
  const date = now.toISOString().slice(0,19).replace(/[:T]/g, '-'); // YYYY-MM-DD-HH-MM-SS
  const rand = crypto.randomBytes(4).toString('hex');
  const safeName = origName ? origName.replace(/[^a-zA-Z0-9._-]/g, '_') : `upload_${rand}`;
  return `uploads/${date}_${rand}/${safeName}`;
}

// Accepts form-data with fields: name, message, file
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const senderName = req.body.name || 'phone';
    const message = req.body.message || '';
    const file = req.file; // may be undefined

    // Create a README-ish text file with the message
    const metaContent = `uploader: ${senderName}\nreceived_at: ${new Date().toISOString()}\n\nmessage:\n${message}\n`;
    const metaPath = makePath('message.txt');

    // Commit metadata
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: metaPath,
      message: `Upload: message from ${senderName}`,
      content: Buffer.from(metaContent, 'utf8').toString('base64'),
      branch: BRANCH
    });

    let fileResult = null;
    if (file) {
      // Check size: GitHub create/update file endpoint has size limits (avoid >100MB)
      if (file.size > 100 * 1024 * 1024) {
        return res.status(400).json({ error: 'File too large (>100MB). Use other storage.' });
      }

      const filePath = makePath(file.originalname);
      const content = file.buffer.toString('base64');

      const result = await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        message: `Upload: file ${file.originalname} from ${senderName}`,
        content,
        branch: BRANCH
      });

      fileResult = {
        path: filePath,
        commitUrl: result.data && result.data.content && result.data.content.html_url ? result.data.content.html_url : null
      };
    }

    return res.json({
      ok: true,
      metaPath,
      file: fileResult
    });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: err.message || 'unknown error', details: err.response && err.response.data ? err.response.data : null });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Upload server listening on port ${port}`);
});
