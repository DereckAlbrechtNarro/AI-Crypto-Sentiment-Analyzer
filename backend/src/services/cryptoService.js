const WebSocket = require('ws');

class CryptoService {
  constructor() {
    this.ws = null;
    this.currentPrices = {};
  }

  connect(io) {
    console.log('📡 Connecting to Kraken WebSocket...');

    this.ws = new WebSocket('wss://ws.kraken.com');

    this.ws.on('open', () => {
      console.log('✅ Connected to Kraken WebSocket');
      this.ws.send(JSON.stringify({
        event: 'subscribe',
        pair: ['XBT/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD'],
        subscription: { name: 'ticker' }
      }));
    });

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        // Only process array messages (ticker data)
        if (!Array.isArray(msg)) return;

        const tickerData = msg[1];
        const pair = msg[3];

        // Make sure tickerData and pair exist and have the right shape
        if (!tickerData || !pair || !tickerData.c || !tickerData.c[0]) return;

        const symbolMap = {
          'XBT/USD': 'BTC',
          'ETH/USD': 'ETH',
          'SOL/USD': 'SOL',
          'XRP/USD': 'XRP',
        };

        const symbol = symbolMap[pair];
        if (!symbol) return;

        const price = parseFloat(tickerData.c[0]);
        const open = parseFloat(tickerData.o?.t?.[0] || tickerData.o?.[0] || price);
        const change = open !== 0 ? ((price - open) / open) * 100 : 0;

        const entry = {
          symbol,
          price,
          change,
          timestamp: Date.now(),
        };

        this.currentPrices[symbol] = entry;
        io.emit('cryptoUpdate', entry);

      } catch (err) {
        // silently ignore malformed messages
      }
    });

    this.ws.on('error', (err) => {
      console.error('❌ Kraken WebSocket error:', err.message);
    });

    this.ws.on('close', () => {
      console.log('🔴 Kraken WebSocket closed. Reconnecting in 5s...');
      setTimeout(() => this.connect(io), 5000);
    });
  }

  getCurrentPrices() {
    return this.currentPrices;
  }
}

module.exports = new CryptoService();