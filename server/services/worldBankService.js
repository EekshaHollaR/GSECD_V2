const axios = require('axios');
const EconomicIndicator = require('../models/EconomicIndicator');

class WorldBankService {
  constructor() {
    this.baseURL = 'https://api.worldbank.org/v2';
    this.defaultParams = {
      format: 'json',
      per_page: 1000
    };
  }

  // Get available indicators
  async getIndicators() {
    try {
      const response = await axios.get(`${this.baseURL}/indicators`, {
        params: this.defaultParams
      });
      
      return response.data[1]; // World Bank API returns [metadata, data]
    } catch (error) {
      console.error('World Bank indicators fetch error:', error);
      throw new Error('Failed to fetch World Bank indicators');
    }
  }

  // Fetch data for specific indicator and countries
  async fetchIndicatorData(indicatorCode, countries = 'all', dateRange = '2010:2023') {
    try {
      const url = `${this.baseURL}/country/${countries}/indicator/${indicatorCode}`;
      
      const response = await axios.get(url, {
        params: {
          ...this.defaultParams,
          date: dateRange
        }
      });

      if (!response.data[1]) {
        return [];
      }

      return response.data[1].map(item => ({
        indicatorCode: item.indicator.id,
        indicatorName: item.indicator.value,
        countryCode: item.country.id,
        year: parseInt(item.date),
        value: item.value,
        unit: item.unit || '',
        sourceOrganization: 'World Bank',
        category: this.categorizeIndicator(item.indicator.id),
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error(`World Bank data fetch error for ${indicatorCode}:`, error);
      throw error;
    }
  }

  // Categorize indicators based on their codes
  categorizeIndicator(indicatorCode) {
    const categoryMap = {
      'NY.GDP': 'GDP',
      'SL.UEM': 'Employment',
      'FP.CPI': 'Inflation',
      'NE.TRD': 'Trade',
      'GC.DOD': 'Government',
      'SP.POP': 'Social',
      'SP.DYN': 'Social',
      'SE.': 'Social',
      'SH.': 'Social'
    };

    for (const [prefix, category] of Object.entries(categoryMap)) {
      if (indicatorCode.startsWith(prefix)) {
        return category;
      }
    }
    
    return 'Other';
  }

  // Bulk insert indicators into database
  async saveIndicators(indicators) {
    try {
      const validIndicators = indicators.filter(indicator => 
        indicator.value !== null && 
        indicator.value !== undefined &&
        !isNaN(indicator.value)
      );

      if (validIndicators.length === 0) {
        return { inserted: 0, errors: 0 };
      }

      // Use upsert to avoid duplicates
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
      console.error('Error saving World Bank indicators:', error);
      throw error;
    }
  }

  // Sync key economic indicators
  async syncKeyIndicators(countries = ['USA', 'CHN', 'JPN', 'DEU', 'GBR']) {
    const keyIndicators = [
      'NY.GDP.MKTP.CD', // GDP (current US$)
      'NY.GDP.PCAP.CD', // GDP per capita (current US$)
      'SL.UEM.TOTL.ZS', // Unemployment, total (% of total labor force)
      'FP.CPI.TOTL.ZG', // Inflation, consumer prices (annual %)
      'NE.TRD.GNFS.ZS', // Trade (% of GDP)
      'GC.DOD.TOTL.GD.ZS', // Central government debt, total (% of GDP)
      'SP.POP.TOTL' // Population, total
    ];

    const results = [];
    
    for (const indicator of keyIndicators) {
      try {
        console.log(`Syncing World Bank indicator: ${indicator}`);
        const data = await this.fetchIndicatorData(indicator, countries.join(';'));
        const saveResult = await this.saveIndicators(data);
        
        results.push({
          indicator,
          success: true,
          count: saveResult.inserted
        });
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to sync indicator ${indicator}:`, error);
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

module.exports = new WorldBankService();
