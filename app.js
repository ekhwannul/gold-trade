// Configuration
const CONFIG = {
    AI_SERVER_URL: 'http://localhost:5000',
    MT5_BRIDGE_URL: 'http://localhost:5001',
    UPDATE_INTERVAL: 5000,
    CHART_UPDATE_INTERVAL: 1000,
    DATA_BASE_PATH: '../forex-price-prediction-master/Data/',
    LIVE_MODE: true,
    USE_MT5: true,
    GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE' // Replace with your key or use prompt
};

// State
let chart = null;
let candleSeries = null;
let currentTimeframe = '5m';
let currentDataset = '01';
let liveUpdateInterval = null;
let marketData = {
    bid: 0,
    ask: 0,
    prices: []
};
let stats = {
    signals: 0,
    wins: 0,
    profit: 0
};

// Trading System
let tradingSystem = null;
let authSystem = null;
let currentSignal = null;
let currentLotSize = 0.01;
let isGuestMode = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initChart();
        updateTime();
        setInterval(updateTime, 1000);
        setupEventListeners();
        startDataFeed();
        initTradingSystem();
    }, 100);
});

// Setup Event Listeners
function setupEventListeners() {
    // Timeframe dropdown
    document.getElementById('timeframeSelect')?.addEventListener('change', async (e) => {
        currentTimeframe = e.target.value;
        await loadChartData();
    });
    
    
    // Dataset selector
    const datasetSelector = document.getElementById('datasetSelector');
    if (datasetSelector) {
        datasetSelector.addEventListener('change', async (e) => {
            currentDataset = e.target.value;
            await loadChartData();
        });
    }
    
    // Auth
    document.getElementById('btnLoginShow')?.addEventListener('click', showAuthModal);
    document.getElementById('btnAuthLogin')?.addEventListener('click', handleLogin);
    document.getElementById('btnAuthSignup')?.addEventListener('click', handleSignup);
    
    // Settings
    document.getElementById('balanceSelect')?.addEventListener('change', (e) => {
        const customInput = document.getElementById('customBalance');
        if (e.target.value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            handleBalanceChange(e);
        }
    });
    document.getElementById('customBalance')?.addEventListener('change', (e) => {
        const amount = parseFloat(e.target.value);
        if (amount && amount > 0) {
            tradingSystem.setBalance(amount);
            updateTradingDisplay();
            showTradeNotification(`💰 Balance set to $${amount.toLocaleString()}`);
        }
    });
    document.getElementById('leverageSelect')?.addEventListener('change', handleLeverageChange);
    
    // Trading buttons
    document.getElementById('btnBuy')?.addEventListener('click', () => executeTrade('BUY'));
    document.getElementById('btnSell')?.addEventListener('click', () => executeTrade('SELL'));
    document.getElementById('btnCloseAll')?.addEventListener('click', closeAllPositions);
    document.getElementById('btnResetWallet')?.addEventListener('click', resetAccount);
    document.getElementById('btnSettings')?.addEventListener('click', showSettings);
    
    // Lot size controls
    document.getElementById('btnLotPlus')?.addEventListener('click', () => adjustLot(0.01));
    document.getElementById('btnLotMinus')?.addEventListener('click', () => adjustLot(-0.01));
    document.getElementById('lotSize')?.addEventListener('input', (e) => {
        currentLotSize = parseFloat(e.target.value) || 0.01;
        updateRequiredMargin();
    });
    
    // Chart view toggle
    document.querySelectorAll('.btn-chart-toggle').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            document.querySelectorAll('.btn-chart-toggle').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const view = e.target.dataset.view;
            const timeframeSelect = document.getElementById('timeframeSelect');
            
            if (view === 'tradingview') {
                document.getElementById('tradingviewContainer').style.display = 'block';
                document.getElementById('technicalChart').style.display = 'none';
                timeframeSelect.style.display = 'none';
            } else {
                document.getElementById('tradingviewContainer').style.display = 'none';
                document.getElementById('technicalChart').style.display = 'block';
                timeframeSelect.style.display = 'block';
                
                await loadChartData();
                
                if (chart) {
                    const container = document.getElementById('technicalChart');
                    chart.applyOptions({ 
                        width: container.clientWidth,
                        height: 600
                    });
                    chart.timeScale().fitContent();
                }
            }
        });
    });
    
    // Mode toggle
    const modeToggle = document.getElementById('modeToggle');
    const statusDot = document.getElementById('statusDot');
    const connectionStatus = document.getElementById('connectionStatus');
    
    if (modeToggle) {
        updateModeUI();
        
        modeToggle.addEventListener('click', async () => {
            CONFIG.LIVE_MODE = !CONFIG.LIVE_MODE;
            updateModeUI();
            
            if (CONFIG.LIVE_MODE) {
                await loadChartData();
            } else {
                if (liveUpdateInterval) {
                    clearInterval(liveUpdateInterval);
                    liveUpdateInterval = null;
                }
                await loadChartData();
            }
        });
    }
    
    async function updateModeUI() {
        const modeBadge = document.querySelector('.mode-badge');
        
        if (CONFIG.LIVE_MODE) {
            modeToggle.textContent = '📊 Historical Mode';
            modeToggle.classList.add('live');
            statusDot.classList.add('live');
            
            // Check MT5 connection
            let mt5Connected = false;
            try {
                const res = await fetch(`${CONFIG.MT5_BRIDGE_URL}/api/status`, {signal: AbortSignal.timeout(1000)});
                const data = await res.json();
                mt5Connected = data.connected;
            } catch {}
            
            
            if (mt5Connected) {
                connectionStatus.textContent = 'MT5 Connected';
                if (modeBadge) {
                    modeBadge.textContent = 'LIVE MT5';
                    modeBadge.classList.remove('historical');
                }
            } else {
                connectionStatus.textContent = 'Live Simulation';
                if (modeBadge) {
                    modeBadge.textContent = 'LIVE SIM';
                    modeBadge.classList.remove('historical');
                }
            }
        } else {
            modeToggle.textContent = '🔴 Live Mode';
            modeToggle.classList.remove('live');
            statusDot.classList.remove('live');
            connectionStatus.textContent = 'Historical Data';
            if (modeBadge) {
                modeBadge.textContent = 'HISTORICAL';
                modeBadge.classList.add('historical');
            }
        }
    }
}

// Load Chart Data
async function loadChartData() {
    const liveData = await fetchLiveGoldData();
    if (liveData && liveData.length > 0) {
        candleSeries.setData(liveData);
        marketData.prices = liveData;
        marketData.bid = liveData[liveData.length - 1].close;
        marketData.ask = marketData.bid + (marketData.bid * 0.0001);
        updatePriceDisplay();
        startLiveUpdate();
        return;
    }
    
    console.log('⚠️ Bybit failed, using fallback');
    generateFallbackData();
}

// Initialize Chart
function initChart() {
    if (typeof LightweightCharts === 'undefined') {
        console.log('Waiting for LightweightCharts...');
        setTimeout(initChart, 500);
        return;
    }
    
    const chartContainer = document.getElementById('technicalChart');
    if (!chartContainer) return;
    
    chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 600,
        layout: {
            background: { color: '#1a1f3a' },
            textColor: '#8b92b0',
        },
        grid: {
            vertLines: { color: '#2d3561' },
            horzLines: { color: '#2d3561' },
        },
        crosshair: {
            mode: 0,
        },
        rightPriceScale: {
            borderColor: '#2d3561',
        },
        timeScale: {
            borderColor: '#2d3561',
            timeVisible: true,
            secondsVisible: false,
        },
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ff88',
        downColor: '#ff4757',
        borderVisible: false,
        wickUpColor: '#00ff88',
        wickDownColor: '#ff4757',
    });

    // Generate initial data
    generateInitialData();

    window.addEventListener('resize', () => {
        if (chart && document.getElementById('technicalChart').style.display !== 'none') {
            chart.applyOptions({ width: chartContainer.clientWidth });
        }
    });
    
    console.log('✅ Technical chart initialized with', marketData.prices.length, 'candles');
}

// Load Real Data from CSV
async function loadRealData(dataset = '01', timeframe = '60') {
    const paths = [
        `../forex-price-prediction-master/Data/${dataset}/XAUUSD${timeframe}.csv`,
        `../Data/${dataset}/XAUUSD${timeframe}.csv`,
        `Data/${dataset}/XAUUSD${timeframe}.csv`,
        `../../forex-price-prediction-master/Data/${dataset}/XAUUSD${timeframe}.csv`
    ];
    
    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const csvText = await response.text();
                const data = parseCSV(csvText);
                if (data && data.length > 0) {
                    console.log('✅ CSV loaded:', path);
                    return data;
                }
            }
        } catch (error) {
            continue;
        }
    }
    console.log('⚠️ CSV not found, using fallback');
    return null;
}

// Parse CSV Data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];
    
    // Take last 500 candles for better performance
    const startIndex = Math.max(0, lines.length - 500);
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split('\t');
        if (parts.length < 5) continue;
        
        try {
            const dateTime = parts[0];
            const open = parseFloat(parts[1]);
            const high = parseFloat(parts[2]);
            const low = parseFloat(parts[3]);
            const close = parseFloat(parts[4]);
            
            // Parse date: "2007-06-01 00:00"
            const date = new Date(dateTime.replace(' ', 'T') + ':00Z');
            const timestamp = Math.floor(date.getTime() / 1000);
            
            if (!isNaN(timestamp) && !isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
                data.push({
                    time: timestamp,
                    open: open,
                    high: high,
                    low: low,
                    close: close
                });
            }
        } catch (e) {
            continue;
        }
    }
    
    return data;
}

// Generate Initial Chart Data
async function generateInitialData() {
    await loadChartData();
}

