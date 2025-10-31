# ✅ Python Issue FIXED!

## Masalah Sebelum:
```
'pip' is not recognized
'python' is not recognized
```

## Penyelesaian:
✅ Python installed tapi tak dalam PATH
✅ Guna `py` command instead
✅ Dependencies dah installed!

---

## 🎯 Cara Guna Sekarang

### Option 1: Auto (EASY)
```
1. Pastikan MT5 running
2. Double-click: start-mt5-bridge.bat
3. Tunggu "Running on http://localhost:5001"
4. Open: index.html
```

### Option 2: Manual
```
1. Open Command Prompt
2. cd "C:\Users\Admin\Desktop\XAU USD\trading-web"
3. py mt5_bridge.py
4. Open: index.html
```

---

## ✅ Verify Installation

### Check Python:
```cmd
py --version
```
**Should show:** Python 3.12.6 ✅

### Check Dependencies:
```cmd
py -m pip list
```
**Should show:**
- MetaTrader5 ✅
- flask ✅
- flask-cors ✅
- pandas ✅

---

## 🚀 Next Steps

### Step 1: Open MT5
```
1. Launch MetaTrader 5
2. Login to demo account
3. Make sure XAUUSD in Market Watch
```

### Step 2: Start Bridge
```
Double-click: start-mt5-bridge.bat

You should see:
- Installing dependencies... (skip if done)
- Starting MT5 Bridge Server...
- Running on http://localhost:5001
```

### Step 3: Open Web
```
Open: index.html

Check top-right:
- Should show "MT5 Connected" ✅
- Prices updating
- Real-time chart
```

---

## 🔧 If Bridge Fails

### Error: "MT5 initialization failed"
**Reason:** MT5 not running
**Fix:**
1. Open MT5
2. Login to account
3. Restart bridge

### Error: "Failed to get tick"
**Reason:** XAUUSD not in Market Watch
**Fix:**
1. Right-click Market Watch
2. Symbols → Search "XAUUSD"
3. Click "Show"
4. Restart bridge

### Error: "Port already in use"
**Reason:** Bridge already running
**Fix:**
1. Close previous bridge window
2. Or restart computer
3. Run bridge again

---

## 📊 Test Bridge Working

### Test 1: Status
Open browser: http://localhost:5001/api/status

**Should see:**
```json
{
  "connected": true,
  "terminal": {...}
}
```

### Test 2: Price
Open browser: http://localhost:5001/api/price

**Should see:**
```json
{
  "symbol": "XAUUSD",
  "bid": 2650.50,
  "ask": 2650.60,
  "spread": 0.10
}
```

### Test 3: Candles
Open browser: http://localhost:5001/api/candles/1h

**Should see:**
```json
{
  "candles": [
    {"time": 123456, "open": 2650, ...},
    ...
  ]
}
```

---

## ✅ Summary

**Problem:** Python PATH issue
**Solution:** Use `py` command
**Status:** ✅ FIXED & READY

**Dependencies Installed:**
- ✅ MetaTrader5
- ✅ Flask
- ✅ Flask-CORS
- ✅ Pandas

**Next:**
1. Open MT5
2. Run: start-mt5-bridge.bat
3. Open: index.html
4. Trade with REAL data! 🚀

---

**Time to setup:** 2 minutes
**Difficulty:** Easy ⭐☆☆☆☆
**Status:** ✅ READY TO GO!
