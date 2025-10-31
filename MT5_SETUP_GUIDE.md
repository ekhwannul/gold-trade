# 🚀 MT5 Real-Time Setup Guide

## ✅ Apa Yang Dah Dibuat

Saya dah setup:
1. ✅ Python MT5 Bridge (`mt5_bridge.py`)
2. ✅ Auto-install script (`start-mt5-bridge.bat`)
3. ✅ Web integration (auto-detect MT5)

---

## 📋 Requirements

### 1. MetaTrader 5
- Download: https://www.metatrader5.com/en/download
- Install dan buka MT5
- Login dengan broker account (demo atau live)

### 2. Python
- Python 3.8+ (check: `python --version`)
- Kalau takde, download: https://www.python.org/downloads/

---

## 🎯 Setup Steps (3 Steps Sahaja!)

### Step 1: Install MT5
```
1. Download MT5 dari broker anda
2. Install dan login
3. Pastikan XAUUSD symbol ada dalam Market Watch
   - Right-click Market Watch → Symbols
   - Search "XAUUSD" → Show
```

### Step 2: Start MT5 Bridge
```
1. Pastikan MT5 running
2. Double-click: start-mt5-bridge.bat
3. Tunggu message: "MT5 Bridge Server Starting..."
4. Jangan close window ni!
```

### Step 3: Open Web
```
1. Buka: index.html
2. Check status: "MT5 Connected" (top right)
3. Chart akan show REAL data dari MT5!
```

---

## 🔍 Verify Setup

### Check 1: MT5 Running?
```
✅ MT5 terminal open
✅ Logged in to account
✅ XAUUSD in Market Watch
✅ Prices updating
```

### Check 2: Bridge Running?
```
✅ Command window open
✅ Message: "Running on http://localhost:5001"
✅ No error messages
```

### Check 3: Web Connected?
```
✅ Status shows "MT5 Connected"
✅ Prices updating every second
✅ Chart showing real candles
```

---

## 🎮 How It Works

```
MT5 Terminal
    ↓ (Python bridge reads data)
mt5_bridge.py (localhost:5001)
    ↓ (REST API)
Web App (index.html)
    ↓ (Display)
Real-Time Chart + Signals
```

---

## 📊 What You Get

### Real-Time Data:
- ✅ Live BID/ASK prices
- ✅ Real candles (1M, 5M, 15M, 1H, 4H, 1D)
- ✅ Actual spread from broker
- ✅ True market conditions

### AI Signals:
- ✅ Based on REAL data
- ✅ Technical indicators calculated live
- ✅ Entry/SL/TP suggestions
- ✅ Confidence scores

---

## ⚙️ Configuration

### Change Symbol (Optional):
Edit `mt5_bridge.py`:
```python
symbol = "XAUUSD"  # Change to any symbol
```

### Change Port (Optional):
Edit `mt5_bridge.py`:
```python
app.run(host='localhost', port=5001)  # Change port
```

Then update `app.js`:
```javascript
MT5_BRIDGE_URL: 'http://localhost:5001'  // Match port
```

---

## 🔧 Troubleshooting

### Problem: "MT5 initialization failed"
**Solution:**
1. Make sure MT5 is running
2. Login to account
3. Restart bridge

### Problem: "Failed to get tick"
**Solution:**
1. Check XAUUSD in Market Watch
2. Right-click → Symbols → Show XAUUSD
3. Restart bridge

### Problem: Web shows "Live Simulation"
**Solution:**
1. Check bridge running (localhost:5001)
2. Check console (F12) for errors
3. Verify MT5 logged in

### Problem: "Connection refused"
**Solution:**
1. Restart bridge: start-mt5-bridge.bat
2. Check firewall not blocking port 5001
3. Refresh web page

---

## 🎯 Testing

### Test Bridge:
Open browser: http://localhost:5001/api/status
```json
{
  "connected": true,
  "terminal": {...}
}
```

### Test Price:
Open browser: http://localhost:5001/api/price
```json
{
  "symbol": "XAUUSD",
  "bid": 2650.50,
  "ask": 2650.60,
  "spread": 0.10
}
```

### Test Candles:
Open browser: http://localhost:5001/api/candles/1h
```json
{
  "candles": [...]
}
```

---

## 📈 Usage

### Normal Flow:
```
1. Start MT5
2. Run: start-mt5-bridge.bat
3. Open: index.html
4. Trade with REAL data!
```

### Daily Use:
```
Morning:
1. Open MT5
2. Start bridge
3. Open web
4. Monitor signals

Evening:
1. Close web
2. Close bridge (Ctrl+C)
3. Close MT5(optional)
```

---

## 🔐 Security Notes

### Important:
- ⚠️ Bridge runs on localhost only (safe)
- ⚠️ No data sent to internet
- ⚠️ Only you can access
- ⚠️ MT5 credentials stay in MT5

### For Production:
- Add authentication
- Use HTTPS
- Restrict access
- Monitor logs

---

## 🎓 Next Steps

### After Setup:
1. ✅ Verify real data loading
2. ✅ Test different timeframes
3. ✅ Monitor AI signals
4. ✅ Practice with demo account

### Before Live Trading:
1. ⚠️ Test extensively with demo
2. ⚠️ Verify signal accuracy
3. ⚠️ Understand risk management
4. ⚠️ Start with small capital

---

## 📞 Support

### If Issues:
1. Check MT5 running
2. Check bridge running
3. Check console (F12)
4. Restart everything

### Files:
- `mt5_bridge.py` - Bridge server
- `start-mt5-bridge.bat` - Auto-start
- `requirements-mt5.txt` - Dependencies
- `app.js` - Web integration

---

## 🎉 Summary

**Before**: Generated/simulated data
**After**: REAL data dari MT5 broker!

**Status**: ✅ Ready untuk real-time trading signals

**Next**: Start bridge → Open web → Trade! 🚀

---

**Important**: Ini untuk DEMO/PRACTICE dulu. Test extensively sebelum live trading!