// Fetch MT5 Real Data
async function fetchMT5RealData() {
    try {
        const url = `${CONFIG.MT5_BRIDGE_URL}/api/candles/${currentTimeframe}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.candles && data.candles.length > 0) {
            console.log('✅ MT5 real data loaded:', data.candles.length, 'candles');
            return data.candles;
        }
    } catch (error) {
        console.log('⚠️ MT5 bridge not connected');
    }
    return null;
}

// Start MT5 Live Update
function startMT5LiveUpdate() {
    if (liveUpdateInterval) clearInterval(liveUpdateInterval);
    
    liveUpdateInterval = setInterval(async () => {
        try {
            const response = await fetch(`${CONFIG.MT5_BRIDGE_URL}/api/price`);
            const data = await response.json();
            
            if (data.bid && data.ask) {
                marketData.bid = data.bid;
                marketData.ask = data.ask;
                updatePriceDisplay();
                
                // Update last candle
                if (marketData.prices.length > 0) {
                    const lastCandle = marketData.prices[marketData.prices.length - 1];
                    lastCandle.close = data.bid;
                    lastCandle.high = Math.max(lastCandle.high, data.bid);
                    lastCandle.low = Math.min(lastCandle.low, data.bid);
                    candleSeries.update(lastCandle);
                }
            }
        } catch (error) {
            console.log('MT5 update failed, retrying...');
        }
    }, 1000);
}

// Fetch Live Gold Data (Binance PAXG)
async function fetchLiveGoldData() {
    const tfMap = {'1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '2h': '2h', '4h': '4h', '1d': '1d'};
    const interval = tfMap[currentTimeframe] || '1h';
    
    try {
        const url = `https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${interval}&limit=200`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.length > 0) {
            const candles = data.map(item => ({
                time: Math.floor(item[0] / 1000),
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4])
            }));
            
            console.log(`✅ Binance ${interval}:`, candles.length, 'candles');
            return candles;
        }
    } catch (error) {
        console.log('Binance failed:', error);
    }
    
    return null;
}



// Generate candles from current price
function generateCandlesFromPrice(currentPrice) {
    const candles = [];
    let price = currentPrice;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 200; i >= 0; i--) {
        const volatility = price * 0.002;
        const change = (Math.random() - 0.5) * volatility;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        candles.push({
            time: now - (i * 3600),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        });
        
        price = close;
    }
    
    return candles;
}

// Generate Fallback Data
function generateFallbackData() {
    console.log('🎲 Generating realistic XAU/USD data...');
    const data = [];
    let basePrice = 2650 + (Math.random() * 50);
    let time = Math.floor(Date.now() / 1000) - 200 * 3600;
    let trend = 1;

    for (let i = 0; i < 200; i++) {
        if (i % 20 === 0) trend = Math.random() > 0.5 ? 1 : -1;
        
        const volatility = basePrice * 0.003;
        const change = (Math.random() - 0.5) * volatility + (trend * 0.5);
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.3);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.3);

        data.push({
            time: time + i * 3600,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        });

        basePrice = close;
    }

    candleSeries.setData(data);
    marketData.prices = data;
    marketData.bid = data[data.length - 1].close;
    marketData.ask = marketData.bid + (marketData.bid * 0.0001);
    updatePriceDisplay();
    startLiveUpdate();
    console.log('✅ Fallback data ready:', data.length, 'candles, starting at $' + data[0].open.toFixed(2));
}

// Update Time
function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
}

// Start Data Feed
function startDataFeed() {
    setInterval(() => {
        getAISignal();
    }, CONFIG.UPDATE_INTERVAL);
    setTimeout(() => getAISignal(), 1000);
}

// Start Live Update
function startLiveUpdate() {
    if (liveUpdateInterval) clearInterval(liveUpdateInterval);
    
    liveUpdateInterval = setInterval(async () => {
        if (marketData.prices.length === 0) return;
        
        try {
            const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
            const data = await res.json();
            const price = parseFloat(data.price);
            
            const lastCandle = marketData.prices[marketData.prices.length - 1];
            lastCandle.close = price;
            lastCandle.high = Math.max(lastCandle.high, price);
            lastCandle.low = Math.min(lastCandle.low, price);
            candleSeries.update(lastCandle);
            
            marketData.bid = price;
            marketData.ask = price + (price * 0.0001);
            updatePriceDisplay();
        } catch (error) {}
    }, 1000);
}

// Get Timeframe in Seconds
function getTimeframeSeconds(tf) {
    const map = {
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '30m': 1800,
        '1h': 3600,
        '4h': 14400,
        '1d': 86400
    };
    return map[tf] || 3600;
}



// Update Price Display
function updatePriceDisplay() {
    document.getElementById('bidPrice').textContent = marketData.bid.toFixed(2);
    document.getElementById('askPrice').textContent = marketData.ask.toFixed(2);
    const spread = marketData.ask - marketData.bid;
    document.getElementById('spread').textContent = spread.toFixed(2);
}

// Get AI Signal
async function getAISignal() {
    try {
        const aiMode = document.getElementById('aiModeSelect').value;
        const tradingStyle = document.getElementById('tradingStyleSelect').value;
        
        // Auto-set timeframe based on trading style
        let optimalTF = '5m';
        if (tradingStyle === 'swing') optimalTF = '1h';
        if (tradingStyle === 'hunter') optimalTF = '1m';
        if (tradingStyle === 'sniper') optimalTF = '15m';
        if (tradingStyle === 'ultimate') optimalTF = '30m';
        if (tradingStyle === 'gambler') optimalTF = '1m';
        
        if (currentTimeframe !== optimalTF) {
            currentTimeframe = optimalTF;
            document.getElementById('timeframeSelect').value = optimalTF;
            await loadChartData();
        }
        
        const indicators = calculateIndicators();
        updateIndicatorsDisplay(indicators);

        let signal;
        
        if (aiMode === 'pattern') {
            signal = await getPatternSignal(tradingStyle);
        } else if (aiMode === 'full-ai') {
            signal = await getFullAISignal();
        } else {
            signal = await getHybridSignal(tradingStyle);
        }

        currentSignal = signal;
        updateSignalDisplay(signal);
        
        const minConfidence = tradingStyle === 'scalping' ? 60 : 75;
        if (signal.confidence > minConfidence && signal.signal !== 'HOLD') {
            showAlert(signal);
        }

    } catch (error) {
        console.error('Error getting AI signal:', error);
    }
}

// Pattern Detection Only
async function getPatternSignal(tradingStyle = 'scalping') {
    
    // HUNTER MODE: Professional Scalping Blueprint
    if (tradingStyle === 'hunter') {
        return await getHunterSignal();
    }
    
    // SNIPER MODE: Focus on 1-2 Best Patterns Only
    if (tradingStyle === 'sniper') {
        return await getSniperSignal();
    }
    
    // ULTIMATE SNIPER MODE: Deep 50-Candle Analysis
    if (tradingStyle === 'ultimate') {
        return await getUltimateSniperSignal();
    }
    
    // GAMBLER MODE: Extreme High Frequency Trading
    if (tradingStyle === 'gambler') {
        return await getGamblerSignal();
    }
    
    const detector = new PatternDetector();
    const patterns = detector.detectAllPatterns(marketData.prices);
    
    if (patterns.length === 0) {
        return {
            signal: 'HOLD',
            confidence: 50,
            sl: 0,
            tp: 0,
            reasoning: 'No clear pattern detected. Waiting for setup.',
            risk_level: 'HIGH'
        };
    }
    
    const bestPattern = patterns[0];
    
    const indicators = calculateIndicators();
    const trend = indicators.trend;
    const volume = checkVolumeConfirmation();
    const keyLevel = checkKeyLevel(marketData.bid);
    
    if (tradingStyle === 'scalping') {
        // IMPROVED SCALPING: Quality over quantity
        const prices = marketData.prices.map(c => c.close);
        const ema20 = calculateEMA(prices, 20);
        const ema50 = calculateEMA(prices, 50);
        const currentPrice = marketData.bid;
        const recentCandles = marketData.prices.slice(-20);
        const lastCandle = recentCandles[recentCandles.length - 1];
        const prevCandle = recentCandles[recentCandles.length - 2];
        
        // 1. TREND FILTER - Must be clear trend
        const trendStrength = Math.abs(ema20 - ema50);
        const minTrendGap = currentPrice * 0.0005; // 0.05% minimum gap
        if (trendStrength < minTrendGap) {
            return {
                signal: 'HOLD',
                confidence: 40,
                sl: 0,
                tp: 0,
                reasoning: 'No clear trend - waiting',
                risk_level: 'HIGH'
            };
        }
        
        // 2. MOMENTUM FILTER - Strong candles only
        const last3Candles = recentCandles.slice(-3);
        const avgCandleSize = last3Candles.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / 3;
        const lastCandleSize = Math.abs(lastCandle.close - lastCandle.open);
        const strongMomentum = lastCandleSize > avgCandleSize * 1.5;
        
        if (!strongMomentum) {
            return {
                signal: 'HOLD',
                confidence: 45,
                sl: 0,
                tp: 0,
                reasoning: 'Weak momentum - waiting for strong move',
                risk_level: 'MEDIUM'
            };
        }
        
        // 3. RSI FILTER - Not overbought/oversold
        if (indicators.rsi > 70 || indicators.rsi < 30) {
            return {
                signal: 'HOLD',
                confidence: 40,
                sl: 0,
                tp: 0,
                reasoning: 'RSI extreme - avoiding reversal zone',
                risk_level: 'HIGH'
            };
        }
        
        // 4. PULLBACK ENTRY - Wait for small pullback then breakout
        const bullishSetup = ema20 > ema50 && currentPrice > ema20;
        const bearishSetup = ema20 < ema50 && currentPrice < ema20;
        
        // BUY: Pullback done, breaking up
        if (bullishSetup && 
            prevCandle.close < prevCandle.open && // Previous candle pullback
            lastCandle.close > lastCandle.open && // Current candle breakout
            lastCandle.close > prevCandle.high && // Breaking previous high
            indicators.rsi > 50 && indicators.rsi < 70 &&
            indicators.macd > 0) {
            
            // News sentiment boost
            const newsBoost = newsSentiment.score > 0 ? 8 : 0;
            const newsReason = newsSentiment.score >= 2 ? ` + ${newsSentiment.reasoning}` : '';
            
            return {
                signal: 'BUY',
                confidence: Math.min(95, 78 + newsBoost),
                sl: 10,
                tp: 18,
                reasoning: `SCALP: Pullback complete + Breakout confirmed${newsReason}`,
                risk_level: newsBoost > 0 ? 'LOW' : 'MEDIUM'
            };
        }
        
        // SELL: Pullback done, breaking down
        if (bearishSetup && 
            prevCandle.close > prevCandle.open && // Previous candle pullback
            lastCandle.close < lastCandle.open && // Current candle breakout
            lastCandle.close < prevCandle.low && // Breaking previous low
            indicators.rsi < 50 && indicators.rsi > 30 &&
            indicators.macd < 0) {
            
            // News sentiment boost
            const newsBoost = newsSentiment.score < 0 ? 8 : 0;
            const newsReason = newsSentiment.score <= -2 ? ` + ${newsSentiment.reasoning}` : '';
            
            return {
                signal: 'SELL',
                confidence: Math.min(95, 78 + newsBoost),
                sl: 10,
                tp: 18,
                reasoning: `SCALP: Pullback complete + Breakout confirmed${newsReason}`,
                risk_level: newsBoost > 0 ? 'LOW' : 'MEDIUM'
            };
        }
        
        // 5. BACKUP: Strong trend continuation (no pullback needed)
        const last2Bullish = last3Candles.slice(-2).every(c => c.close > c.open);
        const last2Bearish = last3Candles.slice(-2).every(c => c.close < c.open);
        
        if (bullishSetup && last2Bullish && indicators.rsi > 55 && indicators.rsi < 68) {
            const newsBoost = newsSentiment.score > 0 ? 6 : 0;
            const newsReason = newsSentiment.score >= 2 ? ` + ${newsSentiment.reasoning}` : '';
            
            return {
                signal: 'BUY',
                confidence: Math.min(90, 72 + newsBoost),
                sl: 10,
                tp: 18,
                reasoning: `SCALP: Strong trend continuation${newsReason}`,
                risk_level: 'MEDIUM'
            };
        }
        
        if (bearishSetup && last2Bearish && indicators.rsi < 45 && indicators.rsi > 32) {
            const newsBoost = newsSentiment.score < 0 ? 6 : 0;
            const newsReason = newsSentiment.score <= -2 ? ` + ${newsSentiment.reasoning}` : '';
            
            return {
                signal: 'SELL',
                confidence: Math.min(90, 72 + newsBoost),
                sl: 10,
                tp: 18,
                reasoning: `SCALP: Strong trend continuation${newsReason}`,
                risk_level: 'MEDIUM'
            };
        }
        
        // Apply news sentiment boost
        if (newsSentiment.score >= 3) {
            return {
                signal: 'BUY',
                confidence: 68,
                sl: 10,
                tp: 18,
                reasoning: `NEWS DRIVEN: ${newsSentiment.reasoning}`,
                risk_level: 'MEDIUM'
            };
        }
        
        if (newsSentiment.score <= -3) {
            return {
                signal: 'SELL',
                confidence: 68,
                sl: 10,
                tp: 18,
                reasoning: `NEWS DRIVEN: ${newsSentiment.reasoning}`,
                risk_level: 'MEDIUM'
            };
        }
        
        return {
            signal: 'HOLD',
            confidence: 50,
            sl: 0,
            tp: 0,
            reasoning: 'Waiting for quality setup',
            risk_level: 'MEDIUM'
        };
        
    } else {
        // SWING: More patient, focus on H&S + strict confirmations
        if (!['HEAD_AND_SHOULDERS', 'INVERSE_HEAD_AND_SHOULDERS', 'DOUBLE_TOP', 'DOUBLE_BOTTOM'].includes(bestPattern.type)) {
            return {
                signal: 'HOLD',
                confidence: 50,
                sl: 0,
                tp: 0,
                reasoning: 'Swing mode: Waiting for H&S or Double Top/Bottom',
                risk_level: 'MEDIUM'
            };
        }
        
        // Swing: Must align with trend
        if (bestPattern.direction === 'BULLISH' && trend === 'bearish') {
            return { signal: 'HOLD', confidence: 40, sl: 0, tp: 0, reasoning: 'Pattern vs Trend conflict', risk_level: 'HIGH' };
        }
        if (bestPattern.direction === 'BEARISH' && trend === 'bullish') {
            return { signal: 'HOLD', confidence: 40, sl: 0, tp: 0, reasoning: 'Pattern vs Trend conflict', risk_level: 'HIGH' };
        }
        
        // Must have volume
        if (!volume) {
            return { signal: 'HOLD', confidence: 45, sl: 0, tp: 0, reasoning: 'Low volume. No swing entry.', risk_level: 'HIGH' };
        }
        
        // Must be at key level
        if (!keyLevel) {
            return { signal: 'HOLD', confidence: 50, sl: 0, tp: 0, reasoning: 'Not at key S/R level', risk_level: 'MEDIUM' };
        }
        
        // RSI check
        if (bestPattern.direction === 'BULLISH' && indicators.rsi > 70) {
            return { signal: 'HOLD', confidence: 45, sl: 0, tp: 0, reasoning: 'RSI overbought', risk_level: 'HIGH' };
        }
        if (bestPattern.direction === 'BEARISH' && indicators.rsi < 30) {
            return { signal: 'HOLD', confidence: 45, sl: 0, tp: 0, reasoning: 'RSI oversold', risk_level: 'HIGH' };
        }
        
        const signal = bestPattern.direction === 'BULLISH' ? 'BUY' : 'SELL';
        return {
            signal: signal,
            confidence: Math.min(92, bestPattern.confidence + 12),
            sl: 30,
            tp: 60,
            reasoning: `SWING: ${bestPattern.type} + ALL CONFIRMED`,
            risk_level: 'LOW'
        };
    }
}

// Check Volume Confirmation
function checkVolumeConfirmation() {
    if (marketData.prices.length < 10) return false;
    const recent = marketData.prices.slice(-10);
    const avgVolume = recent.reduce((sum, c) => sum + (c.volume || 1000), 0) / 10;
    const lastVolume = recent[recent.length - 1].volume || 1000;
    return lastVolume > avgVolume * 1.5;
}

// Check Volume Spike (3x for scalping)
function checkVolumeSpike() {
    if (marketData.prices.length < 10) return false;
    const recent = marketData.prices.slice(-10);
    const avgVolume = recent.reduce((sum, c) => sum + (c.volume || 1000), 0) / 10;
    const lastVolume = recent[recent.length - 1].volume || 1000;
    return lastVolume > avgVolume * 2;
}

// Detect Bull/Bear Flag
function detectFlag(candles) {
    if (candles.length < 8) return null;
    
    const first3 = candles.slice(0, 3);
    const last5 = candles.slice(-5);
    
    // Check for strong move (flagpole)
    const flagpoleMove = Math.abs(first3[2].close - first3[0].open);
    const avgMove = candles.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / candles.length;
    
    if (flagpoleMove < avgMove * 2) return null;
    
    // Check for consolidation (flag body)
    const flagHigh = Math.max(...last5.map(c => c.high));
    const flagLow = Math.min(...last5.map(c => c.low));
    const flagRange = flagHigh - flagLow;
    
    if (flagRange / flagpoleMove > 0.5) return null;
    
    // Determine direction
    if (first3[2].close > first3[0].open) {
        return 'BULL_FLAG';
    } else {
        return 'BEAR_FLAG';
    }
}

// Check Key Level (Support/Resistance)
function checkKeyLevel(price) {
    const prices = marketData.prices.slice(-100).map(c => c.close);
    const highs = marketData.prices.slice(-100).map(c => c.high);
    const lows = marketData.prices.slice(-100).map(c => c.low);
    
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    
    const atResistance = Math.abs(price - resistance) / resistance < 0.005;
    const atSupport = Math.abs(price - support) / support < 0.005;
    
    return atResistance || atSupport;
}

// Full AI (Groq)
async function getFullAISignal() {
    try {
        const recentCandles = marketData.prices.slice(-50).map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
        }));
        
        const prompt = `Analyze this XAU/USD chart data and detect patterns (Head & Shoulders, Double Top/Bottom, Triangles). Current price: ${marketData.bid}. Candles: ${JSON.stringify(recentCandles.slice(-10))}. Give BUY/SELL/HOLD signal with confidence %.`;
        
        // Use Vercel serverless function if available, otherwise prompt user
        const isVercel = window.location.hostname.includes('vercel.app');
        let response;
        
        if (isVercel) {
            // Call Vercel API endpoint
            response = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
        } else {
            // Local/GitHub Pages - prompt for API key
            let apiKey = CONFIG.GROQ_API_KEY;
            if (apiKey === 'YOUR_GROQ_API_KEY_HERE') {
                apiKey = prompt('Enter your Groq API key (get from https://console.groq.com):');
                if (!apiKey) {
                    console.log('No API key provided, skipping AI analysis');
                    return await getPatternSignal(tradingStyle);
                }
            }
            
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 200
                })
            });
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        const signal = aiResponse.includes('BUY') ? 'BUY' : aiResponse.includes('SELL') ? 'SELL' : 'HOLD';
        const confidence = parseInt(aiResponse.match(/\d+%/)?.[0]) || 60;
        
        return {
            signal: signal,
            confidence: confidence,
            sl: 15,
            tp: 30,
            reasoning: aiResponse.substring(0, 100),
            risk_level: confidence > 75 ? 'LOW' : 'MEDIUM'
        };
    } catch (error) {
        console.log('Groq API failed:', error);
        return await getPatternSignal();
    }
}

// Hybrid (Pattern + AI)
async function getHybridSignal(tradingStyle = 'scalping') {
    const patternSignal = await getPatternSignal(tradingStyle);
    
    if (patternSignal.confidence < 70) {
        return patternSignal;
    }
    
    try {
        const aiSignal = await getFullAISignal();
        
        if (patternSignal.signal === aiSignal.signal) {
            return {
                signal: patternSignal.signal,
                confidence: Math.min(95, (patternSignal.confidence + aiSignal.confidence) / 2 + 10),
                sl: 15,
                tp: 35,
                reasoning: `Pattern + AI Confirmed: ${patternSignal.reasoning}`,
                risk_level: 'LOW'
            };
        }
    } catch (error) {}
    
    return patternSignal;
}

// Initialize Trading System
function initTradingSystem() {
    authSystem = window.authSystem;
    tradingSystem = window.tradingSystem;
    
    // Check if user already logged in
    if (authSystem.isLoggedIn()) {
        const username = authSystem.getCurrentUser();
        tradingSystem.login(username);
        document.getElementById('userIdDisplay').textContent = username;
        document.getElementById('btnLoginShow').textContent = '🚪';
        document.getElementById('btnLoginShow').title = 'Logout';
        document.getElementById('btnLoginShow').onclick = handleLogout;
        isGuestMode = false;
    } else {
        // Guest mode - use localStorage without login
        tradingSystem.login('guest');
        isGuestMode = true;
    }
    
    updateTradingDisplay();
}

// Auth Functions
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('authError').textContent = '';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function handleLogin() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    
    if (!username || !password) {
        document.getElementById('authError').textContent = 'Masukkan username dan password';
        return;
    }
    
    const result = authSystem.login(username, password);
    if (!result.success) {
        document.getElementById('authError').textContent = result.error;
        return;
    }
    
    // Switch from guest to user account
    tradingSystem.logout();
    tradingSystem.login(username);
    
    document.getElementById('userIdDisplay').textContent = username;
    document.getElementById('btnLoginShow').textContent = '🚪';
    document.getElementById('btnLoginShow').title = 'Logout';
    document.getElementById('btnLoginShow').onclick = handleLogout;
    isGuestMode = false;
    
    closeAuthModal();
    updateTradingDisplay();
    showTradeNotification(`✅ Welcome back, ${username}!`);
}

function handleSignup() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    
    if (!username || !password) {
        document.getElementById('authError').textContent = 'Masukkan username dan password';
        return;
    }
    
    if (password.length < 4) {
        document.getElementById('authError').textContent = 'Password minimum 4 karakter';
        return;
    }
    
    const result = authSystem.signup(username, password);
    if (!result.success) {
        document.getElementById('authError').textContent = result.error;
        return;
    }
    
    // Auto login after signup
    authSystem.login(username, password);
    tradingSystem.logout();
    tradingSystem.login(username);
    
    document.getElementById('userIdDisplay').textContent = username;
    document.getElementById('btnLoginShow').textContent = '🚪';
    document.getElementById('btnLoginShow').title = 'Logout';
    document.getElementById('btnLoginShow').onclick = handleLogout;
    isGuestMode = false;
    
    closeAuthModal();
    updateTradingDisplay();
    showTradeNotification(`✅ Account created! Welcome ${username}!`);
}

function handleLogout() {
    if (!confirm('Logout? Progress akan disimpan.')) return;
    
    authSystem.logout();
    tradingSystem.logout();
    location.reload();
}

// Settings Functions
function handleBalanceChange(e) {
    const balance = parseFloat(e.target.value);
    tradingSystem.setBalance(balance);
    updateTradingDisplay();
    showTradeNotification(`💰 Balance set to $${balance.toLocaleString()}`);
}

function handleLeverageChange(e) {
    const leverage = parseInt(e.target.value);
    tradingSystem.setLeverage(leverage);
    updateTradingDisplay();
    showTradeNotification(`⚡ Leverage set to 1:${leverage}`);
}

function showSettings() {
    const leverage = prompt('Set Leverage (100, 1000, 3000):', tradingSystem.account.leverage);
    if (leverage) {
        tradingSystem.setLeverage(parseInt(leverage));
        updateTradingDisplay();
        showTradeNotification(`⚡ Leverage set to 1:${leverage}`);
    }
}

function resetAccount() {
    if (!confirm('Reset account? Semua history akan hilang!')) return;
    const currentLeverage = tradingSystem.account.leverage;
    tradingSystem.reset();
    tradingSystem.setLeverage(currentLeverage);
    
    // Reset balance selector
    document.getElementById('balanceSelect').value = '10000';
    
    updateTradingDisplay();
    showTradeNotification('🔄 Account reset');
}

// Lot Size Management
function adjustLot(amount) {
    currentLotSize = Math.max(0.01, Math.min(10, currentLotSize + amount));
    currentLotSize = Math.round(currentLotSize * 100) / 100;
    document.getElementById('lotSize').value = currentLotSize;
    updateRequiredMargin();
}

function updateRequiredMargin() {
    if (!tradingSystem || !marketData.bid) return;
    const margin = tradingSystem.calculateMargin(currentLotSize, marketData.bid);
    document.getElementById('requiredMargin').textContent = '$' + margin.toFixed(2);
}

// Trading Functions
function executeTrade(type) {
    if (!tradingSystem) return;
    
    const price = type === 'BUY' ? marketData.ask : marketData.bid;
    const tpPips = parseFloat(document.getElementById('takeProfitPips').value) || 15;
    const slPips = parseFloat(document.getElementById('stopLossPips').value) || 10;
    
    // Calculate TP/SL prices
    const pipValue = 0.1; // For XAU/USD, 1 pip = $0.10
    let tpPrice, slPrice;
    
    if (type === 'BUY') {
        tpPrice = price + (tpPips * pipValue);
        slPrice = price - (slPips * pipValue);
    } else {
        tpPrice = price - (tpPips * pipValue);
        slPrice = price + (slPips * pipValue);
    }
    
    const result = tradingSystem.openPosition(type, currentLotSize, price, slPrice, tpPrice);
    
    if (!result.success) {
        alert('⚠️ ' + result.error);
        return;
    }
    
    updateTradingDisplay();
    showTradeNotification(`✅ ${type} ${currentLotSize} lot at ${price.toFixed(2)} | TP: ${tpPrice.toFixed(2)} SL: ${slPrice.toFixed(2)}`);
}

function closeAllPositions() {
    if (!tradingSystem || tradingSystem.account.positions.length === 0) {
        alert('⚠️ Tiada position!');
        return;
    }
    
    const price = marketData.bid;
    const results = tradingSystem.closeAllPositions(price);
    
    let totalProfit = 0;
    results.forEach(r => {
        if (r.success) totalProfit += r.trade.profit;
    });
    
    updateTradingDisplay();
    const emoji = totalProfit >= 0 ? '🎉' : '😔';
    showTradeNotification(`${emoji} All closed! P/L: $${totalProfit.toFixed(2)}`);
}

function closePosition(positionId) {
    const price = marketData.bid;
    const result = tradingSystem.closePosition(positionId, price);
    
    if (!result.success) {
        alert('⚠️ ' + result.error);
        return;
    }
    
    updateTradingDisplay();
    const emoji = result.trade.profit >= 0 ? '🎉' : '😔';
    showTradeNotification(`${emoji} Closed! P/L: $${result.trade.profit.toFixed(2)}`);
}

// Update Display
function updateTradingDisplay() {
    if (!tradingSystem) return;
    
    const acc = tradingSystem.account;
    const stats = tradingSystem.getStats();
    
    // Update account info
    document.getElementById('walletBalance').textContent = '$' + acc.balance.toLocaleString('en-US', {maximumFractionDigits: 0});
    document.getElementById('walletEquity').textContent = '$' + acc.equity.toLocaleString('en-US', {maximumFractionDigits: 0});
    document.getElementById('walletMargin').textContent = '$' + acc.margin.toFixed(0);
    document.getElementById('walletFreeMargin').textContent = '$' + acc.freeMargin.toLocaleString('en-US', {maximumFractionDigits: 0});
    document.getElementById('walletLeverage').textContent = '1:' + acc.leverage;
    
    // Update P/L
    const totalPL = stats.netProfit;
    const plElement = document.getElementById('walletPL');
    plElement.textContent = (totalPL >= 0 ? '+' : '') + '$' + totalPL.toFixed(2);
    plElement.className = 'wallet-pl-value ' + (totalPL >= 0 ? 'profit' : 'loss');
    
    // Update selectors
    document.getElementById('leverageSelect').value = acc.leverage;
    
    // Sync with Today's Performance
    document.getElementById('totalSignals').textContent = stats.totalTrades;
    document.getElementById('winRate').textContent = stats.winRate + '%';
    
    const profitElement = document.getElementById('totalProfit');
    profitElement.textContent = (totalPL >= 0 ? '+' : '') + '$' + totalPL.toFixed(0);
    profitElement.className = 'stat-value ' + (totalPL >= 0 ? 'profit' : 'loss');
    
    // Calculate accuracy based on recent trades
    const recentTrades = acc.history.slice(0, 10);
    const recentWins = recentTrades.filter(t => t.profit > 0).length;
    const accuracy = recentTrades.length > 0 ? ((recentWins / recentTrades.length) * 100).toFixed(0) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    // Update positions list
    const positionsList = document.getElementById('positionsList');
    if (acc.positions.length === 0) {
        positionsList.innerHTML = '<div class="no-position">Tiada position aktif</div>';
        document.getElementById('btnCloseAll').disabled = true;
    } else {
        positionsList.innerHTML = acc.positions.map(pos => {
            const currentPrice = marketData.bid;
            const profit = tradingSystem.calculateProfit(pos, currentPrice);
            const pips = tradingSystem.calculatePips(pos, currentPrice);
            
            return `
                <div class="position-card ${pos.type.toLowerCase()}">
                    <div class="position-header">
                        <span class="position-badge">${pos.type} ${pos.lotSize}</span>
                        <button class="btn-close-position" onclick="closePosition(${pos.id})">Close</button>
                    </div>
                    <div class="position-info">
                        <div><span>Entry:</span> <strong>${pos.entryPrice.toFixed(2)}</strong></div>
                        <div><span>Current:</span> <strong>${currentPrice.toFixed(2)}</strong></div>
                        <div><span>TP:</span> <strong class="profit">${pos.takeProfit ? pos.takeProfit.toFixed(2) : '-'}</strong></div>
                        <div><span>SL:</span> <strong class="loss">${pos.stopLoss ? pos.stopLoss.toFixed(2) : '-'}</strong></div>
                        <div><span>Pips:</span> <strong>${pips}</strong></div>
                        <div><span>P/L:</span> <strong class="${profit >= 0 ? 'profit' : 'loss'}">${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}</strong></div>
                    </div>
                </div>
            `;
        }).join('');
        document.getElementById('btnCloseAll').disabled = false;
    }
    
    // Update history
    const historyList = document.getElementById('tradeHistory');
    if (acc.history.length === 0) {
        historyList.innerHTML = '<div class="no-history">Belum ada trade history</div>';
    } else {
        historyList.innerHTML = acc.history.slice(0, 5).map(trade => `
            <div class="history-item ${trade.profit >= 0 ? 'win' : 'loss'}">
                <div class="history-header">
                    <span class="history-type">${trade.type} ${trade.lotSize}</span>
                    <span class="history-pl ${trade.profit >= 0 ? 'profit' : 'loss'}">${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(2)}</span>
                </div>
                <div class="history-details">
                    <small>${trade.entryPrice.toFixed(2)} → ${trade.exitPrice.toFixed(2)} (${trade.pips} pips)</small>
                </div>
            </div>
        `).join('');
    }
    
    updateRequiredMargin();
}

function showTradeNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'trade-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update P/L in real-time
setInterval(() => {
    if (tradingSystem && tradingSystem.account.positions.length > 0) {
        tradingSystem.updateEquity(marketData.bid);
        tradingSystem.updateMargin();
        updateTradingDisplay();
    }
}, 1000);

// Calculate Technical Indicators
function calculateIndicators() {
    if (marketData.prices.length === 0) {
        return {
            rsi: 50,
            macd: 0,
            bb: { upper: 0, middle: 0, lower: 0 },
            trend: 'neutral'
        };
    }
    
    const prices = marketData.prices.slice(-50).map(c => c.close);
    
    // RSI
    const rsi = calculateRSI(prices, 14);
    
    // MACD
    const macd = calculateMACD(prices);
    
    // Bollinger Bands
    const bb = calculateBollingerBands(prices, 20, 2);
    
    // Trend
    const trend = calculateTrend(prices);

    return { rsi, macd, bb, trend };
}

// RSI Calculation
function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// MACD Calculation
function calculateMACD(prices) {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    return ema12 - ema26;
}

// EMA Calculation
function calculateEMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
    
    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
}

// Bollinger Bands Calculation
function calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length === 0) {
        return { upper: 0, middle: 0, lower: 0 };
    }
    
    if (prices.length < period) {
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        return { upper: avg + 10, middle: avg, lower: avg - 10 };
    }
    
    const recentPrices = prices.slice(-period);
    const middle = recentPrices.reduce((a, b) => a + b) / period;
    
    const variance = recentPrices.reduce((sum, price) => {
        return sum + Math.pow(price - middle, 2);
    }, 0) / period;
    
    const std = Math.sqrt(variance);
    
    return {
        upper: middle + (std * stdDev),
        middle: middle,
        lower: middle - (std * stdDev)
    };
}

// Trend Calculation
function calculateTrend(prices) {
    if (prices.length < 10) return 'neutral';
    
    const recent = prices.slice(-10);
    const slope = (recent[recent.length - 1] - recent[0]) / recent.length;
    
    if (slope > 0.5) return 'bullish';
    if (slope < -0.5) return 'bearish';
    return 'neutral';
}

// Generate Local Signal (fallback)
function generateLocalSignal(indicators) {
    let buyScore = 0;
    let sellScore = 0;
    const reasons = [];

    // RSI Analysis
    if (indicators.rsi < 30) {
        buyScore += 30;
        reasons.push('RSI oversold');
    } else if (indicators.rsi > 70) {
        sellScore += 30;
        reasons.push('RSI overbought');
    }

    // MACD Analysis
    if (indicators.macd > 0) {
        buyScore += 20;
        reasons.push('MACD bullish');
    } else {
        sellScore += 20;
        reasons.push('MACD bearish');
    }

    // Bollinger Bands
    if (marketData.bid < indicators.bb.lower) {
        buyScore += 25;
        reasons.push('Price below lower BB');
    } else if (marketData.bid > indicators.bb.upper) {
        sellScore += 25;
        reasons.push('Price above upper BB');
    }

    // Trend
    if (indicators.trend === 'bullish') {
        buyScore += 15;
        reasons.push('Bullish trend');
    } else if (indicators.trend === 'bearish') {
        sellScore += 15;
        reasons.push('Bearish trend');
    }

    let signal, confidence;
    if (buyScore > sellScore && buyScore > 40) {
        signal = 'BUY';
        confidence = Math.min(95, buyScore);
    } else if (sellScore > buyScore && sellScore > 40) {
        signal = 'SELL';
        confidence = Math.min(95, sellScore);
    } else {
        signal = 'HOLD';
        confidence = 50;
    }

    const atr = 5;
    return {
        signal,
        confidence,
        sl: atr * 1.5,
        tp: atr * 3,
        lot_size: 0.01,
        reasoning: reasons.join(' | '),
        risk_level: confidence > 70 ? 'LOW' : 'MEDIUM'
    };
}

// Update Indicators Display
function updateIndicatorsDisplay(indicators) {
    // RSI
    document.getElementById('rsiValue').textContent = indicators.rsi.toFixed(1);
    const rsiSignal = document.getElementById('rsiSignal');
    if (indicators.rsi < 30) {
        rsiSignal.textContent = 'OVERSOLD';
        rsiSignal.className = 'indicator-signal bullish';
    } else if (indicators.rsi > 70) {
        rsiSignal.textContent = 'OVERBOUGHT';
        rsiSignal.className = 'indicator-signal bearish';
    } else {
        rsiSignal.textContent = 'NEUTRAL';
        rsiSignal.className = 'indicator-signal neutral';
    }

    // MACD
    document.getElementById('macdValue').textContent = indicators.macd.toFixed(2);
    const macdSignal = document.getElementById('macdSignal');
    if (indicators.macd > 0) {
        macdSignal.textContent = 'BULLISH';
        macdSignal.className = 'indicator-signal bullish';
    } else {
        macdSignal.textContent = 'BEARISH';
        macdSignal.className = 'indicator-signal bearish';
    }

    // Bollinger Bands
    const bbPosition = ((marketData.bid - indicators.bb.lower) / (indicators.bb.upper - indicators.bb.lower) * 100).toFixed(0);
    document.getElementById('bbValue').textContent = bbPosition + '%';
    const bbSignal = document.getElementById('bbSignal');
    if (bbPosition < 20) {
        bbSignal.textContent = 'LOWER';
        bbSignal.className = 'indicator-signal bullish';
    } else if (bbPosition > 80) {
        bbSignal.textContent = 'UPPER';
        bbSignal.className = 'indicator-signal bearish';
    } else {
        bbSignal.textContent = 'MIDDLE';
        bbSignal.className = 'indicator-signal neutral';
    }

    // Trend
    document.getElementById('trendValue').textContent = indicators.trend.toUpperCase();
    const trendSignal = document.getElementById('trendSignal');
    if (indicators.trend === 'bullish') {
        trendSignal.textContent = 'UP';
        trendSignal.className = 'indicator-signal bullish';
    } else if (indicators.trend === 'bearish') {
        trendSignal.textContent = 'DOWN';
        trendSignal.className = 'indicator-signal bearish';
    } else {
        trendSignal.textContent = 'FLAT';
        trendSignal.className = 'indicator-signal neutral';
    }
}

// Update Signal Display
function updateSignalDisplay(signal) {
    const signalCard = document.getElementById('signalCard');
    const signalType = document.getElementById('signalType');
    const signalBadge = document.getElementById('signalBadge');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceValue = document.getElementById('confidenceValue');

    // Update signal type
    signalType.textContent = signal.signal;
    signalType.className = `signal-type ${signal.signal}`;

    // Update badge
    signalBadge.textContent = signal.signal === 'HOLD' ? 'WAITING' : 'ACTIVE';

    // Update confidence
    confidenceFill.style.width = signal.confidence + '%';
    confidenceValue.textContent = signal.confidence + '%';

    // Update details
    document.getElementById('entryPrice').textContent = marketData.bid.toFixed(2);
    document.getElementById('stopLoss').textContent = signal.sl ? signal.sl.toFixed(1) + ' pips' : '-';
    document.getElementById('takeProfit').textContent = signal.tp ? signal.tp.toFixed(1) + ' pips' : '-';
    
    const rr = signal.tp && signal.sl ? (signal.tp / signal.sl).toFixed(2) : '-';
    document.getElementById('riskReward').textContent = rr !== '-' ? '1:' + rr : '-';

    // Update reasoning
    document.getElementById('signalReasoning').textContent = signal.reasoning || 'Analyzing market conditions...';
}

// Show Alert
function showAlert(signal) {
    const alertContainer = document.getElementById('alertContainer');
    
    const alert = document.createElement('div');
    alert.className = `alert ${signal.signal.toLowerCase()}`;
    
    alert.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">🔔 ${signal.signal} Signal</div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="alert-body">
            <strong>Confidence:</strong> ${signal.confidence}%<br>
            <strong>Entry:</strong> ${marketData.bid.toFixed(2)}<br>
            <strong>TP:</strong> ${signal.tp} pips | <strong>SL:</strong> ${signal.sl} pips
        </div>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        alert.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => alert.remove(), 300);
    }, 10000);
}

// Get Market Session
function getMarketSession() {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8) return 'asian';
    if (hour >= 8 && hour < 16) return 'london';
    return 'newyork';
}

// Check if in trading session (London+NY overlap)
function isActiveSession() {
    const now = new Date();
    const hour = now.getUTCHours();
    // London+NY overlap: 12:00-16:00 UTC (8PM-12AM MYT)
    return hour >= 12 && hour < 16;
}

// HUNTER MODE: Professional Scalping System
async function getHunterSignal() {
    const indicators = calculateIndicators();
    
    // 1. SESSION FILTER - Only trade during London+NY overlap
    if (!isActiveSession()) {
        return {
            signal: 'HOLD',
            confidence: 0,
            sl: 0,
            tp: 0,
            reasoning: '🚫 Outside trading hours (London+NY overlap: 8PM-12AM MYT)',
            risk_level: 'HIGH'
        };
    }
    
    // 2. TREND CONTEXT (M15 simulation using M5 data)
    const prices = marketData.prices.map(c => c.close);
    const ema50 = calculateEMA(prices, 50);
    const ema100 = calculateEMA(prices, 100);
    const currentPrice = marketData.bid;
    
    const trendBullish = currentPrice > ema50 && ema50 > ema100;
    const trendBearish = currentPrice < ema50 && ema50 < ema100;
    
    if (!trendBullish && !trendBearish) {
        return {
            signal: 'HOLD',
            confidence: 40,
            sl: 0,
            tp: 0,
            reasoning: '🌫️ No clear trend - waiting for direction',
            risk_level: 'HIGH'
        };
    }
    
    // 3. KEY LEVEL DETECTION
    const recentCandles = marketData.prices.slice(-100);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    
    // Pivot Points (simplified daily pivot)
    const high = Math.max(...highs);
    const low = Math.min(...lows);
    const close = recentCandles[recentCandles.length - 1].close;
    const pivot = (high + low + close) / 3;
    const r1 = 2 * pivot - low;
    const s1 = 2 * pivot - high;
    
    // Round numbers
    const roundNumber = Math.round(currentPrice / 10) * 10;
    
    // Check if at key level
    const atPivot = Math.abs(currentPrice - pivot) < 2;
    const atR1 = Math.abs(currentPrice - r1) < 2;
    const atS1 = Math.abs(currentPrice - s1) < 2;
    const atRound = Math.abs(currentPrice - roundNumber) < 1;
    const atSupport = Math.abs(currentPrice - low) < 2;
    const atResistance = Math.abs(currentPrice - high) < 2;
    
    const atKeyLevel = atPivot || atR1 || atS1 || atRound || atSupport || atResistance;
    
    if (!atKeyLevel) {
        return {
            signal: 'HOLD',
            confidence: 30,
            sl: 0,
            tp: 0,
            reasoning: '🎯 Price not at key level - waiting for zone',
            risk_level: 'HIGH'
        };
    }
    
    // 4. STOCHASTIC SIMULATION (using RSI as proxy)
    const stochOversold = indicators.rsi < 30;
    const stochOverbought = indicators.rsi > 70;
    
    // 5. CANDLESTICK PATTERN DETECTION (M1)
    const last3 = marketData.prices.slice(-3);
    const prevCandle = last3[last3.length - 2];
    const lastCandle = last3[last3.length - 1];
    
    // Bullish Engulfing
    const bullishEngulfing = 
        prevCandle.close < prevCandle.open && // Previous bearish
        lastCandle.close > lastCandle.open && // Current bullish
        lastCandle.open <= prevCandle.close && // Opens at/below prev close
        lastCandle.close >= prevCandle.open; // Closes at/above prev open
    
    // Bearish Engulfing
    const bearishEngulfing = 
        prevCandle.close > prevCandle.open && // Previous bullish
        lastCandle.close < lastCandle.open && // Current bearish
        lastCandle.open >= prevCandle.close && // Opens at/above prev close
        lastCandle.close <= prevCandle.open; // Closes at/below prev open
    
    // Hammer (Bullish Pin Bar)
    const bodySize = Math.abs(lastCandle.close - lastCandle.open);
    const lowerWick = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;
    const upperWick = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
    const hammer = lowerWick > bodySize * 2 && upperWick < bodySize;
    
    // Shooting Star (Bearish Pin Bar)
    const shootingStar = upperWick > bodySize * 2 && lowerWick < bodySize;
    
    // 6. HUNTER SETUP - BUY
    if (trendBullish && atKeyLevel && stochOversold && (bullishEngulfing || hammer)) {
        let keyLevelName = 'Key Level';
        if (atS1) keyLevelName = 'Pivot S1';
        else if (atSupport) keyLevelName = 'Support';
        else if (atRound) keyLevelName = `Round ${roundNumber}`;
        
        const patternName = bullishEngulfing ? 'Bullish Engulfing' : 'Hammer';
        const newsBoost = newsSentiment.score > 0 ? 10 : 0;
        
        return {
            signal: 'BUY',
            confidence: Math.min(95, 85 + newsBoost),
            sl: 10,
            tp: 15,
            reasoning: `🎯 HUNTER: ${patternName} at ${keyLevelName} | Uptrend confirmed`,
            risk_level: 'LOW'
        };
    }
    
    // 7. HUNTER SETUP - SELL
    if (trendBearish && atKeyLevel && stochOverbought && (bearishEngulfing || shootingStar)) {
        let keyLevelName = 'Key Level';
        if (atR1) keyLevelName = 'Pivot R1';
        else if (atResistance) keyLevelName = 'Resistance';
        else if (atRound) keyLevelName = `Round ${roundNumber}`;
        
        const patternName = bearishEngulfing ? 'Bearish Engulfing' : 'Shooting Star';
        const newsBoost = newsSentiment.score < 0 ? 10 : 0;
        
        return {
            signal: 'SELL',
            confidence: Math.min(95, 85 + newsBoost),
            sl: 10,
            tp: 15,
            reasoning: `🎯 HUNTER: ${patternName} at ${keyLevelName} | Downtrend confirmed`,
            risk_level: 'LOW'
        };
    }
    
    // 8. WAITING FOR PERFECT SETUP
    let waitingFor = [];
    if (!atKeyLevel) waitingFor.push('key level');
    if (trendBullish && !stochOversold) waitingFor.push('oversold');
    if (trendBearish && !stochOverbought) waitingFor.push('overbought');
    if (!bullishEngulfing && !bearishEngulfing && !hammer && !shootingStar) waitingFor.push('pattern');
    
    return {
        signal: 'HOLD',
        confidence: 50,
        sl: 0,
        tp: 0,
        reasoning: `🎯 HUNTER: Waiting for ${waitingFor.join(', ')}`,
        risk_level: 'MEDIUM'
    };
}

// SNIPER MODE: Focus on Best Patterns Only (H&S, Double Top/Bottom)
async function getSniperSignal() {
    const detector = new PatternDetector();
    const patterns = detector.detectAllPatterns(marketData.prices);
    const indicators = calculateIndicators();
    
    // FILTER: Only accept 2 best patterns
    const bestPatterns = patterns.filter(p => 
        p.type === 'HEAD_AND_SHOULDERS' || 
        p.type === 'INVERSE_HEAD_AND_SHOULDERS' ||
        p.type === 'DOUBLE_TOP' ||
        p.type === 'DOUBLE_BOTTOM'
    );
    
    if (bestPatterns.length === 0) {
        return {
            signal: 'HOLD',
            confidence: 0,
            sl: 0,
            tp: 0,
            reasoning: '🎯 SNIPER: Waiting for H&S or Double Top/Bottom pattern',
            risk_level: 'HIGH'
        };
    }
    
    const pattern = bestPatterns[0];
    const currentPrice = marketData.bid;
    
    // CONFIRMATION 1: Volume Check
    const recentCandles = marketData.prices.slice(-20);
    const avgVolume = recentCandles.reduce((sum, c) => sum + (c.volume || 1000), 0) / 20;
    const lastVolume = recentCandles[recentCandles.length - 1].volume || 1000;
    const volumeConfirmed = lastVolume > avgVolume * 1.5;
    
    if (!volumeConfirmed) {
        return {
            signal: 'HOLD',
            confidence: 40,
            sl: 0,
            tp: 0,
            reasoning: `🎯 SNIPER: ${pattern.type} detected but LOW VOLUME - waiting`,
            risk_level: 'HIGH'
        };
    }
    
    // CONFIRMATION 2: RSI Momentum
    const rsiBullish = indicators.rsi > 40 && indicators.rsi < 65;
    const rsiBearish = indicators.rsi < 60 && indicators.rsi > 35;
    
    if (pattern.direction === 'BULLISH' && !rsiBullish) {
        return {
            signal: 'HOLD',
            confidence: 45,
            sl: 0,
            tp: 0,
            reasoning: `🎯 SNIPER: ${pattern.type} but RSI not optimal - waiting`,
            risk_level: 'MEDIUM'
        };
    }
    
    if (pattern.direction === 'BEARISH' && !rsiBearish) {
        return {
            signal: 'HOLD',
            confidence: 45,
            sl: 0,
            tp: 0,
            reasoning: `🎯 SNIPER: ${pattern.type} but RSI not optimal - waiting`,
            risk_level: 'MEDIUM'
        };
    }
    
    // CONFIRMATION 3: Key S/R Level
    const highs = marketData.prices.slice(-100).map(c => c.high);
    const lows = marketData.prices.slice(-100).map(c => c.low);
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    
    const atResistance = Math.abs(currentPrice - resistance) / resistance < 0.005;
    const atSupport = Math.abs(currentPrice - support) / support < 0.005;
    const atKeyLevel = atResistance || atSupport;
    
    if (!atKeyLevel) {
        return {
            signal: 'HOLD',
            confidence: 50,
            sl: 0,
            tp: 0,
            reasoning: `🎯 SNIPER: ${pattern.type} but NOT at key S/R - waiting`,
            risk_level: 'MEDIUM'
        };
    }
    
    // CONFIRMATION 4: Trend Alignment
    const prices = marketData.prices.map(c => c.close);
    const ema50 = calculateEMA(prices, 50);
    const trendBullish = currentPrice > ema50;
    const trendBearish = currentPrice < ema50;
    
    if (pattern.direction === 'BULLISH' && trendBearish) {
        return {
            signal: 'HOLD',
            confidence: 35,
            sl: 0,
            tp: 0,
            reasoning: `🎯 SNIPER: ${pattern.type} but AGAINST trend - rejected`,
            risk_level: 'HIGH'
        };
    }
    
    if (pattern.direction === 'BEARISH' && trendBullish) {
        return {
            signal: 'HOLD',
            confidence: 35,
            sl: 0,
            tp: 0,
            reasoning: `🎯 SNIPER: ${pattern.type} but AGAINST trend - rejected`,
            risk_level: 'HIGH'
        };
    }
    
    // ALL CONFIRMATIONS PASSED - PERFECT SETUP!
    const signal = pattern.direction === 'BULLISH' ? 'BUY' : 'SELL';
    const newsBoost = (pattern.direction === 'BULLISH' && newsSentiment.score > 0) || 
                      (pattern.direction === 'BEARISH' && newsSentiment.score < 0) ? 5 : 0;
    
    const levelName = atResistance ? 'Resistance' : 'Support';
    
    return {
        signal: signal,
        confidence: Math.min(98, 88 + newsBoost),
        sl: 25,
        tp: 50,
        reasoning: `🎯 SNIPER: PERFECT ${pattern.type} at ${levelName} | Volume + RSI + Trend ALL CONFIRMED`,
        risk_level: 'LOW'
    };
}

// ULTIMATE SNIPER MODE: Deep 50-Candle Structure Analysis
async function getUltimateSniperSignal() {
    if (marketData.prices.length < 50) {
        return {
            signal: 'HOLD',
            confidence: 0,
            sl: 0,
            tp: 0,
            reasoning: '👑 ULTIMATE: Insufficient data (need 50 candles)',
            risk_level: 'HIGH'
        };
    }
    
    const last50 = marketData.prices.slice(-50);
    const indicators = calculateIndicators();
    const currentPrice = marketData.bid;
    
    // 1. STRUCTURE ANALYSIS - Higher Highs/Lower Lows
    const highs = last50.map(c => c.high);
    const lows = last50.map(c => c.low);
    
    // Split into 3 segments (early, mid, late)
    const early = last50.slice(0, 17);
    const mid = last50.slice(17, 34);
    const late = last50.slice(34, 50);
    
    const earlyHigh = Math.max(...early.map(c => c.high));
    const earlyLow = Math.min(...early.map(c => c.low));
    const midHigh = Math.max(...mid.map(c => c.high));
    const midLow = Math.min(...mid.map(c => c.low));
    const lateHigh = Math.max(...late.map(c => c.high));
    const lateLow = Math.min(...late.map(c => c.low));
    
    // Higher Highs & Higher Lows = Strong Uptrend
    const higherHighs = midHigh > earlyHigh && lateHigh > midHigh;
    const higherLows = midLow > earlyLow && lateLow > midLow;
    const strongUptrend = higherHighs && higherLows;
    
    // Lower Highs & Lower Lows = Strong Downtrend
    const lowerHighs = midHigh < earlyHigh && lateHigh < midHigh;
    const lowerLows = midLow < earlyLow && lateLow < midLow;
    const strongDowntrend = lowerHighs && lowerLows;
    
    if (!strongUptrend && !strongDowntrend) {
        return {
            signal: 'HOLD',
            confidence: 30,
            sl: 0,
            tp: 0,
            reasoning: '👑 ULTIMATE: No clear 50-candle structure - sideways market',
            risk_level: 'HIGH'
        };
    }
    
    // 2. PATTERN CONFIRMATION
    const detector = new PatternDetector();
    const patterns = detector.detectAllPatterns(last50);
    
    const confirmedPatterns = patterns.filter(p => 
        p.type === 'HEAD_AND_SHOULDERS' || 
        p.type === 'INVERSE_HEAD_AND_SHOULDERS' ||
        p.type === 'DOUBLE_TOP' ||
        p.type === 'DOUBLE_BOTTOM' ||
        p.type === 'ASCENDING_TRIANGLE' ||
        p.type === 'DESCENDING_TRIANGLE'
    );
    
    if (confirmedPatterns.length === 0) {
        return {
            signal: 'HOLD',
            confidence: 40,
            sl: 0,
            tp: 0,
            reasoning: `👑 ULTIMATE: ${strongUptrend ? 'Uptrend' : 'Downtrend'} structure but NO pattern confirmation`,
            risk_level: 'MEDIUM'
        };
    }
    
    const pattern = confirmedPatterns[0];
    
    // 3. STRUCTURE vs PATTERN ALIGNMENT
    const structureBullish = strongUptrend;
    const structureBearish = strongDowntrend;
    const patternBullish = pattern.direction === 'BULLISH';
    const patternBearish = pattern.direction === 'BEARISH';
    
    if ((structureBullish && patternBearish) || (structureBearish && patternBullish)) {
        return {
            signal: 'HOLD',
            confidence: 35,
            sl: 0,
            tp: 0,
            reasoning: `👑 ULTIMATE: Structure vs Pattern CONFLICT - no entry`,
            risk_level: 'HIGH'
        };
    }
    
    // 4. MOMENTUM CONFIRMATION (EMA + RSI + MACD)
    const prices = last50.map(c => c.close);
    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    
    const emaBullish = ema20 > ema50 && currentPrice > ema20;
    const emaBearish = ema20 < ema50 && currentPrice < ema20;
    
    const rsiBullish = indicators.rsi > 45 && indicators.rsi < 70;
    const rsiBearish = indicators.rsi < 55 && indicators.rsi > 30;
    
    const macdBullish = indicators.macd > 0;
    const macdBearish = indicators.macd < 0;
    
    // 5. VOLUME SURGE
    const avgVolume = last50.reduce((sum, c) => sum + (c.volume || 1000), 0) / 50;
    const recentVolume = last50.slice(-5).reduce((sum, c) => sum + (c.volume || 1000), 0) / 5;
    const volumeSurge = recentVolume > avgVolume * 1.8;
    
    if (!volumeSurge) {
        return {
            signal: 'HOLD',
            confidence: 50,
            sl: 0,
            tp: 0,
            reasoning: `👑 ULTIMATE: ${pattern.type} + Structure aligned but LOW VOLUME`,
            risk_level: 'MEDIUM'
        };
    }
    
    // 6. NEWS SENTIMENT BOOST
    const newsAligned = (patternBullish && newsSentiment.score > 0) || 
                        (patternBearish && newsSentiment.score < 0);
    
    // 7. ULTIMATE SIGNAL - ALL STARS ALIGNED
    if (structureBullish && patternBullish && emaBullish && rsiBullish && macdBullish) {
        const newsBoost = newsAligned ? 5 : 0;
        
        return {
            signal: 'BUY',
            confidence: Math.min(99, 92 + newsBoost),
            sl: 30,
            tp: 60,
            reasoning: `👑 ULTIMATE: ${pattern.type} | 50-Candle UPTREND + Volume Surge + ALL Indicators ALIGNED`,
            risk_level: 'VERY_LOW'
        };
    }
    
    if (structureBearish && patternBearish && emaBearish && rsiBearish && macdBearish) {
        const newsBoost = newsAligned ? 5 : 0;
        
        return {
            signal: 'SELL',
            confidence: Math.min(99, 92 + newsBoost),
            sl: 30,
            tp: 60,
            reasoning: `👑 ULTIMATE: ${pattern.type} | 50-Candle DOWNTREND + Volume Surge + ALL Indicators ALIGNED`,
            risk_level: 'VERY_LOW'
        };
    }
    
    // 8. PARTIAL CONFIRMATION
    let missing = [];
    if (structureBullish) {
        if (!emaBullish) missing.push('EMA');
        if (!rsiBullish) missing.push('RSI');
        if (!macdBullish) missing.push('MACD');
    } else {
        if (!emaBearish) missing.push('EMA');
        if (!rsiBearish) missing.push('RSI');
        if (!macdBearish) missing.push('MACD');
    }
    
    return {
        signal: 'HOLD',
        confidence: 60,
        sl: 0,
        tp: 0,
        reasoning: `👑 ULTIMATE: ${pattern.type} + Structure OK but waiting for ${missing.join(', ')}`,
        risk_level: 'MEDIUM'
    };
}

// GAMBLER MODE: Extreme High Frequency - Every Candle is a Signal
async function getGamblerSignal() {
    const indicators = calculateIndicators();
    const recentCandles = marketData.prices.slice(-10);
    const lastCandle = recentCandles[recentCandles.length - 1];
    const prevCandle = recentCandles[recentCandles.length - 2];
    const currentPrice = marketData.bid;
    
    // 1. INSTANT MOMENTUM - Last candle direction
    const bullishCandle = lastCandle.close > lastCandle.open;
    const bearishCandle = lastCandle.close < lastCandle.open;
    
    // 2. CANDLE SIZE - Bigger = stronger signal
    const candleSize = Math.abs(lastCandle.close - lastCandle.open);
    const avgSize = recentCandles.slice(-5).reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / 5;
    const bigCandle = candleSize > avgSize * 0.8; // Lower threshold for more signals
    
    // 3. PRICE POSITION vs EMA (very short EMA for speed)
    const prices = marketData.prices.map(c => c.close);
    const ema10 = calculateEMA(prices, 10);
    const aboveEMA = currentPrice > ema10;
    const belowEMA = currentPrice < ema10;
    
    // 4. RSI MOMENTUM (wider range for more signals)
    const rsiBullish = indicators.rsi > 40 && indicators.rsi < 80;
    const rsiBearish = indicators.rsi < 60 && indicators.rsi > 20;
    
    // 5. CONSECUTIVE CANDLES (2 in same direction = stronger)
    const prevBullish = prevCandle.close > prevCandle.open;
    const prevBearish = prevCandle.close < prevCandle.open;
    const consecutive = (bullishCandle && prevBullish) || (bearishCandle && prevBearish);
    
    // 6. MACD DIRECTION (any direction = signal)
    const macdUp = indicators.macd > -0.5; // Very loose
    const macdDown = indicators.macd < 0.5; // Very loose
    
    // GAMBLER BUY - Very loose conditions
    if (bullishCandle && aboveEMA && rsiBullish && macdUp) {
        const confidence = consecutive ? 65 : 58;
        const boost = bigCandle ? 5 : 0;
        
        return {
            signal: 'BUY',
            confidence: Math.min(75, confidence + boost),
            sl: 5,
            tp: 8,
            reasoning: `🎲 GAMBLER: Bullish candle + Above EMA10${consecutive ? ' + Consecutive' : ''}`,
            risk_level: 'EXTREME'
        };
    }
    
    // GAMBLER SELL - Very loose conditions
    if (bearishCandle && belowEMA && rsiBearish && macdDown) {
        const confidence = consecutive ? 65 : 58;
        const boost = bigCandle ? 5 : 0;
        
        return {
            signal: 'SELL',
            confidence: Math.min(75, confidence + boost),
            sl: 5,
            tp: 8,
            reasoning: `🎲 GAMBLER: Bearish candle + Below EMA10${consecutive ? ' + Consecutive' : ''}`,
            risk_level: 'EXTREME'
        };
    }
    
    // BACKUP: Pure momentum (even looser)
    if (bullishCandle && indicators.rsi > 45) {
        return {
            signal: 'BUY',
            confidence: 52,
            sl: 5,
            tp: 8,
            reasoning: '🎲 GAMBLER: Pure bullish momentum',
            risk_level: 'EXTREME'
        };
    }
    
    if (bearishCandle && indicators.rsi < 55) {
        return {
            signal: 'SELL',
            confidence: 52,
            sl: 5,
            tp: 8,
            reasoning: '🎲 GAMBLER: Pure bearish momentum',
            risk_level: 'EXTREME'
        };
    }
    
    // ALWAYS give signal (even if weak)
    return {
        signal: bullishCandle ? 'BUY' : 'SELL',
        confidence: 50,
        sl: 5,
        tp: 8,
        reasoning: '🎲 GAMBLER: Following last candle direction (RISKY!)',
        risk_level: 'EXTREME'
    };
}

// News sentiment cache
let newsSentiment = { score: 0, reasoning: '' };

// Fetch Market News
async function fetchMarketNews() {
    // Using fallback news (free APIs have rate limits)
    // Sample news with real-world scenarios
    const sampleNews = [
        {
            title: 'Federal Reserve signals potential rate cuts amid economic slowdown',
            source_name: 'Reuters',
            pubDate: new Date().toISOString(),
            impact: 'high'
        },
        {
            title: 'Gold prices surge as investors seek safe haven assets',
            source_name: 'Bloomberg',
            pubDate: new Date(Date.now() - 3600000).toISOString(),
            impact: 'high'
        },
        {
            title: 'US Dollar weakens against major currencies',
            source_name: 'CNBC',
            pubDate: new Date(Date.now() - 7200000).toISOString(),
            impact: 'medium'
        },
        {
            title: 'Inflation data shows signs of cooling',
            source_name: 'Financial Times',
            pubDate: new Date(Date.now() - 10800000).toISOString(),
            impact: 'medium'
        },
        {
            title: 'Central banks increase gold reserves',
            source_name: 'WSJ',
            pubDate: new Date(Date.now() - 14400000).toISOString(),
            impact: 'low'
        }
    ];
    
    displayNews(sampleNews);
    analyzeNewsSentiment(sampleNews);
}

// Analyze News Sentiment for Gold
function analyzeNewsSentiment(newsItems) {
    let bullishScore = 0;
    let bearishScore = 0;
    const reasons = [];
    
    newsItems.forEach(item => {
        const title = item.title.toLowerCase();
        
        // BULLISH for Gold (score +1 to +3)
        if (title.includes('war') || title.includes('crisis') || title.includes('conflict')) {
            bullishScore += 3;
            reasons.push('⚔️ Geopolitical tension');
        }
        if (title.includes('rate cut') || title.includes('dovish')) {
            bullishScore += 3;
            reasons.push('📉 Rate cuts expected');
        }
        if (title.includes('inflation surge') || title.includes('inflation rises')) {
            bullishScore += 2;
            reasons.push('📈 Rising inflation');
        }
        if (title.includes('dollar weak') || title.includes('usd falls')) {
            bullishScore += 2;
            reasons.push('💵 Weak USD');
        }
        if (title.includes('gold surge') || title.includes('gold rally')) {
            bullishScore += 2;
            reasons.push('🏆 Gold momentum');
        }
        if (title.includes('safe haven') || title.includes('risk off')) {
            bullishScore += 2;
            reasons.push('🛡️ Safe haven demand');
        }
        
        // BEARISH for Gold (score -1 to -3)
        if (title.includes('rate hike') || title.includes('hawkish')) {
            bearishScore += 3;
            reasons.push('📈 Rate hikes expected');
        }
        if (title.includes('dollar strong') || title.includes('usd rallies')) {
            bearishScore += 2;
            reasons.push('💪 Strong USD');
        }
        if (title.includes('inflation cool') || title.includes('inflation falls')) {
            bearishScore += 2;
            reasons.push('📉 Cooling inflation');
        }
        if (title.includes('gold falls') || title.includes('gold drops')) {
            bearishScore += 2;
            reasons.push('⬇️ Gold selling pressure');
        }
    });
    
    const netScore = bullishScore - bearishScore;
    const uniqueReasons = [...new Set(reasons)].slice(0, 3);
    
    newsSentiment = {
        score: netScore,
        reasoning: uniqueReasons.join(', ') || 'Neutral news sentiment'
    };
    
    console.log('📰 News Sentiment:', netScore > 0 ? 'BULLISH' : netScore < 0 ? 'BEARISH' : 'NEUTRAL', '(Score:', netScore + ')');
}

// Display News
function displayNews(newsItems) {
    const newsList = document.getElementById('newsList');
    
    if (!newsItems || newsItems.length === 0) {
        newsList.innerHTML = '<div class="news-loading">No news available</div>';
        return;
    }
    
    newsList.innerHTML = newsItems.map(item => {
        const impact = analyzeNewsImpact(item.title);
        const timeAgo = getTimeAgo(item.pubDate);
        
        return `
            <div class="news-item ${impact}" onclick="window.open('${item.link || '#'}', '_blank')">
                <div class="news-header">
                    <div class="news-title">${item.title}</div>
                    <span class="news-impact ${impact}">${impact.toUpperCase()}</span>
                </div>
                <div class="news-source">${item.source_name || 'Market News'}</div>
                <div class="news-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

// Analyze News Impact on Gold
function analyzeNewsImpact(title) {
    const titleLower = title.toLowerCase();
    
    // High impact keywords
    const highImpact = ['war', 'crisis', 'federal reserve', 'rate cut', 'rate hike', 'inflation surge', 'recession'];
    if (highImpact.some(keyword => titleLower.includes(keyword))) {
        return 'high';
    }
    
    // Medium impact keywords
    const mediumImpact = ['gold', 'dollar', 'usd', 'inflation', 'economy', 'central bank'];
    if (mediumImpact.some(keyword => titleLower.includes(keyword))) {
        return 'medium';
    }
    
    return 'low';
}

// Get Time Ago
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
}

// Start News Feed
setTimeout(() => {
    fetchMarketNews();
    setInterval(fetchMarketNews, 300000); // Update every 5 minutes
}, 2000);
