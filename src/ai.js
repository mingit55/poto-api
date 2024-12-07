const { GoogleAuth } = require('google-auth-library');
const { VertexAI } = require('@google-cloud/vertexai');
const { POTO_GUIDE_LINE } = require('./constant/ai');

const fs = require('fs');
const path = require('path');
const gKeyFilePath = path.resolve(__dirname, '..', 'g-key-file.json');
fs.writeFileSync(gKeyFilePath, process.env.GOOGLE_KEY_CONTENT);

const auth = new GoogleAuth({
  keyFile: gKeyFilePath,
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});
const vertex_ai = new VertexAI({
  project: 'endless-bolt-441206-r1',
  location: 'us-central1',
  googleAuthOptions: auth,
});
const model = 'gemini-1.5-pro-002';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 4096,
    temperature: 0.89,
    topP: 0.9,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'OFF',
    },
  ],
});

module.exports = {
  generativeModel,
  async generateContent({ time, locationType, locationDetail, region }) {
    const parts = [
      {
        text: `${POTO_GUIDE_LINE}
      Input:
        Time of day: ${time}
        Location type: ${locationType}
        Specific location: ${locationDetail}
        Region: ${region}`,
      },
    ];
    const req = {
      contents: [{ role: 'user', parts }],
    };
    const result = await generativeModel.generateContent(req);
    console.info(result);

    return result;
  },
};
