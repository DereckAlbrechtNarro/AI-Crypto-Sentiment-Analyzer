// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { initSocket } from '../lib/socket';

interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

interface SentimentData {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  keyInsights: string[];
  influencingFactors: string[];
  analyzedAt: string;
  articlesAnalyzed: number;
}

export default function Dashboard() {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [news, setNews] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = initSocket();
    setSocket(newSocket);

    newSocket.on('cryptoUpdate', (priceData: CryptoPrice) => {
      setPrices((prev) => ({ ...prev, [priceData.symbol]: priceData }));
    });

    newSocket.on('newsUpdate', (newsData: any[]) => {
      setNews(newsData);
    });

    newSocket.on('sentimentUpdate', (sentimentData: SentimentData) => {
      setSentiment(sentimentData);
      setIsAnalyzing(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const requestAnalysis = () => {
    if (socket) {
      setIsAnalyzing(true);
      socket.emit('requestAnalysis');
    }
  };

  const getSentimentColor = (sentimentType: string) => {
    if (sentimentType === 'bullish') return 'text-green-400';
    if (sentimentType === 'bearish') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">CryptoPulse AI</h1>
            <p className="text-zinc-400 mt-1">Real-time Prices • AI Sentiment Analysis</p>
          </div>
          <button
            onClick={requestAnalysis}
            disabled={isAnalyzing}
            className="px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? 'Analyzing Market...' : '🔍 Analyze Market Now'}
          </button>
        </div>

        {/* Live Prices Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Live Prices</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.values(prices).length > 0 ? (
              Object.values(prices).map((crypto) => (
                <div key={crypto.symbol} className="glass p-6 rounded-2xl">
                  <div className="text-sm text-zinc-400">{crypto.symbol} / USDT</div>
                  <div className="text-3xl font-mono font-bold mt-2">
                    ${crypto.price?.toLocaleString() ?? '---'}
                  </div>
                  <div className={`mt-2 ${(crypto.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(crypto.change ?? 0) >= 0 ? '↑' : '↓'} {(crypto.change ?? 0).toFixed(2)}%
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-zinc-500">
                Waiting for live prices from backend...
              </div>
            )}
          </div>
        </div>

        {/* Sentiment & Insights */}
        {sentiment && (
          <div className="mb-10 glass p-8 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6">AI Market Sentiment</h2>
            <div className={`text-6xl font-bold ${getSentimentColor(sentiment.overallSentiment)}`}>
              {sentiment.overallSentiment.toUpperCase()}
            </div>
            <div className="text-zinc-400 mt-2">
              Score: {(sentiment.score * 100).toFixed(0)}% • Analyzed {sentiment.articlesAnalyzed} articles
            </div>
            <div className="mt-8 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {sentiment.keyInsights.map((insight, i) => (
                    <li key={`insight-${i}`} className="text-zinc-300">• {insight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Influencing Factors</h3>
                <ul className="space-y-2">
                  {sentiment.influencingFactors.map((factor, i) => (
                    <li key={`factor-${i}`} className="text-zinc-300">• {factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* News Feed */}
        {news.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Latest Crypto News</h2>
            <div className="space-y-4">
              {news.map((article, index) => (
                <div key={`article-${index}`} className="glass p-6 rounded-2xl">
                  <div className="text-sm text-zinc-400">{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</div>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-lg font-medium hover:text-blue-400 transition">
                    {article.title}
                  </a>
                  <p className="text-zinc-400 mt-3 line-clamp-2">{article.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}