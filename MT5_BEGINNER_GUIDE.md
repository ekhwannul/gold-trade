# 📚 MT5 Beginner Guide - Panduan Lengkap Untuk First Timer

## 🎯 Apa Itu MT5?

**MetaTrader 5 (MT5)** = Platform trading untuk forex, gold, stocks, dll.

**Guna untuk:**
- 📊 View real-time charts
- 💰 Execute trades
- 📈 Technical analysis
- 🤖 Auto-trading (EA)

---

## 📥 Part 1: Download & Install MT5

### Step 1: Download MT5

**Option A: Dari Broker (RECOMMENDED)**
```
1. Pilih broker (contoh: XM, Exness, IC Markets)
2. Buka website broker
3. Cari "Download MT5"
4. Download installer
```

**Option B: Dari MetaQuotes (Official)**
```
1. Go to: https://www.metatrader5.com/en/download
2. Click "Download MetaTrader 5"
3. Save file: mt5setup.exe
```

### Step 2: Install MT5

```
1. Double-click mt5setup.exe
2. Click "Next" → "Next" → "Finish"
3. MT5 akan auto-open
4. Tunggu installation complete
```

**Installation Time**: 2-3 minit

---

## 🔐 Part 2: Create Demo Account

### Kenapa Demo Account?

- ✅ FREE (no real money)
- ✅ Practice trading
- ✅ Test strategies
- ✅ Learn platform
- ✅ Same as real account (tapi virtual money)

### Step 1: Open Account Dialog

Bila MT5 first open, akan keluar dialog "Open an Account"

**Kalau tak keluar:**
```
1. Click "File" (top menu)
2. Click "Open an Account"
```

### Step 2: Choose Broker

```
1. Search broker name (contoh: "XM", "Exness")
2. Atau pilih "MetaQuotes-Demo" (default demo)
3. Click broker name
4. Click "Next"
```

**Recommended Demo Brokers:**
- MetaQuotes-Demo (default, easy)
- XM Global
- Exness
- IC Markets

### Step 3: Select Account Type

```
1. Choose "Open a demo account"
2. Click "Next"
```

### Step 4: Fill Details

```
Name: [Your Name]
Email: [Your Email]
Phone: [Your Phone] (optional)

Account Type: Standard (pilih ni)
Deposit: 10000 (virtual money)
Leverage: 1:100 (default ok)
Currency: USD

☑️ I agree to subscribe to newsletters
```

**Click "Next"**

### Step 5: Save Login Details

```
MT5 akan bagi:
- Login: 12345678 (contoh)
- Password: abc123xyz (contoh)
- Server: MetaQuotes-Demo

⚠️ SAVE NI! Tulis dalam notepad atau screenshot!
```

**Click "Finish"**

---

## 🎮 Part 3: MT5 Interface Basics

### Main Window Layout:

```
┌─────────────────────────────────────────────┐
│ Menu Bar: File | View | Insert | Charts     │
├──────────┬──────────────────────┬───────────┤
│ Market   │                      │ Navigator │
│ Watch    │   MAIN CHART AREA    │           │
│          │                      │ (Symbols, │
│ XAUUSD   │   [Candlestick       │  EAs,     │
│ 2650.50  │    Chart Here]       │  Scripts) │
│          │                      │           │
├──────────┴──────────────────────┴───────────┤
│ Toolbox: Trade | History | News             │
└─────────────────────────────────────────────┘
```

### Key Panels:

**1. Market Watch (Left)**
- Shows all symbols (XAUUSD, EURUSD, etc.)
- Live BID/ASK prices
- Right-click untuk add/remove symbols

**2. Chart Area (Center)**
- Main trading chart
- Candlesticks, lines, indicators
- Multiple timeframes

**3. Navigator (Right)**
- Accounts
- Indicators
- Expert Advisors (EAs)
- Scripts

**4. Toolbox (Bottom)**
- Trade tab: Open positions
- History: Past trades
- News: Market news

---

## 📊 Part 4: Add XAUUSD Symbol

### Step 1: Open Market Watch

