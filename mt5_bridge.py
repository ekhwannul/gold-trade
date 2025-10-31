import MetaTrader5 as mt5
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize MT5
if not mt5.initialize():
    print("MT5 initialization failed")
    mt5.shutdown()

@app.route('/api/price', methods=['GET'])
def get_price():
    symbol = "XAUUSD"
    tick = mt5.symbol_info_tick(symbol)
    
    if tick is None:
        return jsonify({'error': 'Failed to get tick'}), 500
    
    return jsonify({
        'symbol': symbol,
        'bid': tick.bid,
        'ask': tick.ask,
        'time': tick.time,
        'spread': tick.ask - tick.bid
    })

@app.route('/api/candles/<timeframe>', methods=['GET'])
def get_candles(timeframe):
    symbol = "XAUUSD"
    
    tf_map = {
        '1m': mt5.TIMEFRAME_M1,
        '5m': mt5.TIMEFRAME_M5,
        '15m': mt5.TIMEFRAME_M15,
        '30m': mt5.TIMEFRAME_M30,
        '1h': mt5.TIMEFRAME_H1,
        '4h': mt5.TIMEFRAME_H4,
        '1d': mt5.TIMEFRAME_D1
    }
    
    tf = tf_map.get(timeframe, mt5.TIMEFRAME_H1)
    rates = mt5.copy_rates_from_pos(symbol, tf, 0, 200)
    
    if rates is None:
        return jsonify({'error': 'Failed to get rates'}), 500
    
    df = pd.DataFrame(rates)
    candles = []
    
    for _, row in df.iterrows():
        candles.append({
            'time': int(row['time']),
            'open': float(row['open']),
            'high': float(row['high']),
            'low': float(row['low']),
            'close': float(row['close'])
        })
    
    return jsonify({'candles': candles})

@app.route('/api/status', methods=['GET'])
def get_status():
    if mt5.terminal_info() is None:
        return jsonify({'connected': False})
    
    return jsonify({
        'connected': True,
        'terminal': mt5.terminal_info()._asdict()
    })

if __name__ == '__main__':
    print("MT5 Bridge Server Starting...")
    print("Make sure MT5 is running!")
    app.run(host='localhost', port=5001, debug=False)
