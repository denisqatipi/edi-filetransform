import express from 'express';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

// Get all channels for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const channels = await db.all(
      'SELECT * FROM channels WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Error fetching channels' });
  }
});

// Create new channel
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      sourceFormat,
      targetFormat,
      sourceTemplate,
      targetTemplate,
      mappings
    } = req.body;

    const result = await db.run(
      `INSERT INTO channels (
        user_id, name, description, source_format, target_format, 
        source_template, target_template, mappings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name,
        description,
        sourceFormat,
        targetFormat,
        JSON.stringify(sourceTemplate),
        JSON.stringify(targetTemplate),
        JSON.stringify(mappings)
      ]
    );

    const channel = await db.get('SELECT * FROM channels WHERE id = ?', [result.lastID]);
    res.status(201).json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Error creating channel' });
  }
});

// Transform using channel
router.post('/:id/transform', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get channel details
    const channel = await db.get('SELECT * FROM channels WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Read and parse the uploaded file
    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    let sourceData;

    if (channel.source_format.toLowerCase() === 'xml') {
      sourceData = xmlParser.parse(fileContent);
    } else if (channel.source_format.toLowerCase() === 'json') {
      sourceData = JSON.parse(fileContent);
    } else {
      throw new Error(`Unsupported source format: ${channel.source_format}`);
    }

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    // Get channel mappings
    const mappings = JSON.parse(channel.mappings || '[]');
    const targetTemplate = JSON.parse(channel.target_template || '{}');

    // Apply mappings to transform the data
    const transformedData = applyMappings(sourceData, targetTemplate, mappings);

    // Create transformation record
    const result = await db.run(
      `INSERT INTO transformations (
        channel_id, user_id, source_file, target_file, status
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        channel.id,
        req.user.id,
        JSON.stringify(sourceData),
        JSON.stringify(transformedData),
        'completed'
      ]
    );

    res.json({
      message: 'Transformation successful',
      data: transformedData
    });
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({ error: 'Error during transformation' });
  }
});

// Helper function to apply mappings
function applyMappings(sourceData, targetTemplate, mappings) {
  // Create a deep copy of the target template
  const result = JSON.parse(JSON.stringify(targetTemplate));

  // Apply each mapping
  mappings.forEach(mapping => {
    const sourceValue = getValueByPath(sourceData, mapping.sourcePath);
    setValueByPath(result, mapping.targetPath, sourceValue);
  });

  return result;
}

// Helper function to get value from object by path
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to set value in object by path
function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    current[key] = current[key] || {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

export default router;