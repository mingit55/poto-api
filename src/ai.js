const { VertexAI } = require('@google-cloud/vertexai');
const { POTO_GUIDE_LINE } = require('./constant/ai')

// Initialize Vertex with your Cloud project and location
const authOptions = {
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_API_KEY,
  }
}

const vertex_ai = new VertexAI({
  project: 'endless-bolt-441206-r1',
  location: 'us-central1',
  googleAuthOptions: authOptions,
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
