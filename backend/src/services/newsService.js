const axios = require('axios');

class NewsService {
    constructor(){
        this.apiKey = process.env.NEWSAPI_KEY;
        this.baseUrl = 'https://newsapi.org/v2/everything';
    }

    async getCryptoNews(){
        if(!this.apiKey){
            console.warn('⚠️ NEWSAPI_KEY not set - returning mock data for development');
            return this.getMockNews();
        }

        try{
            const response = await axios.get(this.baseUrl, {
                params:{
                    q: 'bitcoin OR ethereum OR crypto OR cryptocurrency',
                    sortBy: 'publishedAt',
                    language: 'en',
                    pageSize: 10,
                    apiKey: this.apiKey
                }
            });

            return response.data.articles.map(article=>({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt
            }));
        }catch(error){
            console.error('❌ Error fetching crypto news NewsAPI error:', error.message);
            return this.getMockNews();
        }
    }

    getMockNews(){
        return [
            {
                title: 'Bitcoin Breaks $90k Amid Institutional Adoption',
                description: "Major financial institutions continue to increase their Bitcoin holdings...",
                url: "#",
                source: "CoinDesk",
                publishedAt: new Date().toISOString()
            }
        ];
    }
}

module.exports = new NewsService();