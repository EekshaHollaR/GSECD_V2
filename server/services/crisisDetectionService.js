const EconomicIndicator = require('../models/EconomicIndicator');
const CrisisEvent = require('../models/CrisisEvent');

class CrisisDetectionService {
  constructor() {
    // Thresholds for different crisis indicators
    this.thresholds = {
      gdpGrowth: { critical: -3.0, high: -1.5, medium: 0.5 },
      unemployment: { critical: 12.0, high: 8.0, medium: 6.0 },
      inflation: { critical: 10.0, high: 6.0, medium: 4.0 },
      debtToGDP: { critical: 120.0, high: 90.0, medium: 70.0 }
    };
  }

  // Analyze country's economic health
  async analyzeCountryRisk(countryCode, year = new Date().getFullYear()) {
    try {
      const indicators = await this.getLatestIndicators(countryCode, year);
      const riskFactors = this.calculateRiskFactors(indicators);
      const overallRisk = this.calculateOverallRisk(riskFactors);
      
      return {
        countryCode,
        year,
        overallRisk,
        riskFactors,
        recommendations: this.generateRecommendations(riskFactors),
        alertLevel: this.determineAlertLevel(overallRisk)
      };
    } catch (error) {
      console.error(`Error analyzing risk for ${countryCode}:`, error);
      throw error;
    }
  }

  // Get latest economic indicators for a country
  async getLatestIndicators(countryCode, year) {
    const indicators = await EconomicIndicator.find({
      countryCode: countryCode.toUpperCase(),
      year: { $gte: year - 2, $lte: year }
    }).sort({ year: -1 });

    return this.processIndicators(indicators);
  }

  // Process and group indicators
  processIndicators(indicators) {
    const processed = {
      gdpGrowth: null,
      unemployment: null,
      inflation: null,
      debtToGDP: null
    };

    indicators.forEach(indicator => {
      if (indicator.indicatorCode.includes('GDP_GROWTH')) {
        processed.gdpGrowth = parseFloat(indicator.value);
      } else if (indicator.indicatorCode.includes('UNEMPLOYMENT')) {
        processed.unemployment = parseFloat(indicator.value);
      } else if (indicator.indicatorCode.includes('INFLATION')) {
        processed.inflation = parseFloat(indicator.value);
      } else if (indicator.indicatorCode.includes('DEBT_GDP')) {
        processed.debtToGDP = parseFloat(indicator.value);
      }
    });

    return processed;
  }

  // Calculate risk factors for each indicator
  calculateRiskFactors(indicators) {
    const riskFactors = {};

    Object.keys(indicators).forEach(key => {
      const value = indicators[key];
      if (value !== null) {
        riskFactors[key] = this.assessIndicatorRisk(key, value);
      }
    });

    return riskFactors;
  }

  // Assess risk level for individual indicator
  assessIndicatorRisk(indicatorType, value) {
    const thresholds = this.thresholds[indicatorType];
    if (!thresholds) return { level: 'unknown', score: 0 };

    let level, score;

    switch (indicatorType) {
      case 'gdpGrowth':
        if (value <= thresholds.critical) { level = 'critical'; score = 4; }
        else if (value <= thresholds.high) { level = 'high'; score = 3; }
        else if (value <= thresholds.medium) { level = 'medium'; score = 2; }
        else { level = 'low'; score = 1; }
        break;

      case 'unemployment':
      case 'inflation':
      case 'debtToGDP':
        if (value >= thresholds.critical) { level = 'critical'; score = 4; }
        else if (value >= thresholds.high) { level = 'high'; score = 3; }
        else if (value >= thresholds.medium) { level = 'medium'; score = 2; }
        else { level = 'low'; score = 1; }
        break;

      default:
        level = 'unknown'; score = 0;
    }

    return { level, score, value };
  }

  // Calculate overall risk score
  calculateOverallRisk(riskFactors) {
    const scores = Object.values(riskFactors).map(rf => rf.score || 0);
    if (scores.length === 0) return { level: 'unknown', score: 0 };

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    let level;

    if (avgScore >= 3.5) level = 'critical';
    else if (avgScore >= 2.5) level = 'high';
    else if (avgScore >= 1.5) level = 'medium';
    else level = 'low';

    return { level, score: Math.round(avgScore * 100) / 100 };
  }

  // Determine alert level based on risk
  determineAlertLevel(overallRisk) {
    const levelMap = {
      'critical': 'Red',
      'high': 'Orange',
      'medium': 'Yellow',
      'low': 'Green'
    };
    return levelMap[overallRisk.level] || 'Green';
  }

  // Generate recommendations based on risk factors
  generateRecommendations(riskFactors) {
    const recommendations = [];

    Object.entries(riskFactors).forEach(([indicator, risk]) => {
      if (risk.level === 'critical' || risk.level === 'high') {
        const rec = this.getIndicatorRecommendation(indicator, risk.level);
        if (rec) recommendations.push(rec);
      }
    });

    return recommendations;
  }

  // Get specific recommendations for indicators
  getIndicatorRecommendation(indicator, level) {
    const recommendations = {
      gdpGrowth: {
        critical: 'Implement immediate fiscal stimulus and monetary policy interventions',
        high: 'Consider counter-cyclical fiscal measures and investment in infrastructure'
      },
      unemployment: {
        critical: 'Launch emergency job creation programs and unemployment benefits',
        high: 'Enhance job training programs and support small business employment'
      },
      inflation: {
        critical: 'Implement tight monetary policy and price stabilization measures',
        high: 'Monitor price pressures and adjust interest rates accordingly'
      },
      debtToGDP: {
        critical: 'Urgent debt restructuring and fiscal consolidation required',
        high: 'Implement medium-term fiscal consolidation plan'
      }
    };

    return recommendations[indicator]?.[level] || null;
  }

  // Detect potential crises across all countries
  async detectGlobalRisks() {
    try {
      const countries = ['USA', 'CHN', 'JPN', 'DEU', 'GBR', 'FRA', 'IND', 'BRA', 'RUS', 'CAN'];
      const analyses = [];

      for (const countryCode of countries) {
        const analysis = await this.analyzeCountryRisk(countryCode);
        analyses.push(analysis);
      }

      // Sort by risk level
      analyses.sort((a, b) => b.overallRisk.score - a.overallRisk.score);

      return {
        timestamp: new Date(),
        globalRiskLevel: this.calculateGlobalRiskLevel(analyses),
        countryAnalyses: analyses,
        summary: this.generateGlobalSummary(analyses)
      };
    } catch (error) {
      console.error('Error detecting global risks:', error);
      throw error;
    }
  }

  // Calculate global risk level
  calculateGlobalRiskLevel(analyses) {
    const avgScore = analyses.reduce((sum, a) => sum + a.overallRisk.score, 0) / analyses.length;
    
    if (avgScore >= 3.0) return 'Critical';
    else if (avgScore >= 2.0) return 'High';
    else if (avgScore >= 1.5) return 'Medium';
    else return 'Low';
  }

  // Generate global summary
  generateGlobalSummary(analyses) {
    const critical = analyses.filter(a => a.overallRisk.level === 'critical').length;
    const high = analyses.filter(a => a.overallRisk.level === 'high').length;
    const medium = analyses.filter(a => a.overallRisk.level === 'medium').length;
    const low = analyses.filter(a => a.overallRisk.level === 'low').length;

    return {
      totalCountries: analyses.length,
      riskDistribution: { critical, high, medium, low },
      highestRiskCountry: analyses[0]?.countryCode,
      lowestRiskCountry: analyses[analyses.length - 1]?.countryCode
    };
  }
}

module.exports = new CrisisDetectionService();
