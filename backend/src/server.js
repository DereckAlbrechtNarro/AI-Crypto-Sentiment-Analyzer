require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const cryptoService = require('./services/cryptoService');
const NewsService = require('./services/newsService');
const sentimentService = require('./services/sentimentService');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: ['http://localhost:3000', 'https://ai-crypto-sentiment-analyzer.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: '🚀 AI Crypto Sentiment Analyzer Backend is healthy!',
        services: ['Kraken WS', 'NewsAPI', 'GeminiAPI'],
        timeStamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send(`
        <h1>👋 Welcome to the AI-Driven Crypto & News Sentiment Analyzer Backend</h1>
        <p>Socket.io is ready for real-time crypto streams.</p>
        <p>Check <a href="/health">/health</a> for status.</p>
    `);
});

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://ai-crypto-sentiment-analyzer.vercel.app'],
        methods: ['GET', 'POST']
    }
});

cryptoService.connect(io);

io.on('connection', (socket) => {
    console.log(`🟢 New client connected: ${socket.id} | Total clients: ${io.engine.clientsCount}`);

    socket.emit('cryptoUpdate', cryptoService.getCurrentPrices());

    socket.on('requestAnalysis', async () => {
        try {
            console.log(`📡 Client ${socket.id} requested full analysis`);

            const newsArticles = await NewsService.getCryptoNews();
            socket.emit('newsUpdate', newsArticles);

            const sentimentResult = await sentimentService.analyzeNewsSentiment(newsArticles);

            socket.emit('sentimentUpdate', {
                ...sentimentResult,
                analyzedAt: new Date().toISOString(),
                articlesAnalyzed: newsArticles.length
            });

            console.log(`✅ Analysis sent to ${socket.id} | Sentiment: ${sentimentResult.overallSentiment}`);
        } catch (error) {
            console.error('❌ Analysis error:', error.message);
            socket.emit('error', { message: 'Failed to generate sentiment analysis. Using cached data.' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🔥 Server is running on http://localhost:${PORT} 🔥`);
    console.log(`📡 Socket.io ready for real-time crypto & sentiment magic`);
    console.log(`📡 Live Kraken crypto prices streaming`);
    console.log(`📰 NewsAPI + Gemini AI ready for crypto sentiment analysis`);
});