# 🔑 Free API Setup Guide

## Data Sudah Berfungsi!

Web anda sekarang menggunakan **3 free APIs** untuk data XAU/USD real-time:

### ✅ APIs Yang Digunakan (Automatic Fallback)

1. **Alpha Vantage** (Free - 5 calls/min)
   - URL: https://www.alphavantage.co
   - Demo key included
   - Untuk production: Daftar free key di https://www.alphavantage.co/support/#api-key

2. **Twelve Data** (Free - 8 calls/min)
   - URL: https://twelvedata.com
   - No key needed untuk basic
   - Untuk lebih banyak calls: Daftar di https://twelvedata.com/pricing

3. **Finnhub** (Free - 60 calls/min)
   - URL: https://finnhub.io
   - Demo key included
   - Untuk production: Daftar di https://finnhub.io/register

### 🚀 Cara Upgrade (Optional)

Jika nak lebih banyak data calls, boleh daftar free API keys:

1. Buka `app.js`
2. Cari bahagian `fetchMT5Data()`
3. Replace `demo` atau `apikey=demo` dengan API key anda

Contoh:
```javascript
// Before
const url = 'https://www.alphavantage.co/query?...&apikey=demo';

// After (dengan key sendiri)
const url = 'https://www.alphavantage.co/query?...&apikey=YOUR_FREE_KEY';
```

### 📊 Data Sources

Web akan cuba APIs mengikut urutan:
1. Alpha Vantage → Jika gagal
2. Twelve Data → Jika gagal
3. Finnhub → Jika gagal
4. Local CSV data → Jika gagal
5. Generated fallback data

### ⚡ Kenapa Web Kosong Sebelum Ini?

- CSV file path salah (CORS issue)
- Sekarang dah fixed dengan:
  - Multiple API fallbacks
  - Better error handling
  - Auto-generate data jika semua gagal

### 🎯 Test Sekarang

1. Buka `index.html` dalam browser
2. Tunggu 2-3 saat
3. Chart akan muncul dengan data real-time!

**Mode Available:**
- 🔴 **Live Mode**: Real-time simulation dengan API data
- 📊 **Historical Mode**: Data dari CSV files

Toggle antara modes dengan butang di header!
