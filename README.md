# 🏆 XAU/USD Pro Trading Platform

Professional gold trading platform with AI-powered signals, multiple trading strategies, and paper trading system.

## ✨ Features

### 📊 Dual Chart System
- **TradingView Widget**: Professional charting with indicators
- **Technical Chart**: Real-time Binance PAXG data with live updates

### 🤖 AI Signal System (3 Modes)
- **Hybrid AI**: Pattern detection + AI confirmation
- **Full AI**: Groq LLM analysis
- **Pattern Only**: Pure technical analysis

### 🎯 6 Trading Strategies

#### ⚡ Scalping
- Fast signals (5m timeframe)
- EMA20/50 + RSI + MACD
- SL: 10 pips | TP: 18 pips

#### 🐢 Swing
- Patient approach (1h timeframe)
- H&S patterns only
- SL: 30 pips | TP: 60 pips

#### 🎯 Hunter
- Session-based (London+NY overlap)
- Pivot Points + Candlestick patterns
- SL: 10 pips | TP: 15 pips

#### 🎯 Sniper
- Perfect setup only (15m timeframe)
- H&S/Double Top/Bottom + Volume + RSI + S/R
- SL: 25 pips | TP: 50 pips

#### 👑 Ultimate Sniper
- Deep 50-candle structure analysis
- All confirmations required
- SL: 30 pips | TP: 60 pips
- Confidence: 92-99%

#### 🎲 Gambler (⚠️ EXTREME RISK)
- High frequency (1m timeframe)
- Every candle = signal
- SL: 5 pips | TP: 8 pips

### 💰 Paper Trading System
- Multiple balance options ($1K - $100K + custom)
- Leverage: 1:100, 1:1000, 1:3000
- Adjustable lot size (0.01 - 10)
- Custom TP/SL in pips
- Auto-close on TP/SL hit
- Real-time P/L tracking
- Trade history

### 📰 Market News Integration
- Real-time news feed
- Impact analysis (HIGH/MEDIUM/LOW)
- News sentiment scoring
- AI signal boost based on news

### 📈 Technical Indicators
- RSI (14)
- MACD
- Bollinger Bands
- EMA (20, 50, 100)
- Trend detection

## 🚀 Quick Start

1. Clone repository:
```bash
git clone https://github.com/yourusername/xauusd-trading-platform.git
cd xauusd-trading-platform
```

2. Open `index.html` in browser (no installation needed!)

3. Select trading strategy and start trading!

## 📁 Project Structure

```
trading-web/
├── index.html              # Main HTML
├── app.js                  # Core application logic
├── style.css               # Styling
├── trading-system.js       # Paper trading engine
├── auth.js                 # Authentication system
├── ai-pattern-detection.js # Pattern detection engine
├── .env                    # API keys (not included)
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔧 Configuration

### API Keys (Optional)
Create `.env` file:
```
BYBIT_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### Trading Modes
- **Live Simulation**: Real-time data without real money
- **Historical**: Backtest with historical data

## ⚠️ Disclaimer

**FOR EDUCATIONAL PURPOSES ONLY**

This platform is designed for learning and practice. Trading involves significant risk. This is NOT financial advice. Always:
- Practice with paper trading first
- Never risk money you can't afford to lose
- Understand the risks before trading with real money

## 🛠️ Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: TradingView Widget, Lightweight Charts
- **Data**: Binance API (PAXG)
- **AI**: Groq LLM (optional)
- **Storage**: LocalStorage (paper trading)

## 📊 Strategy Performance

Each strategy has different characteristics:
- **Scalping**: High frequency, moderate accuracy
- **Swing**: Low frequency, high accuracy
- **Hunter**: Session-based, quality setups
- **Sniper**: Rare signals, very high accuracy
- **Ultimate Sniper**: Extremely rare, highest accuracy
- **Gambler**: Very high frequency, high risk

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License - feel free to use for learning and development

## 🙏 Acknowledgments

- TradingView for charting widget
- Binance for market data
- Groq for AI capabilities

## 📧 Contact

For questions or suggestions, open an issue on GitHub.

---

**Remember**: Past performance does not guarantee future results. Trade responsibly! 🎯
