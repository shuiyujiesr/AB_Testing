// pages/api/result.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { userName, selectedImagePath } = req.body;

    // Ensure the directory for results exists
    const resultsDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }

    const resultFilePath = path.join(resultsDir, 'results.csv');
    const resultData = `${userName},${selectedImagePath}\n`;

    fs.appendFile(resultFilePath, resultData, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({ message: 'Test result stored successfully' });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
