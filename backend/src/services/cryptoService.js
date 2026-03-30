const axios = require('axios');

class CryptoService {
  constructor() {
    this.currentPrices = {};
    this.io = null;
  }

  connect(io) {
    this.io = io;
    console.log('📡 Starting CoinGecko price polling...');
    this.fetchPrices();
    setInterval(() => this.fetchPrices(), 60000);
  }

  async fetchPrices() {
    try {
      const { data } = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin,ethereum,solana,binancecoin,ripple',
            vs_currencies: 'usd',
            include_24hr_change: 'true',
          },
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
          }
        }
      );

      const map = {
        bitcoin: 'BTC',
        ethereum: 'ETH',
        solana: 'SOL',
        binancecoin: 'BNB',
        ripple: 'XRP',
      };

      for (const [id, symbol] of Object.entries(map)) {
        if (!data[id]) continue;
        const entry = {
          symbol,
          price: data[id].usd,
          change: data[id].usd_24h_change ?? 0,
          timestamp: Date.now(),
        };
        this.currentPrices[symbol] = entry;
        this.io.emit('cryptoUpdate', entry);
      }

      console.log('✅ Prices updated from CoinGecko');
    } catch (err) {
      console.error('❌ CoinGecko fetch error:', err.message);
    }
  }

  getCurrentPrices() {
    return this.currentPrices;
  }
}

module.exports = new CryptoService();