```
Kalau tak nampak Market Watch:
1. Click "View" (top menu)
2. Click "Market Watch"
3. Atau tekan: Ctrl + M
```

### Step 2: Show XAUUSD

```
1. Right-click dalam Market Watch
2. Click "Symbols"
3. Search box: Type "XAUUSD"
4. Click "XAUUSD" (atau "GOLD")
5. Click "Show"
6. Click "Close"
```

**Now XAUUSD akan appear dalam Market Watch!**

### Step 3: Open XAUUSD Chart

```
Method 1:
- Double-click "XAUUSD" dalam Market Watch

Method 2:
- Drag "XAUUSD" ke chart area

Method 3:
- Right-click "XAUUSD" → Chart Window
```

**Chart XAUUSD akan open!** 📈

---

## ⏰ Part 5: Change Timeframe

### Timeframe Buttons (Top Toolbar):

```
M1  = 1 minute
M5  = 5 minutes
M15 = 15 minutes
M30 = 30 minutes
H1  = 1 hour
H4  = 4 hours
D1  = 1 day
W1  = 1 week
MN  = 1 month
```

### Change Timeframe:

```
1. Click timeframe button (contoh: H1)
2. Chart akan change ke 1-hour candles
```

**For our web app, guna H1 (1 hour) - best untuk signals!**

---

## 🎨 Part 6: Customize Chart

### Change Chart Type:

```
Right-click chart → Properties → atau tekan F8

Chart Type:
- Bar Chart
- Candlesticks ✅ (recommended)
- Line Chart
```

### Change Colors:

```
Right-click chart → Properties

Colors:
- Background: Black/White
- Candles: Green/Red
- Grid: Show/Hide
```

### Zoom In/Out:

```
Zoom In: Click "+" button atau scroll up
Zoom Out: Click "-" button atau scroll down
Move Chart: Click & drag chart left/right
```

---

## 📈 Part 7: Check Prices

### Live Prices dalam Market Watch:

```
XAUUSD
BID: 2650.50  ← Selling price
ASK: 2650.60  ← Buying price
```

### Spread:

```
Spread = ASK - BID
Example: 2650.60 - 2650.50 = 0.10

Lower spread = Better!
```

### Price Updates:

```
Prices update setiap saat (real-time)
- Green = Price naik
- Red = Price turun
```

---

## ✅ Part 8: Verify Setup

### Checklist:

```
✅ MT5 installed
✅ Demo account created
✅ Logged in (check bottom-right: "Connected")
✅ XAUUSD dalam Market Watch
✅ XAUUSD chart open
✅ Prices updating (numbers berubah)
✅ Timeframe set to H1
```

**Kalau semua ✅, you're ready!**

---

## 🔌 Part 9: Connect to Web App

### Now Ready untuk Bridge!

```
1. MT5 running ✅
2. XAUUSD visible ✅
3. Prices updating ✅

Next:
1. Run: start-mt5-bridge.bat
2. Open: index.html
3. Check: "MT5 Connected" ✅
```

**Read**: QUICK_MT5_START.md untuk next steps

---

## 🎓 Part 10: Basic MT5 Tips

### Tip 1: Keep MT5 Running
```
Untuk web app dapat data, MT5 MESTI running
Jangan close MT5 bila guna web app
```

### Tip 2: Check Connection
```
Bottom-right corner:
- Green bar + numbers = Connected ✅
- "No connection" = Disconnected ❌

Kalau disconnect:
1. Check internet
2. Restart MT5
3. Login again
```

### Tip 3: Market Hours
```
Forex market open 24/5:
- Monday 00:00 - Friday 23:59 (GMT)
- Weekend: Market closed

XAUUSD trading hours:
- Almost 24/5 (check broker)
```

### Tip 4: Demo Account Expiry
```
Demo accounts usually expire after:
- 30 days (most brokers)
- 90 days (some brokers)

Kalau expire, just create new demo account!
```

### Tip 5: Practice First
```
⚠️ IMPORTANT:
- Practice dengan demo EXTENSIVELY
- Jangan rush ke live account
- Minimum 1-2 months practice
- Understand risk management
```

