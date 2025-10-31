# 🔴 Live Trading Data Integration Guide

## ✅ Apa Yang Dah Ada Sekarang

### 1. **Live Simulation Mode** (Default)
- Chart update **setiap saat** dengan price movement yang realistic
- Simulate volatility berdasarkan harga sebenar
- Spread calculation (0.01%)
- Candle formation mengikut timeframe yang dipilih

### 2. **Historical Data Mode**
- View data historical tanpa live updates
- Untuk backtesting dan analysis
- Toggle dengan button di header

### 3. **Toggle Button**
- 🔴 **Live Mode** - Real-time simulation
- 📊 **Historical Mode** - Static historical data
- Click untuk switch antara modes

## 🎯 Macam Mana Web Ni Boleh Bantu Trade Real-Time?

### Current Features:
1. ✅ **Live Price Updates** - Simulate real-time price movement
2. ✅ **AI Signal Generation** - Generate trading signals every 5 seconds
3. ✅ **Technical Indicators** - RSI, MACD, Bollinger Bands
4. ✅ **Multiple Timeframes** - 1M to 1D
5. ✅ **Alert System** - Popup notifications untuk strong signals

### Untuk Real Trading:
Web ni sekarang **simulate** live trading environment. Untuk actual trading, kena integrate dengan:

## 🔌 Options Untuk Real-Time Data

### Option 1: **MetaTrader 5 (MT5) Integration** ⭐ RECOMMENDED
```javascript
// Install MT5 dan enable WebSocket/REST API
// Connect melalui MQL5 Expert Advisor

const MT5_CONFIG = {
    host: 'localhost',
    port: 8080,
    symbols: ['XAUUSD', 'EURUSD', 'GBPUSD']
};

// Subscribe to real-time ticks
ws.on('tick', (data) => {
    updateChart(data);
});
```

**Pros:**
- ✅ Real broker data
- ✅ Can execute trades directly
- ✅ Free with broker account
- ✅ Most accurate spreads

**Setup:**
1. Install MT5 dari broker (XM, FXCM, etc.)
2. Create Expert Advisor (EA) untuk expose data via WebSocket
3. Connect web app ke EA

### Option 2: **TradingView API**
```javascript
// TradingView Websocket Feed
const TV_CONFIG = {
    apiKey: 'YOUR_API_KEY',
    symbols: ['OANDA:XAUUSD', 'FX:EURUSD']
};
```

**Pros:**
- ✅ Clean API
- ✅ Multiple data sources
- ✅ Good documentation

**Cons:**
- ❌ Paid subscription required
- ❌ Cannot execute trades

### Option 3: **Forex Data Providers**

#### A. **Alpha Vantage** (Free tier available)
```javascript
const API_KEY = 'YOUR_KEY';
const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=XAU&to_symbol=USD&interval=1min&apikey=${API_KEY}`;
```

#### B. **Twelve Data** (Free 800 calls/day)
```javascript
const url = `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1min&apikey=${API_KEY}`;
```

#### C. **Polygon.io** (Paid)
```javascript
const url = `https://api.polygon.io/v2/aggs/ticker/C:XAUUSD/range/1/minute/2024-01-01/2024-01-02?apiKey=${API_KEY}`;
```

### Option 4: **Broker APIs**

#### OANDA API
```javascript
const OANDA_CONFIG = {
    apiKey: 'YOUR_TOKEN',
    accountId: 'YOUR_ACCOUNT',
    environment: 'practice' // or 'live'
};

// Stream prices
fetch('https://stream-fxpractice.oanda.com/v3/accounts/{accountId}/pricing/stream?instruments=XAU_USD')
```

#### Interactive Brokers (IBKR)
- Most professional
- Requires TWS/IB Gateway
- Complex setup but powerful

## 🚀 Implementation Steps (Untuk Real Data)

### Step 1: Choose Provider
Pilih salah satu option di atas based on:
- Budget (free vs paid)
- Need to execute trades? (MT5/OANDA)
- Just need data? (Alpha Vantage/Twelve Data)

### Step 2: Get API Credentials
- Sign up untuk service
- Get API key/token
- Test connection

### Step 3: Update Code
Replace simulation dengan real API calls:

```javascript
// Current (Simulation)
function startLiveSimulation() {
    setInterval(() => {
        // Simulate price movement
        const newPrice = lastPrice + randomChange;
        updateChart(newPrice);
    }, 1000);
}

