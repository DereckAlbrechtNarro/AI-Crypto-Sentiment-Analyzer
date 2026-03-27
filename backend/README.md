# AI-Driven Crypto & News Sentiment Analyzer

**Real-time cryptocurrency price streaming + AI-powered market sentiment analysis**

A full-stack Fintech project built to demonstrate real-time WebSockets, third-party API integration, LLM analysis, and Docker containerization.

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

## ✨ Features

- Live cryptocurrency prices via **Binance WebSocket** (BTC, ETH, SOL, BNB, XRP)
- Fetches latest crypto news using **NewsAPI**
- **Google Gemini 2.5 Flash** AI analyzes news and returns:
  - Overall sentiment (bullish / bearish / neutral)
  - Sentiment score (-1.0 to 1.0)
  - Key insights and influencing factors
- Real-time updates via **Socket.io**
- Fully **Dockerized** backend (multi-stage, secure, production-ready)
- Clean service-layer architecture

## 🛠 Tech Stack (Backend)

- Node.js + Express
- Socket.io
- Axios
- WebSocket (Binance)
- Google Gemini API
- Docker + Alpine
- Environment-based configuration

## 🚀 Quick Start (Local)

```bash
# 1. Clone & go to backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# → Add your NEWSAPI_KEY and GEMINI_API_KEY

# 4. Run with Docker (recommended)
docker build -t ai-crypto-sentiment-backend .
docker run -p 5000:5000 --env-file .env ai-crypto-sentiment-backend

# Alternative: Development mode
npm run dev
```

## 📡 API Endpoints

GET /health — Health check + service status

## 🔌 Socket.io Events
Emitted by server:

cryptoUpdate — Live price updates
newsUpdate — Latest news articles
sentimentUpdate — AI sentiment analysis result

Client emits:

requestAnalysis — Triggers full news + Gemini analysis

## 🐳 Docker
The backend is fully containerized with a multi-stage Dockerfile for security and small image size. Ready for deployment on Render.

## 📂 Project Structure
backend/
├── src/
│   ├── services/          # crypto, news, sentiment logic
│   ├── server.js
│   └── ...
├── Dockerfile
├── .dockerignore
└── package.json

## 🌐 Deployment
Backend: Render (Docker image)
Frontend: Vercel (Next.js App Router + Tailwind)


Made with ❤️