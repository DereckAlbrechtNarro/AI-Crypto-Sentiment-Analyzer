const WebSocket = require('ws');

class CryptoService{
    constructor(){
        this.ws = null;
        this.clients = new Set();
        this.currentPrices = {};
    }

    connect(io){
        const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt'];
        const streams = symbols.map(s=> `${s}@ticker`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

        console.log(`📡 Connecting to Binance WebSocket: ${wsUrl}`)

        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', ()=>{
            console.log('✅ Connected to Binance WebSocket - Live crypto prices streaming')
        });

        this.ws.on('message', (data)=>{
            try{
                const ticker = JSON.parse(data);
                const symbol = ticker.s.toLowerCase();
                const price = parseFloat(ticker.c)

                this.currentPrices[symbol] = {
                    symbol: symbol.toUpperCase().replace('USDT', ''),
                    price: price,
                    change: parseFloat(ticker.P),
                    timestamp: Date.now()
                };

                io.emit('cryptoUpdate', this.currentPrices[symbol]);
            } catch(error){
                console.error('❌ Error parsing Binance data:', error);
            }
        });

        this.ws.on('error', (err)=>{
            console.error('❌ Binance WebSocket error:', err.message);
        });

        this.ws.on('close', ()=>{
            console.log('🔴 Binance WebSocket closed. Reconnecting in 5s...');
            setTimeout(()=> this.connect(io),5000);
        });
    }

    getCurrentPrices(){
        return this.currentPrices;
    }
}

module.exports = new CryptoService;