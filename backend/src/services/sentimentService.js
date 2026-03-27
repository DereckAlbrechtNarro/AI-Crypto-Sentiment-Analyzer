const axios = require('axios');

class SentimentService {
    constructor(){
        this.apiKey = ProcessingInstruction.env.GEMINI_API_KEY;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    }

    async analyzeNewsSentiment(newsArticles){
        if(!this.apiKey){
            console.warn('⚠️ GEMINI_API_KEY not set - returning mock sentiment');
            return this.getMockSentiment(newsArticles);
        }

        try{
            const prompt = `
        You are a professional crypto market sentiment analyst.
        Analyze the following news articles and provide a clear sentiment score for the overall crypto market.

        Articles:
        ${newsArticles.map((article, index) => 
          `${index + 1}. Title: ${article.title}\n   Description: ${article.description || ''}`
        ).join('\n\n')}

        Respond in valid JSON format only with this exact structure (no extra text):
        {
          "overallSentiment": "bullish" | "bearish" | "neutral",
          "score": number (between -1.0 and 1.0),
          "keyInsights": ["short bullet point 1", "short bullet point 2", "short bullet point 3"],
          "influencingFactors": ["factor 1", "factor 2"]
        }
      `;

      const responde = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
            contents: [{parts: [{text: prompt}]  }]
        },
        {
            headers:{'Content-Type': 'application/json'}
        }
      );

      const textResponse = response.data.candidates[0].content.parts[0].text;

      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if(jsonMatch){
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Gemini');
        }catch(error){
            console.error('❌ Gemini API error:', error.message);
      return this.getMockSentiment(newsArticles);
        }
    }

    getMockSentiment(articles){
        return{
            overallSentiment: "bullish",
            score: 0.65,
            keyInsights: [
                "Strong institutional buying pressure observed",
                "Positive regulatory news from major economies",
                "Bitcoin dominance increasing"
            ],
            influencingFactors: ["ETF inflows", "Macroeconomic data"]
        };
    }
}

module.exports = new SentimentService();