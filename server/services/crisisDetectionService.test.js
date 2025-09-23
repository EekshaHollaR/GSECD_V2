const crisisDetection = require('./crisisDetectionService');

describe('CrisisDetectionService', () => {
  it('should assess low risk for high GDP growth', () => {
    const { level, score } = crisisDetection.assessIndicatorRisk('gdpGrowth', 5.0);
    expect(level).toBe('low');
    expect(score).toBe(1);
  });

  it('should assess critical risk for high unemployment', () => {
    const { level, score } = crisisDetection.assessIndicatorRisk('unemployment', 15.0);
    expect(level).toBe('critical');
    expect(score).toBe(4);
  });

  it('should calculate overall risk correctly', () => {
    const factors = {
      gdpGrowth: { score: 1 },
      unemployment: { score: 4 },
      inflation: { score: 3 },
      debtToGDP: { score: 2 }
    };
    const overall = crisisDetection.calculateOverallRisk(factors);
    expect(overall.level).toBe('high');
    expect(overall.score).toBeCloseTo((1+4+3+2)/4, 2);
  });
});
