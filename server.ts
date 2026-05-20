import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Route for Gemini Insights
  app.post('/api/insights', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { employee } = req.body;
      
      const prompt = `
        You are a project performance analyst. Analyze the following owner's project records and provide a concise, 2-to-3 sentence professional summary. 
        Highlight key strengths and any areas for improvement based on their associated metrics to help them succeed. Do not use generic filler words, be specific to the numbers provided.
        Format it as a plain text string. Do not use Markdown formatting like bold or headers.
        
        Owner Data Context:
        Owner Name: ${employee?.Owner}
        Total Projects: ${employee?.TotalRows || employee?.Rows?.length || 0}
        Aggregate Data (First 5 records):
        ${JSON.stringify(employee?.Rows || [])}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ insight: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate insights' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