// Real Implementation
async function startLiveData() {
    const ws = new WebSocket('wss://your-provider.com/stream');
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateChart({
            time: data.timestamp,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close
        });
    };
}
```

### Step 4: Handle Reconnection
```javascript
function connectWithRetry() {
    const ws = new WebSocket(url);
    
    ws.onerror = () => {
        setTimeout(() => connectWithRetry(), 5000);
    };
}
```

## 💰 Cost Comparison

| Provider | Free Tier | Paid | Real-time | Trading |
|----------|-----------|------|-----------|---------|
| MT5 + Broker | ✅ Yes | - | ✅ Yes | ✅ Yes |
| Alpha Vantage | 25 calls/day | $50/mo | ❌ Delayed | ❌ No |
| Twelve Data | 800 calls/day | $29/mo | ✅ Yes | ❌ No |
| OANDA | Practice Free | Live account | ✅ Yes | ✅ Yes |
| TradingView | ❌ No | $12-60/mo | ✅ Yes | ❌ No |

## 🎯 Recommended Setup (Best for Trading)

### For Beginners:
1. **MT5 Demo Account** (Free)
   - Open demo account dengan broker
   - Install MT5
   - Use built-in data feed
   - Practice trading

### For Serious Traders:
1. **MT5 Live Account** + **Custom EA**
   - Real broker data
   - Execute trades from web
   - Full control

2. **OANDA API** (Alternative)
   - Good API documentation
   - Practice account available
   - Can execute trades

## 📝 Quick Start (MT5 Integration)

### 1. Install MT5
Download dari broker (XM, FXCM, Exness, etc.)

### 2. Create Expert Advisor
```mql5
// WebSocketServer.mq5
#include <WebSocket.mqh>

void OnTick() {
    double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    
    string json = StringFormat(
        "{\"symbol\":\"%s\",\"bid\":%.5f,\"ask\":%.5f,\"time\":%d}",
        _Symbol, bid, ask, TimeCurrent()
    );
    
    WebSocketSend(json);
}
```

### 3. Update Web App
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    marketData.bid = data.bid;
    marketData.ask = data.ask;
    updateChart(data);
};
```

## ⚠️ Important Notes

### Current Status:
- ✅ Web app ready untuk real-time data
- ✅ Chart updates smoothly
- ✅ AI signals working
- ⚠️ **Need to connect to real data source**

### Limitations:
- Simulated data ≠ Real market conditions
- No actual trade execution yet
- Spread may differ from real broker

### Next Steps:
1. Choose data provider
2. Get API access
3. Implement connection
4. Test with demo account
5. Go live with real account

## 🔧 Code Template (Ready to Use)

File: `live-data-connector.js`
```javascript
class LiveDataConnector {
    constructor(provider, config) {
        this.provider = provider;
        this.config = config;
        this.ws = null;
    }
    
    connect() {
        switch(this.provider) {
            case 'MT5':
                return this.connectMT5();
            case 'OANDA':
                return this.connectOanda();
            case 'TWELVEDATA':
                return this.connectTwelveData();
        }
    }
    
    connectMT5() {
        this.ws = new WebSocket(`ws://${this.config.host}:${this.config.port}`);
        this.ws.onmessage = (e) => this.handleData(JSON.parse(e.data));
    }
    
    handleData(data) {
        // Update chart with real data
        updateChart(data);
    }
}

// Usage
const connector = new LiveDataConnector('MT5', {
    host: 'localhost',
    port: 8080
});
connector.connect();
```

---

## 📞 Support

Untuk implement real-time data:
1. Pilih provider dari list atas
2. Follow setup guide untuk provider tersebut
3. Update `CONFIG.LIVE_MODE` logic dengan real API calls
4. Test dengan demo account dulu

**Current Mode**: Live Simulation (Safe for testing strategies)
**Production Mode**: Need real data provider integration
