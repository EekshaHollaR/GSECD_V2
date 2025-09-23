const EconomicIndicator = require('../models/EconomicIndicator');
const CrisisEvent        = require('../models/CrisisEvent');

class CrisisDetectionService {
  constructor() {
    this.thresholds = {
      gdpGrowth:   { critical: -3.0, high: -1.5, medium: 0.5 },
      unemployment:{ critical: 12.0, high: 8.0, medium: 6.0 },
      inflation:   { critical: 10.0, high: 6.0, medium: 4.0 },
      debtToGDP:   { critical: 120.0, high: 90.0, medium: 70.0 }
    };
  }

  async analyzeCountryRisk(countryCode, year = new Date().getFullYear()) {
    const indicators = await EconomicIndicator.find({
      countryCode,
      year: { $gte: year - 2, $lte: year }
    });
    const processed = this.processIndicators(indicators);
    const riskFactors = this.calculateRiskFactors(processed);
    const overallRisk = this.calculateOverallRisk(riskFactors);
    return { countryCode, year, riskFactors, overallRisk };
  }

  processIndicators(indicators) {
    const map = {};
    indicators.forEach(ind => {
      const v = parseFloat(ind.value);
      if (ind.indicatorCode.includes('GDP_GROWTH')) map.gdpGrowth = v;
      if (ind.indicatorCode.includes('UNEMPLOYMENT')) map.unemployment = v;
      if (ind.indicatorCode.includes('INFLATION')) map.inflation = v;
      if (ind.indicatorCode.includes('DEBT_GDP')) map.debtToGDP = v;
    });
    return map;
  }

  assessIndicatorRisk(type, value) {
    const t = this.thresholds[type];
    if (!t) return { level: 'unknown', score: 0 };
    let level, score;
    if (['unemployment','inflation','debtToGDP'].includes(type)) {
      if (value >= t.critical) { level = 'critical'; score=4; }
      else if (value >= t.high) { level='high'; score=3; }
      else if (value >= t.medium){ level='medium'; score=2; }
      else { level='low'; score=1; }
    } else {
      if (value <= t.critical) { level='critical'; score=4; }
      else if (value <= t.high) { level='high'; score=3; }
      else if (value <= t.medium){ level='medium'; score=2; }
      else { level='low'; score=1; }
    }
    return { level, score };
  }

  calculateRiskFactors(processed) {
    const factors = {};
    Object.entries(processed).forEach(([k,v]) => {
      factors[k] = this.assessIndicatorRisk(k, v);
    });
    return factors;
  }

  calculateOverallRisk(factors) {
    const scores = Object.values(factors).map(f=>f.score||0);
    const avg = scores.reduce((a,b)=>a+b,0)/scores.length||0;
    const level = avg>=3.5?'critical':avg>=2.5?'high':avg>=1.5?'medium':'low';
    return { level, score:Math.round(avg*100)/100 };
  }
}

module.exports = new CrisisDetectionService();
