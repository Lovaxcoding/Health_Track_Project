const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  const res = await ai.models.generateContent({
    model: 'gemini-1.0-pro',
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Dis bonjour' }],
      },
    ],
  });

  console.log(res.candidates[0].content.parts[0].text);
}

test();
