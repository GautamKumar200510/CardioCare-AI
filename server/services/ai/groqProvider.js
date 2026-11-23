const axios = require('axios');

/**
 * Groq API Fallback Provider
 */
class GroqProvider {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  async generateJson(systemInstruction, userPrompt) {
    if (!this.isAvailable()) {
      throw new Error('GROQ_API_KEY is not configured.');
    }

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: `${systemInstruction} Return only pure JSON.` },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }
}

module.exports = new GroqProvider();
