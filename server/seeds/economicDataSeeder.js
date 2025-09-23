const EconomicIndicator = require('../models/EconomicIndicator');
const { countryData } = require('./countrySeeder');

const generateSampleEconomicData = () => {
  const indicators = [
    { code: 'GDP_GROWTH', name: 'GDP Growth Rate', category: 'GDP', unit: '%', source: 'World Bank' },
    { code: 'UNEMPLOYMENT', name: 'Unemployment Rate', category: 'Employment', unit: '%', source: 'World Bank' },
    { code: 'INFLATION', name: 'Inflation Rate', category: 'Inflation', unit: '%', source: 'World Bank' },
    { code: 'DEBT_GDP', name: 'Government Debt to GDP', category: 'Government', unit: '%', source: 'IMF' },
    { code: 'TRADE_BALANCE', name: 'Trade Balance', category: 'Trade', unit: 'USD Billions', source: 'World Bank' }
  ];

  const data = [];
  const currentYear = new Date().getFullYear();

  countryData.forEach(country => {
    indicators.forEach(indicator => {
      for (let year = currentYear - 5; year <= currentYear; year++) {
        // Generate realistic sample data based on country and indicator
        let value = generateRealisticValue(country.countryCode, indicator.code, year);
        
        data.push({
          indicatorCode: indicator.code,
          indicatorName: indicator.name,
          countryCode: country.countryCode,
          year: year,
          value: value,
          unit: indicator.unit,
          sourceOrganization: indicator.source,
          category: indicator.category,
          lastUpdated: new Date(),
          isProjected: year === currentYear,
          confidence: year === currentYear ? 'Medium' : 'High'
        });
      }
    });
  });

  return data;
};

const generateRealisticValue = (countryCode, indicatorCode, year) => {
  // Generate realistic economic data based on country patterns
  const baseValues = {
    'GDP_GROWTH': { 'USA': 2.5, 'CHN': 6.5, 'JPN': 1.2, 'DEU': 1.8, 'GBR': 2.1, 'FRA': 1.7, 'IND': 7.2, 'BRA': 2.3, 'RUS': 1.5, 'CAN': 2.2 },
    'UNEMPLOYMENT': { 'USA': 5.5, 'CHN': 4.0, 'JPN': 2.8, 'DEU': 6.2, 'GBR': 4.5, 'FRA': 8.5, 'IND': 3.5, 'BRA': 11.2, 'RUS': 5.8, 'CAN': 6.5 },
    'INFLATION': { 'USA': 2.1, 'CHN': 2.5, 'JPN': 0.5, 'DEU': 1.8, 'GBR': 2.3, 'FRA': 1.9, 'IND': 4.5, 'BRA': 6.8, 'RUS': 8.2, 'CAN': 2.0 },
    'DEBT_GDP': { 'USA': 108.0, 'CHN': 55.0, 'JPN': 256.0, 'DEU': 69.0, 'GBR': 85.0, 'FRA': 98.0, 'IND': 72.0, 'BRA': 89.0, 'RUS': 18.0, 'CAN': 89.0 },
    'TRADE_BALANCE': { 'USA': -850, 'CHN': 535, 'JPN': 32, 'DEU': 285, 'GBR': -138, 'FRA': -84, 'IND': -102, 'BRA': 48, 'RUS': 195, 'CAN': 22 }
  };

  let baseValue = baseValues[indicatorCode]?.[countryCode] || 0;
  // Add some yearly variation
  const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
  return Math.round((baseValue * (1 + variation)) * 100) / 100;
};

const seedEconomicData = async () => {
  try {
    await EconomicIndicator.deleteMany({});
    console.log('Existing economic indicators cleared');
    
    const economicData = generateSampleEconomicData();
    const indicators = await EconomicIndicator.insertMany(economicData);
    console.log(`${indicators.length} economic indicators seeded successfully`);
    
    return indicators;
  } catch (error) {
    console.error('Economic data seeding error:', error);
    throw error;
  }
};

module.exports = { seedEconomicData, generateSampleEconomicData };
