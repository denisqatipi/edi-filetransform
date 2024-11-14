import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channels.js';

const app = express();
const upload = multer({ dest: 'uploads/' });
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    const xmlData = xmlParser.parse(fileContent);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({ 
      message: 'File processed successfully',
      data: xmlData 
    });
  } catch (error) {
    console.error('Error processing XML file:', error);
    res.status(500).json({ error: 'Error processing XML file' });
  }
});

// JSON file upload endpoint
app.post('/api/upload/json', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({ 
      message: 'File processed successfully',
      data: jsonData 
    });
  } catch (error) {
    console.error('Error processing JSON file:', error);
    res.status(500).json({ error: 'Error processing JSON file' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});