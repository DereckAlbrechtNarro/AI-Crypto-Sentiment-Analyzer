// app/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { initSocket } from '../lib/socket';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<Record<string, { time: string; price: number }[]>>({});

  const chartRef = useRef<any>(null);

  useEffect(() => {
    const newSocket = initSocket();
    setSocket(newSocket);

    newSocket.on('cryptoUpdate', (priceData: CryptoPrice) => {
      if (!priceData.symbol || priceData.symbol === '') return;

      setPrices((prev) => ({ ...prev, [priceData.symbol]: priceData }));

      // Track history for chart (last 20 points)
      setPriceHistory((prev) => {
        const current = prev[priceData.symbol] || [];
        const newPoint = { time: new Date().toLocaleTimeString(), price: priceData.price };
        const updated = [...current, newPoint].slice(-20);
        return { ...prev, [priceData.symbol]: updated };
      });
    });

    newSocket.on('newsUpdate', (newsData: any[]) => setNews(newsData));
    newSocket.on('sentimentUpdate', (sentimentData: SentimentData) => {
      setSentiment(sentimentData);
      setIsAnalyzing(false);
    });

    return () => newSocket.disconnect();
  }, []);

  const requestAnalysis = () => {
    if (socket) {
      setIsAnalyzing(true);
      socket.emit('requestAnalysis');
    }
  };

  const closeModal = () => setSelectedSymbol(null);

  const chartData = selectedSymbol && priceHistory[selectedSymbol] ? {
    labels: priceHistory[selectedSymbol].map((p) => p.time),
    datasets: [{
      label: `${selectedSymbol} Price (USDT)`,
      data: priceHistory[selectedSymbol].map((p) => p.price),
      borderColor: '#4caf7a',
      backgroundColor: 'rgba(76, 175, 122, 0.1)',
      tension: 0.4,
      borderWidth: 3,
    }],
  } : null;

  const validPrices = Object.values(prices).filter((c) => c.symbol && c.symbol !== '' && c.price > 0);

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #d0e7d8 40%, #c8e6d8 70%, #e0f2e9 100%)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold tracking-tight" style={{ color: '#1f4a3b' }}>CryptoPulse AI</h1>
            <p className="mt-2 text-xl" style={{ color: '#2e6b52' }}>Real-time Prices • AI Sentiment Analysis</p>
          </div>

          <button
            onClick={requestAnalysis}
            disabled={isAnalyzing}
            className="px-10 py-4 font-semibold text-lg rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #4caf7a, #66c49a)', color: '#ffffff', boxShadow: '0 10px 25px rgba(76, 175, 122, 0.3)' }}
          >
            {isAnalyzing ? (
              <>⏳ AI Analyzing Market...</>
            ) : (
              <>🔍 Analyze Market Sentiment</>
            )}
          </button>
        </div>

        {/* Live Prices with Clickable Glass Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-6" style={{ color: '#1f4a3b' }}>Live Prices</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {validPrices.length > 0 ? validPrices.map((crypto) => (
              <div
                key={crypto.symbol}
                onClick={() => setSelectedSymbol(crypto.symbol)}
                className="p-8 rounded-3xl cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(200, 229, 200, 0.7)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="text-sm font-medium" style={{ color: '#2e6b52' }}>{crypto.symbol} / USDT</div>
                <div className="text-4xl font-mono font-bold mt-4" style={{ color: '#1f4a3b' }}>
                  ${crypto.price.toLocaleString()}
                </div>
                <div className={`mt-4 text-lg font-medium ${(crypto.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {(crypto.change ?? 0) >= 0 ? '↑' : '↓'} {(crypto.change ?? 0).toFixed(2)}%
                </div>
                <div className="text-xs mt-6 text-emerald-700">Click for live chart →</div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 text-xl" style={{ color: '#2e6b52' }}>
                Connecting to Binance live prices...
              </div>
            )}
          </div>
        </div>

        {/* AI Sentiment & News sections remain the same as your previous lighter version */}
        {sentiment && (
          <div className="mb-12 p-10 rounded-3xl" style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(200, 229, 200, 0.7)', backdropFilter: 'blur(16px)' }}>
            <h2 className="text-3xl font-semibold mb-6" style={{ color: '#1f4a3b' }}>AI Market Sentiment</h2>
            <div className={`text-7xl font-bold ${getSentimentColor(sentiment.overallSentiment)}`}>{sentiment.overallSentiment.toUpperCase()}</div>
            <div className="mt-3 text-lg" style={{ color: '#2e6b52' }}>Confidence: {(sentiment.score * 100).toFixed(0)}% • {sentiment.articlesAnalyzed} articles</div>
            <div className="mt-10 grid md:grid-cols-2 gap-10">
              <div><h3 className="font-semibold mb-4 text-lg" style={{ color: '#1f4a3b' }}>Key Insights</h3><ul className="space-y-3 text-base" style={{ color: '#2e6b52' }}>{sentiment.keyInsights.map((i, idx) => <li key={idx}>• {i}</li>)}</ul></div>
              <div><h3 className="font-semibold mb-4 text-lg" style={{ color: '#1f4a3b' }}>Influencing Factors</h3><ul className="space-y-3 text-base" style={{ color: '#2e6b52' }}>{sentiment.influencingFactors.map((f, idx) => <li key={idx}>• {f}</li>)}</ul></div>
            </div>
          </div>
        )}

        {news.length > 0 && (
          <div>
            <h2 className="text-3xl font-semibold mb-6" style={{ color: '#1f4a3b' }}>Latest Crypto News</h2>
            <div className="space-y-6">
              {news.map((article, index) => (
                <div key={index} className="p-8 rounded-3xl" style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(200, 229, 200, 0.7)', backdropFilter: 'blur(16px)' }}>
                  <div className="text-sm" style={{ color: '#2e6b52' }}>{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</div>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mt-4 text-2xl font-medium hover:text-emerald-700" style={{ color: '#1f4a3b' }}>{article.title}</a>
                  <p className="mt-5 text-base leading-relaxed" style={{ color: '#2e6b52' }}>{article.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Chart Modal */}
      {selectedSymbol && chartData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold" style={{ color: '#1f4a3b' }}>{selectedSymbol} Live Chart</h3>
              <button onClick={closeModal} className="text-3xl text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="h-96">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 800 } }} />
            </div>
            <p className="text-center text-sm mt-4 text-gray-500">Last 20 price updates • Updates in real-time</p>
          </div>
        </div>
      )}
    </div>
  );
}