const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Setup Multer storage for feedback screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ for form-data
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ AgroAI Backend is running successfully!");
});

// ✅ Feedback API
app.post('/api/feedback', upload.fields([
  { name: 'screenshot', maxCount: 1 }
]), (req, res) => {
  const { name, email, subject, message, stars } = req.body;
  const screenshotPath = req.files?.screenshot?.[0]
    ? `/uploads/${req.files.screenshot[0].filename}`
    : null;

  const feedback = {
    name,
    email,
    subject,
    message,
    stars,
    screenshot: screenshotPath,
    timestamp: new Date().toISOString()
  };

  console.log("📩 Feedback received:", feedback);
  res.status(200).json({ success: true, data: feedback });
});

// ✅ Crop Prediction API
app.post('/predict', (req, res) => {
  const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

  if ([N, P, K, temperature, humidity, ph, rainfall].some(v => v === undefined)) {
    return res.status(400).json({ error: 'Missing one or more required parameters' });
  }

  const args = [N, P, K, temperature, humidity, ph, rainfall];
  const modelPath = path.join(__dirname, 'model', 'predictor.py');

  // ✅ Use 'python3' instead of 'python'
  execFile('python3', [modelPath, ...args], (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ML Model Execution Error:', {
        error: error.message,
        stderr,
        stdout
      });
      return res.status(500).json({ error: 'Prediction failed. Check logs for more info.' });
    }

    const prediction = stdout.trim();
    console.log('🌾 Crop Prediction:', prediction);
    res.status(200).json({ prediction });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at: http://localhost:${PORT}`);
});

