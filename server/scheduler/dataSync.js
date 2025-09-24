const cron = require('node-cron');
const worldBankService = require('../services/worldBankService');
const imfService = require('../services/imfService');
const EconomicIndicator = require('../models/EconomicIndicator');
const Alert = require('../models/Alert');

// Thresholds for alerts (example)
const ALERT_THRESHOLDS = {
  GDP_GROWTH: -2,        // trigger if GDP growth ≤ -2%
  UNEMPLOYMENT: 10,      // trigger if unemployment ≥ 10%
  INFLATION: 8,          // trigger if inflation ≥ 8%
  DEBT_GDP: 100          // trigger if debt-to-GDP ≥ 100%
};


const syncData = async () => {

  console.log('Data sync started:', new Date().toISOString());
  try {
    
    // 1. Fetch data from World Bank
    const wbData = await worldBankService.fetchLatestIndicators();
    // 2. Fetch data from IMF
    const imfData = await imfService.fetchLatestIndicators();

    // Combine sources
    const allData = [...wbData, ...imfData];

    for (const item of allData) {
      // Upsert economic indicator
      await EconomicIndicator.findOneAndUpdate(
        {
          countryCode: item.countryCode,
          indicatorCode: item.indicatorCode,
          year: item.year
        },
        {
          ...item,
          lastUpdated: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Check thresholds and create Alert if needed
      const threshold = ALERT_THRESHOLDS[item.indicatorCode];
      if (threshold !== undefined) {
        const value = parseFloat(item.value);
        const isAlert = (
          ['UNEMPLOYMENT','INFLATION','DEBT_GDP'].includes(item.indicatorCode)
            ? value >= threshold
            : value <= threshold
        );
        if (isAlert) {
          await Alert.create({
            title: `Threshold Alert: ${item.indicatorName}`,
            message: `${item.countryCode} ${item.indicatorName} = ${value}${item.unit}, exceeded threshold of ${threshold}${item.unit}`,
            severity: 'High',
            type: 'Economic',
            countryCode: item.countryCode,
            triggerData: {
              indicatorCode: item.indicatorCode,
              threshold,
              actualValue: value
            }
          });
        }
      }
    }

    console.log('Data sync completed');
  } catch (error) {
    console.error('Data sync error:', error);
  }
};

// Schedule to run at 2:00 AM every day
cron.schedule('0 2 * * *', () => {
  syncData();
});

module.exports = { syncData };
