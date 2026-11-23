const axios = require('axios');

/**
 * Google Gemini API Provider
 * Uses Gemini REST endpoint with structured JSON prompting.
 */
class GeminiProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    // Use gemini-1.5-flash or gemini-2.0-flash free tier
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  async generateJson(systemInstruction, userPrompt) {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser request: "${userPrompt}"\n\nReturn ONLY a valid JSON object without markdown code fences.` }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response received from Gemini API');
    }

    try {
      // Clean possible fences if any
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('[GeminiProvider] JSON parsing fallback:', parseErr.message, 'Raw text:', text);
      throw parseErr;
    }
  }

  async generateText(prompt) {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

module.exports = new GeminiProvider();
