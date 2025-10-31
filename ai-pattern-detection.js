// Pattern Detection Engine
class PatternDetector {
    constructor() {
        this.patterns = [];
    }

    // Detect Head and Shoulders
    detectHeadAndShoulders(candles) {
        if (candles.length < 50) return null;
        
        const highs = candles.map(c => c.high);
        const peaks = this.findPeaks(highs);
        
        if (peaks.length < 3) return null;
        
        for (let i = 0; i < peaks.length - 2; i++) {
            const leftShoulder = peaks[i];
            const head = peaks[i + 1];
            const rightShoulder = peaks[i + 2];
            
            if (head.value > leftShoulder.value && head.value > rightShoulder.value) {
                if (Math.abs(leftShoulder.value - rightShoulder.value) / leftShoulder.value < 0.02) {
                    return {
                        type: 'HEAD_AND_SHOULDERS',
                        direction: 'BEARISH',
                        confidence: 85,
                        neckline: Math.min(candles[leftShoulder.index].low, candles[rightShoulder.index].low),
                        target: head.value - (head.value - Math.min(candles[leftShoulder.index].low, candles[rightShoulder.index].low))
                    };
                }
            }
        }
        return null;
    }

    // Detect Inverse Head and Shoulders
    detectInverseHeadAndShoulders(candles) {
        if (candles.length < 50) return null;
        
        const lows = candles.map(c => c.low);
        const troughs = this.findTroughs(lows);
        
        if (troughs.length < 3) return null;
        
        for (let i = 0; i < troughs.length - 2; i++) {
            const leftShoulder = troughs[i];
            const head = troughs[i + 1];
            const rightShoulder = troughs[i + 2];
            
            if (head.value < leftShoulder.value && head.value < rightShoulder.value) {
                if (Math.abs(leftShoulder.value - rightShoulder.value) / leftShoulder.value < 0.02) {
                    return {
                        type: 'INVERSE_HEAD_AND_SHOULDERS',
                        direction: 'BULLISH',
                        confidence: 85,
                        neckline: Math.max(candles[leftShoulder.index].high, candles[rightShoulder.index].high),
                        target: head.value + (Math.max(candles[leftShoulder.index].high, candles[rightShoulder.index].high) - head.value)
                    };
                }
            }
        }
        return null;
    }

    // Detect Double Top
    detectDoubleTop(candles) {
        if (candles.length < 30) return null;
        
        const highs = candles.map(c => c.high);
        const peaks = this.findPeaks(highs);
        
        if (peaks.length < 2) return null;
        
        for (let i = 0; i < peaks.length - 1; i++) {
            const peak1 = peaks[i];
            const peak2 = peaks[i + 1];
            
            if (Math.abs(peak1.value - peak2.value) / peak1.value < 0.015) {
                const valley = Math.min(...candles.slice(peak1.index, peak2.index).map(c => c.low));
                return {
                    type: 'DOUBLE_TOP',
                    direction: 'BEARISH',
                    confidence: 80,
                    resistance: (peak1.value + peak2.value) / 2,
                    support: valley,
                    target: valley - (peak1.value - valley)
                };
            }
        }
        return null;
    }

    // Detect Double Bottom
    detectDoubleBottom(candles) {
        if (candles.length < 30) return null;
        
        const lows = candles.map(c => c.low);
        const troughs = this.findTroughs(lows);
        
        if (troughs.length < 2) return null;
        
        for (let i = 0; i < troughs.length - 1; i++) {
            const trough1 = troughs[i];
            const trough2 = troughs[i + 1];
            
            if (Math.abs(trough1.value - trough2.value) / trough1.value < 0.015) {
                const peak = Math.max(...candles.slice(trough1.index, trough2.index).map(c => c.high));
                return {
                    type: 'DOUBLE_BOTTOM',
                    direction: 'BULLISH',
                    confidence: 80,
                    support: (trough1.value + trough2.value) / 2,
                    resistance: peak,
                    target: peak + (peak - trough1.value)
                };
            }
        }
        return null;
    }

    // Detect Ascending Triangle
    detectAscendingTriangle(candles) {
        if (candles.length < 20) return null;
        
        const recent = candles.slice(-20);
        const highs = recent.map(c => c.high);
        const lows = recent.map(c => c.low);
        
        const resistance = Math.max(...highs);
        const resistanceCount = highs.filter(h => Math.abs(h - resistance) / resistance < 0.005).length;
        
        if (resistanceCount >= 2) {
            const lowTrend = this.calculateTrend(lows);
            if (lowTrend > 0) {
                return {
                    type: 'ASCENDING_TRIANGLE',
                    direction: 'BULLISH',
                    confidence: 75,
                    resistance: resistance,
                    target: resistance + (resistance - Math.min(...lows)) * 0.5
                };
            }
        }
        return null;
    }

    // Detect Descending Triangle
    detectDescendingTriangle(candles) {
        if (candles.length < 20) return null;
        
        const recent = candles.slice(-20);
        const highs = recent.map(c => c.high);
        const lows = recent.map(c => c.low);
        
        const support = Math.min(...lows);
        const supportCount = lows.filter(l => Math.abs(l - support) / support < 0.005).length;
        
        if (supportCount >= 2) {
            const highTrend = this.calculateTrend(highs);
            if (highTrend < 0) {
                return {
                    type: 'DESCENDING_TRIANGLE',
                    direction: 'BEARISH',
                    confidence: 75,
                    support: support,
                    target: support - (Math.max(...highs) - support) * 0.5
                };
            }
        }
        return null;
    }

    // Helper: Find Peaks
    findPeaks(data) {
        const peaks = [];
        for (let i = 5; i < data.length - 5; i++) {
            if (data[i] > data[i-1] && data[i] > data[i+1] && 
                data[i] > data[i-2] && data[i] > data[i+2]) {
                peaks.push({ index: i, value: data[i] });
            }
        }
        return peaks;
    }

    // Helper: Find Troughs
    findTroughs(data) {
        const troughs = [];
        for (let i = 5; i < data.length - 5; i++) {
            if (data[i] < data[i-1] && data[i] < data[i+1] && 
                data[i] < data[i-2] && data[i] < data[i+2]) {
                troughs.push({ index: i, value: data[i] });
            }
        }
        return troughs;
    }

    // Helper: Calculate Trend
    calculateTrend(data) {
        if (data.length < 2) return 0;
        return (data[data.length - 1] - data[0]) / data.length;
    }

    // Main Detection Function
    detectAllPatterns(candles) {
        const patterns = [];
        
        const hs = this.detectHeadAndShoulders(candles);
        if (hs) patterns.push(hs);
        
        const ihs = this.detectInverseHeadAndShoulders(candles);
        if (ihs) patterns.push(ihs);
        
        const dt = this.detectDoubleTop(candles);
        if (dt) patterns.push(dt);
        
        const db = this.detectDoubleBottom(candles);
        if (db) patterns.push(db);
        
        const at = this.detectAscendingTriangle(candles);
        if (at) patterns.push(at);
        
        const dest = this.detectDescendingTriangle(candles);
        if (dest) patterns.push(dest);
        
        return patterns.sort((a, b) => b.confidence - a.confidence);
    }
}

window.PatternDetector = PatternDetector;
