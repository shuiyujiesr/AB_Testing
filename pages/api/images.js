// pages/api/images.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const imagesDirectory = path.join(process.cwd(), 'public', 'images');
    fs.readdir(imagesDirectory, (err, files) => {
      if (err) {
        console.error('Error reading images directory:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const imageFiles = files.filter((file) => {
          const extension = path.extname(file).toLowerCase();
          return extension === '.jpg' || extension === '.png';
        });
        res.status(200).json(imageFiles);
      }
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}