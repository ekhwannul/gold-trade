// Advanced Paper Trading System
class TradingSystem {
    constructor() {
        this.userId = null;
        this.account = {
            balance: 10000,
            equity: 10000,
            margin: 0,
            freeMargin: 10000,
            leverage: 100,
            positions: [],
            history: []
        };
        this.settings = {
            contractSize: 100, // 1 lot = 100 oz gold
            minLot: 0.01,
            maxLot: 10
        };
    }

    // Login System
    login(userId) {
        this.userId = userId;
        this.loadAccount();
        return true;
    }

    logout() {
        this.saveAccount();
        this.userId = null;
    }

    // Account Management
    loadAccount() {
        const key = `trading_${this.userId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            this.account = JSON.parse(saved);
        }
    }

    saveAccount() {
        if (!this.userId) return;
        const key = `trading_${this.userId}`;
        localStorage.setItem(key, JSON.stringify(this.account));
    }

    setLeverage(leverage) {
        this.account.leverage = leverage;
        this.updateMargin();
        this.saveAccount();
    }

    setBalance(amount) {
        const diff = amount - this.account.balance;
        this.account.balance = amount;
        this.account.equity += diff;
        this.account.freeMargin += diff;
        this.saveAccount();
    }

    // Position Management
    openPosition(type, lotSize, currentPrice, stopLoss = null, takeProfit = null) {
        const margin = this.calculateMargin(lotSize, currentPrice);
        
        if (margin > this.account.freeMargin) {
            return { success: false, error: 'Insufficient margin' };
        }

        const position = {
            id: Date.now(),
            type: type,
            lotSize: lotSize,
            entryPrice: currentPrice,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            openTime: new Date().toISOString(),
            margin: margin,
            swap: 0,
            commission: 0
        };

        this.account.positions.push(position);
        this.account.margin += margin;
        this.account.freeMargin -= margin;
        this.saveAccount();

        return { success: true, position };
    }

    closePosition(positionId, currentPrice) {
        const index = this.account.positions.findIndex(p => p.id === positionId);
        if (index === -1) return { success: false, error: 'Position not found' };

        const position = this.account.positions[index];
        const profit = this.calculateProfit(position, currentPrice);

        const trade = {
            ...position,
            closeTime: new Date().toISOString(),
            exitPrice: currentPrice,
            profit: profit,
            pips: this.calculatePips(position, currentPrice)
        };

        this.account.positions.splice(index, 1);
        this.account.balance += profit;
        this.account.equity += profit;
        this.account.margin -= position.margin;
        this.account.freeMargin += position.margin + profit;
        this.account.history.unshift(trade);

        if (this.account.history.length > 100) {
            this.account.history = this.account.history.slice(0, 100);
        }

        this.saveAccount();
        return { success: true, trade };
    }

    closeAllPositions(currentPrice) {
        const results = [];
        while (this.account.positions.length > 0) {
            const pos = this.account.positions[0];
            const result = this.closePosition(pos.id, currentPrice);
            results.push(result);
        }
        return results;
    }

    // Calculations
    calculateMargin(lotSize, price) {
        const positionValue = lotSize * this.settings.contractSize * price;
        return positionValue / this.account.leverage;
    }

    calculateProfit(position, currentPrice) {
        const priceDiff = position.type === 'BUY' 
            ? currentPrice - position.entryPrice
            : position.entryPrice - currentPrice;
        
        return priceDiff * position.lotSize * this.settings.contractSize;
    }

    calculatePips(position, currentPrice) {
        const priceDiff = position.type === 'BUY'
            ? currentPrice - position.entryPrice
            : position.entryPrice - currentPrice;
        return priceDiff.toFixed(2);
    }

    updateEquity(currentPrice) {
        let totalProfit = 0;
        const positionsToClose = [];
        
        this.account.positions.forEach(pos => {
            const profit = this.calculateProfit(pos, currentPrice);
            totalProfit += profit;
            
            // Auto-close if TP or SL hit
            if (pos.takeProfit) {
                if ((pos.type === 'BUY' && currentPrice >= pos.takeProfit) ||
                    (pos.type === 'SELL' && currentPrice <= pos.takeProfit)) {
                    positionsToClose.push({ id: pos.id, reason: 'TP' });
                }
            }
            
            if (pos.stopLoss) {
                if ((pos.type === 'BUY' && currentPrice <= pos.stopLoss) ||
                    (pos.type === 'SELL' && currentPrice >= pos.stopLoss)) {
                    positionsToClose.push({ id: pos.id, reason: 'SL' });
                }
            }
        });
        
        // Close positions that hit TP/SL
        positionsToClose.forEach(item => {
            this.closePosition(item.id, currentPrice);
            if (window.showTradeNotification) {
                const emoji = item.reason === 'TP' ? '🎯' : '🛡️';
                window.showTradeNotification(`${emoji} Position closed by ${item.reason}`);
            }
        });
        
        this.account.equity = this.account.balance + totalProfit;
    }

    updateMargin() {
        this.account.margin = 0;
        this.account.positions.forEach(pos => {
            this.account.margin += pos.margin;
        });
        this.account.freeMargin = this.account.equity - this.account.margin;
    }

    // Statistics
    getStats() {
        const totalTrades = this.account.history.length;
        const winningTrades = this.account.history.filter(t => t.profit > 0).length;
        const losingTrades = totalTrades - winningTrades;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;
        
        const totalProfit = this.account.history.reduce((sum, t) => sum + (t.profit > 0 ? t.profit : 0), 0);
        const totalLoss = this.account.history.reduce((sum, t) => sum + (t.profit < 0 ? t.profit : 0), 0);
        
        return {
            totalTrades,
            winningTrades,
            losingTrades,
            winRate,
            totalProfit,
            totalLoss,
            netProfit: totalProfit + totalLoss
        };
    }

    reset() {
        this.account = {
            balance: 10000,
            equity: 10000,
            margin: 0,
            freeMargin: 10000,
            leverage: this.account.leverage,
            positions: [],
            history: []
        };
        this.saveAccount();
    }
}

// Global instance
window.tradingSystem = new TradingSystem();