---

## 🔧 Troubleshooting

### Problem: "Invalid Account"
**Solution:**
```
1. Check login details correct
2. Check server name correct
3. Try create new demo account
```

### Problem: "No Connection"
**Solution:**
```
1. Check internet connection
2. Check firewall not blocking MT5
3. Restart MT5
4. Try different server
```

### Problem: "XAUUSD Not Found"
**Solution:**
```
1. Right-click Market Watch → Symbols
2. Search "GOLD" instead of "XAUUSD"
3. Some brokers use "GOLD" name
4. Click "Show"
```

### Problem: "Prices Not Updating"
**Solution:**
```
1. Check connection (bottom-right)
2. Check market open (not weekend?)
3. Right-click symbol → Chart Window
4. Restart MT5
```

---

## 📱 Part 11: MT5 Mobile (Bonus)

### MT5 Available On:

**Android:**
- Google Play Store
- Search "MetaTrader 5"
- Install & login dengan same account

**iOS:**
- App Store
- Search "MetaTrader 5"
- Install & login dengan same account

**Login Details:**
```
Same login/password/server as desktop!
```

---

## 🎯 Quick Reference

### Essential Shortcuts:

```
Ctrl + M = Market Watch
Ctrl + N = Navigator
Ctrl + T = Toolbox
F1 = Help
F8 = Chart Properties
F9 = New Order
```

### Common Symbols:

```
XAUUSD = Gold vs USD
EURUSD = Euro vs USD
GBPUSD = Pound vs USD
USDJPY = USD vs Yen
```

---

## 📚 Learning Resources

### Official:
- MT5 Help: Press F1 dalam MT5
- MQL5 Community: https://www.mql5.com
- Video Tutorials: YouTube "MT5 tutorial"

### Practice:
- Demo account (FREE)
- Paper trading
- Backtesting strategies

---

## ✅ Summary Checklist

### Installation:
- [ ] Download MT5
- [ ] Install MT5
- [ ] Create demo account
- [ ] Save login details

### Setup:
- [ ] Open MT5
- [ ] Login to account
- [ ] Add XAUUSD to Market Watch
- [ ] Open XAUUSD chart
- [ ] Set timeframe to H1

### Verification:
- [ ] Connection status: Connected
- [ ] Prices updating
- [ ] Chart showing candles
- [ ] Ready untuk bridge!

---

## 🚀 Next Steps

### After MT5 Setup:

1. ✅ **Familiarize** dengan interface (15 min)
2. ✅ **Watch** prices update (5 min)
3. ✅ **Read**: QUICK_MT5_START.md
4. ✅ **Run**: start-mt5-bridge.bat
5. ✅ **Open**: index.html
6. ✅ **Trade**: dengan real-time signals!

---

## 📞 Need More Help?

### Resources:
- **MT5 Setup**: This file
- **Bridge Setup**: MT5_SETUP_GUIDE.md
- **Quick Start**: QUICK_MT5_START.md
- **Troubleshooting**: Check guides above

### Common Questions:

**Q: MT5 free ke?**
A: Yes! Platform free, demo account free.

**Q: Kena bayar ke?**
A: No! Demo account 100% free, virtual money.

**Q: Berapa lama setup?**
A: 10-15 minutes total.

**Q: Susah ke?**
A: No! Follow guide step-by-step, very easy.

**Q: Selamat ke?**
A: Yes! Demo account = no real money risk.

---

## 🎉 Congratulations!

**You now know:**
- ✅ How to install MT5
- ✅ How to create demo account
- ✅ How to navigate interface
- ✅ How to add XAUUSD
- ✅ How to check prices
- ✅ Ready untuk web integration!

**Time taken**: ~15 minutes
**Difficulty**: Easy ⭐⭐☆☆☆
**Cost**: FREE 💰

---

**Next**: Read QUICK_MT5_START.md untuk connect dengan web app! 🚀

**Remember**: Practice dengan demo extensively sebelum consider live trading!

**Good luck & happy trading!** 📈✨
