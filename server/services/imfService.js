const axios = require('axios');
const EconomicIndicator = require('../models/EconomicIndicator');

class IMFService {
  constructor() {
    this.baseURL = 'https://www.imf.org/external/datamapper/api/v1';
  }

  // Get available indicators from IMF
  async getIndicators() {
    try {
      const response = await axios.get(`${this.baseURL}/indicators`);
      return response.data.indicators;
    } catch (error) {
      console.error('IMF indicators fetch error:', error);
      throw new Error('Failed to fetch IMF indicators');
    }
  }

  // Fetch indicator data for specific countries
  async fetchIndicatorData(indicatorCode, countries = null) {
    try {
      let url = `${this.baseURL}/${indicatorCode}`;
      
      if (countries && countries.length > 0) {
        url += `/${countries.join(',')}`;
      }

      const response = await axios.get(url);
      
      if (!response.data.values) {
        return [];
      }

      const results = [];
      
      // Parse IMF data structure
      Object.entries(response.data.values).forEach(([indicatorKey, countryData]) => {
        Object.entries(countryData).forEach(([countryCode, yearData]) => {
          Object.entries(yearData).forEach(([year, value]) => {
            if (value !== null && !isNaN(value)) {
              results.push({
                indicatorCode: indicatorCode,
                indicatorName: this.getIndicatorName(indicatorCode),
                countryCode: countryCode,
                year: parseInt(year),
                value: parseFloat(value),
                unit: this.getIndicatorUnit(indicatorCode),
                sourceOrganization: 'IMF',
                category: this.categorizeIMFIndicator(indicatorCode),
                lastUpdated: new Date()
              });
            }
          });
        });
      });

      return results;
    } catch (error) {
      console.error(`IMF data fetch error for ${indicatorCode}:`, error);
      throw error;
    }
  }

  // Get indicator name mapping
  getIndicatorName(indicatorCode) {
    const nameMap = {
      'NGDP_RPCH': 'Real GDP growth',
      'NGDPD': 'Nominal GDP (USD billions)',
      'NGDPDPC': 'GDP per capita (USD)',
      'LUR': 'Unemployment rate',
      'PCPIPCH': 'Inflation rate',
      'GGR_NGDP': 'General government revenue (% of GDP)',
      'GGX_NGDP': 'General government expenditure (% of GDP)',
      'GGXCNL_NGDP': 'General government net lending/borrowing (% of GDP)'
    };

    return nameMap[indicatorCode] || indicatorCode;
  }

  // Get indicator unit mapping
  getIndicatorUnit(indicatorCode) {
    const unitMap = {
      'NGDP_RPCH': 'Percent change',
      'NGDPD': 'USD billions',
      'NGDPDPC': 'USD',
      'LUR': 'Percent',
      'PCPIPCH': 'Percent change',
      'GGR_NGDP': 'Percent of GDP',
      'GGX_NGDP': 'Percent of GDP',
      'GGXCNL_NGDP': 'Percent of GDP'
    };

    return unitMap[indicatorCode] || '';
  }

  // Categorize IMF indicators
  categorizeIMFIndicator(indicatorCode) {
    const categoryMap = {
      'NGDP': 'GDP',
      'LUR': 'Employment',
      'PCPI': 'Inflation',
      'GG': 'Government',
      'CA': 'Trade',
      'BCA': 'Trade'
    };

    for (const [prefix, category] of Object.entries(categoryMap)) {
      if (indicatorCode.startsWith(prefix)) {
        return category;
      }
    }

    return 'Other';
  }

  // Save indicators to database
  async saveIndicators(indicators) {
    try {
      const validIndicators = indicators.filter(indicator => 
        indicator.value !== null && 
        !isNaN(indicator.value)
      );

      if (validIndicators.length === 0) {
        return { inserted: 0, errors: 0 };
      }

      const bulkOps = validIndicators.map(indicator => ({
        updateOne: {
          filter: {
            indicatorCode: indicator.indicatorCode,
            countryCode: indicator.countryCode,
            year: indicator.year
          },
          update: { $set: indicator },
          upsert: true
        }
      }));

      const result = await EconomicIndicator.bulkWrite(bulkOps);
      
      return {
        inserted: result.upsertedCount + result.modifiedCount,
        errors: 0
      };
    } catch (error) {
      console.error('Error saving IMF indicators:', error);
      throw error;
    }
  }

  // Sync key IMF indicators
  async syncKeyIndicators(countries = ['US', 'CN', 'JP', 'DE', 'GB']) {
    const keyIndicators = [
      'NGDP_RPCH', // Real GDP growth
      'NGDPD', // Nominal GDP
      'NGDPDPC', // GDP per capita
      'LUR', // Unemployment rate
      'PCPIPCH', // Inflation rate
      'GGR_NGDP', // Government revenue
      'GGX_NGDP', // Government expenditure
      'GGXCNL_NGDP' // Government balance
    ];

    const results = [];

    for (const indicator of keyIndicators) {
      try {
        console.log(`Syncing IMF indicator: ${indicator}`);
        const data = await this.fetchIndicatorData(indicator, countries);
        const saveResult = await this.saveIndicators(data);
        
        results.push({
          indicator,
          success: true,
          count: saveResult.inserted
        });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to sync IMF indicator ${indicator}:`, error);
        results.push({
          indicator,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = new IMFService();
